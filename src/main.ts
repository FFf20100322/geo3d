import {
  ApiError,
  buildScene,
  CancelledError,
  fetchBalance,
  getKey,
  listProblems,
  readProblem,
  setAbortSignal,
  setKey,
  solveProblem,
  type OcrResult,
  type ProblemCandidate,
} from './deepseek'
import { closestParamOnSegment, faceParams, rayPlaneHit, type Ray } from './drag'
import { arcShape, buildAnnotation, suggestRadius, type AnnotationShape } from './annotation'
import { createHistory, type HistoryRecord } from './history'
import { DEMO_PROBLEM, DEMO_SCENE, DEMO_SOLUTION } from './demo'
import { checkFacesPlanar, edgeKey, faceKey, parseScene, toRenderable, type Scene } from './scene'
import { mountScene3d } from './scene3d'
import { mergeSolution, parseSolution, stepTimeline, type Solution } from './solution'
import { isMoving, reevaluate, solve, type Vec3 } from './solver'

/** 应用外壳：视图切换、拍照取题面、选题、生成 3D、解题过程、历史存档、设置页。3D 部分在 scene3d.ts。 */

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T

const views = {
  photo: $('view-photo'),
  pick: $('view-pick'),
  text: $('view-text'),
  solution: $('view-solution'),
  history: $('view-history'),
  settings: $('view-settings'),
} as const
type ViewName = keyof typeof views

const scene = mountScene3d($('app'), $('labels'), $('hint'))
const history = createHistory(localStorage)

// 拖点回调：按在动点上才触发，按在别处由渲染层交还给视角旋转
if (scene) {
  scene.onDragRay = dragMoving
}

/** 当前这张照片的缩略图，存历史时要用 */
let currentThumb: string | undefined
/** 当前打开的那条历史记录，用来在原记录上更新而不是新增一条 */
let currentRecordId: string | undefined
/** 当前这道题已经建好的场景（不含辅助线）。解题过程要挂在它上面。 */
let currentScene: Scene | undefined
function show(v: ViewName | '3d') {
  for (const [name, el] of Object.entries(views)) el.classList.toggle('on', name === v)
  onSceneView = v === '3d'
  scene?.setActive(onSceneView)
  updateCaption(onSceneView)
  syncSceneChrome()
}

/** 当前是不是停在 3D 页 */
let onSceneView = false

/**
 * 「看」与「调」两种模式。
 * 3D 页要同时承担看模型、调参数、看解题步骤几件事，手机屏幕摆不下，
 * 所以默认只留干净的画面加一条题面；点「调节」才把控制区唤出来，同时渲染区自动缩小让位。
 */
let editMode = false

function setEditMode(on: boolean): void {
  editMode = on
  syncSceneChrome()
}

/** 换了图形之后挑一个默认模式：有动点的直接进调节模式，没动点的只看 */
function pickDefaultMode(): void {
  editMode = movingPoints().length > 0
  dynOpen = false
  dynRowsDirty = true
}

/** 3D 页上所有控件的显隐总调度。改这一页的版式只需要动这里。 */
function syncSceneChrome(): void {
  const moving = (currentScene?.points ?? []).filter(isMoving)
  // 登记哪些点能被手指抓住（命中判定用的是实时坐标，拖完不用重新登记）
  scene?.setGrabbables(moving.map((p) => p.name))

  $('scene-tools').style.display = onSceneView ? 'flex' : 'none'
  $('mode-toggle').textContent = editMode ? '完成' : '调节'

  const canTune = onSceneView && editMode && moving.length > 0
  $('dyn-toggle').style.display = canTune && !dynOpen ? 'block' : 'none'

  const panelOpen = canTune && dynOpen
  $('dyn-panel').style.display = panelOpen ? 'flex' : 'none'
  if (panelOpen && dynRowsDirty) {
    renderDynRows(moving)
    dynRowsDirty = false
  }

  $('player').style.display = onSceneView && editMode && currentSolution ? 'block' : 'none'
  updateAnnotButton()
  syncViewInset()
}

// ---- 角度标注 ----
/**
 * 标注分三档，用一个按钮循环。
 * 依据是你先前定的「线面角与二面角默认不画」——这两类要多补射影线和平面角，
 * 一上来就全画出来会把图挤乱，所以默认只画最常见的线线角。
 */
const ANNOT_LABELS = ['标注', '标注：常见', '标注：全部']
let annotMode: 0 | 1 | 2 = 0
let currentAnnotations: { shape: AnnotationShape; kind: string }[] = []

/** 按当前档位决定画哪些 */
function shownAnnotations(): AnnotationShape[] {
  if (annotMode === 0) return []
  return currentAnnotations.filter((a) => annotMode === 2 || a.kind === 'lineLine').map((a) => a.shape)
}

/** 按当前坐标重算所有角度标注。动点一动角度会变，所以要跟着重算。 */
function refreshAnnotations(): void {
  const base = currentScene
  const sol = currentSolution
  const pts = currentSolvedAll
  currentAnnotations = []
  const doubts: string[] = []
  if (base && sol && pts && sol.angles.length) {
    const radius = suggestRadius(Object.values(pts))
    const at = (n: string) => pts[n]
    for (const spec of sol.angles) {
      const a = buildAnnotation(spec, at, radius)
      if (!a) continue
      // 模型报的值没通过反验：图上用的是本地算的数，但要让用户知道有这么回事
      if (a.verified === false) doubts.push(`${spec.label ?? '某个角'}：${a.mismatch ?? '对不上'}`)
      currentAnnotations.push({ shape: arcShape(a, radius), kind: spec.kind })
    }
  }
  scene?.setAnnotations(shownAnnotations())
  annotDoubts = doubts
  updateAnnotButton()
}

/** 标注里有几个角的值没通过反验 */
let annotDoubts: string[] = []

function updateAnnotButton(): void {
  const btn = $('annot-toggle')
  btn.style.display = onSceneView && currentAnnotations.length ? 'block' : 'none'
  const base = ANNOT_LABELS[annotMode] ?? '标注'
  btn.textContent = annotMode > 0 && annotDoubts.length ? `${base} · ${annotDoubts.length}项存疑` : base
  btn.title = annotDoubts.length ? annotDoubts.join('\n') : '点一下切换：关 / 只常见角 / 全部角'
}

/** 当前渲染场景里所有点的坐标，拖动动点时以它为基准重算 */
let currentSolvedAll: Record<string, Vec3> | undefined

/** 动点面板：默认收起，主要交互是直接用手指拖；这里只是精确调节的备用入口 */
let dynOpen = false
/** 场景换过之后需要重建面板里的行 */
let dynRowsDirty = true

/** 面板里每一行都能把自己的显示值刷新一遍（拖动动点时用） */
type PanelRow = { sync: () => void }
let panelRows: PanelRow[] = []

function syncPanelValues(): void {
  for (const r of panelRows) r.sync()
}

function renderDynRows(moving: ReturnType<typeof movingPoints>): void {
  const body = $('dyn-body')
  body.innerHTML = ''
  panelRows = []

  /**
   * 一行 = 标题 + 数值输入 + 滑杆 + 换算读数。
   * 参数本身固定是 0 到 1，但给用户输入的是更有意义的那个量（例如「距 B 的长度」），
   * 两边靠 toParam / toInput 互相换算。
   */
  const paramRow = (opts: {
    get: () => number
    set: (param: number) => void
    /** 输入框里显示与接受的数值范围 */
    min: number
    max: number
    label: string
    /** 换算读数，让用户知道自己拖到哪了 */
    read: (param: number) => string
  }) => {
    const { get, set, min, max, label, read } = opts
    const toParam = (shown: number) => Math.min(1, Math.max(0, (shown - min) / (max - min || 1)))
    const toShown = (param: number) => min + param * (max - min)

    const box = document.createElement('div')
    box.className = 'dyn-row'

    const top = document.createElement('div')
    top.className = 'dyn-top'
    const lab = document.createElement('label')
    lab.textContent = label
    const num = document.createElement('input')
    num.type = 'number'
    num.inputMode = 'decimal'
    num.step = '0.1'
    num.min = String(min)
    num.max = String(max)
    top.append(lab, num)

    const range = document.createElement('input')
    range.type = 'range'
    range.min = '0'
    range.max = '1'
    range.step = '0.005'

    const info = document.createElement('div')
    info.className = 'dyn-read'

    const apply = (param: number) => {
      set(Math.min(1, Math.max(0, param)))
      applyMoving(true)
    }

    const sync = () => {
      const param = get()
      // 正在输入的框不要回写，否则光标会跳
      if (document.activeElement !== num) num.value = String(Number(toShown(param).toFixed(4)))
      if (document.activeElement !== range) range.value = String(param)
      info.textContent = read(param)
    }

    range.addEventListener('input', () => {
      apply(Number(range.value))
      sync()
    })
    // 按住滑杆就开始专注：面板只留这一条，3D 区域随之变大，能一边拖一边看模型
    range.addEventListener('pointerdown', () => setDynFocus(box))
    num.addEventListener('input', () => {
      const v = Number(num.value)
      if (!num.value.trim() || !Number.isFinite(v)) return
      apply(toParam(v))
      sync()
    })
    // 写完离开输入框时把越界的值夹回来
    num.addEventListener('blur', () => sync())

    box.append(top, range, info)
    body.appendChild(box)
    panelRows.push({ sync })
    sync()
  }

  for (const d of moving) {
    if (d.kind === 'onSegment') {
      const start = d.of[0]
      const span = spanBetween(start, d.of[1])
      paramRow({
        get: () => d.t,
        set: (p) => {
          d.t = p
        },
        min: 0,
        max: span,
        label: `${d.name} 在棱 ${d.of.join('')} 上 · 距 ${start} 的长度`,
        read: (p) => `${start}${d.name} = ${(p * span).toFixed(3)}　（占全长的 ${(p * 100).toFixed(1)}%）`,
      })
    } else if (d.kind === 'inFace') {
      /**
       * 面内的点用「到两条边的距离」来表示，而不是内部那两个参数。
       * 面的顶点按顺序是 V0V1V2(V3)：沿 V0→V1 挪，就是离边 V0V3 越来越远；
       * 沿 V0→V3 挪，就是离边 V0V1 越来越远。这样填进去的数就是图上能量出来的长度。
       */
      const quad = d.face.length === 4
      const along1 = quad ? [d.face[0], d.face[3]] : [d.face[0], d.face[2]]
      const along2 = [d.face[0], d.face[1]]
      const span1 = spanBetween(along1[0], along1[1])
      const span2 = spanBetween(along2[0], along2[1])
      const base = d.face.join('')

      paramRow({
        get: () => d.u,
        set: (p) => {
          d.u = p
        },
        min: 0,
        max: span1,
        label: `${d.name} 在面 ${base} 内 · 距边 ${along1.join('')}`,
        read: (p) => `距 ${along1.join('')} = ${(p * span1).toFixed(3)}　（面内横向 ${(p * 100).toFixed(1)}%）`,
      })
      paramRow({
        get: () => d.v,
        set: (p) => {
          d.v = p
        },
        min: 0,
        max: span2,
        label: `${d.name} 在面 ${base} 内 · 距边 ${along2.join('')}`,
        read: (p) => `距 ${along2.join('')} = ${(p * span2).toFixed(3)}　（面内纵向 ${(p * 100).toFixed(1)}%）`,
      })
    }
  }
}

/** 3D 页上的动点 */
function movingPoints() {
  return (currentScene?.points ?? []).filter(isMoving)
}

/** 两点之间的实际长度，用来把参数换算成可读的长度 */
function spanBetween(a: string, b: string): number {
  const p = currentSolvedAll?.[a]
  const q = currentSolvedAll?.[b]
  if (!p || !q) return 1
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) || 1
}

/**
 * 让 3D 渲染区域给周围的浮动控件让位。
 * 读一次布局就能拿到实际高度，所以不必等下一帧。
 *
 * 顶部要让的不只是精确调节面板，还包括右上角那排按钮 —— 以前只算了面板，
 * 结果正方体顶上的 A₁、B₁ 两个点标注正好落在按钮底下（这个是照着手机屏幕才看出来的）。
 * 现在凡是浮在 3D 区上方的东西都把高度算进去，以后再加按钮也不会重犯。
 */
function syncViewInset(): void {
  let top = 0
  for (const id of ['scene-tools', 'dyn-panel']) {
    const el = $(id)
    if (el.style.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.height > 0) top = Math.max(top, r.bottom + 10)
  }

  // 底部这些条子谁最高就以谁为准
  const tops: number[] = []
  for (const id of ['player', 'scene-caption', 'hint']) {
    const el = $(id)
    if (el.style.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.height > 0) tops.push(r.top)
  }
  const bottom = tops.length ? Math.max(0, window.innerHeight - Math.min(...tops) + 10) : 0

  scene?.setViewInset(top, bottom)
}

/** 拖动滑杆时的专注模式：只留正在拖的那一条 */
let focusedRow: HTMLElement | null = null

function setDynFocus(row: HTMLElement | null): void {
  if (focusedRow === row) return
  focusedRow?.classList.remove('dyn-focus')
  focusedRow = row
  focusedRow?.classList.add('dyn-focus')
  $('dyn-panel').classList.toggle('focusing', !!row)
  syncViewInset()
}

// 抬手就退出专注。挂在 window 上是为了防止手指拖到滑杆外面松开时收不到事件。
window.addEventListener('pointerup', () => setDynFocus(null))
window.addEventListener('pointercancel', () => setDynFocus(null))

/**
 * 手指落在动点上：把射线换算成这个动点的参数。
 * 线段动点求「射线上离该线段最近的点」，面内动点求「射线与面的交点」再反解参数。
 */
function dragMoving(name: string, ray: Ray): void {
  if (!currentScene || !currentSolvedAll) return
  const def = currentScene.points.find((p) => p.name === name)

  if (def?.kind === 'onSegment') {
    const a = currentSolvedAll[def.of[0]]
    const b = currentSolvedAll[def.of[1]]
    if (!a || !b) return
    const t = closestParamOnSegment(a, b, ray)
    if (t === null) return // 射线与棱几乎平行，保持不动比乱跳好
    def.t = t
  } else if (def?.kind === 'inFace') {
    const vs = def.face.map((k) => currentSolvedAll?.[k]).filter((v): v is Vec3 => !!v)
    if (vs.length < 3) return
    const hit = rayPlaneHit(ray, vs[0], vs[1], vs[2])
    if (!hit) return
    const uv = faceParams(vs, hit)
    if (!uv) return
    def.u = uv.u
    def.v = uv.v
  } else {
    return
  }
  applyMoving()
}

/**
 * 动点被拖动后，只重算派生点，并把变化了的那几个点交给渲染层更新。
 * 自由点是解出来的，不参与这一步，所以拖多久图形都不会走形。
 */
function applyMoving(fromPanel = false): void {
  if (!currentScene || !currentSolvedAll) return
  const next = reevaluate(currentScene.points, currentSolvedAll)
  const changed: Record<string, Vec3> = {}
  for (const [name, p] of Object.entries(next)) {
    const old = currentSolvedAll[name]
    if (!old || old[0] !== p[0] || old[1] !== p[1] || old[2] !== p[2]) {
      changed[name] = p
      currentSolvedAll[name] = p
    }
  }
  if (Object.keys(changed).length) scene?.setPositions(changed)
  // 角度会随动点变化，所以标注要跟着重算（scene3d 内部就地复用对象，不会每帧新建）
  if (annotMode > 0) refreshAnnotations()
  // 手指拖动时面板要跟着刷新；从面板自己改的就不用刷（正在输入的框会被跳过）
  if (!fromPanel) syncPanelValues()
}

/**
 * 3D 页底部那条说明：告诉你在看哪道题，同时也是去另一页的入口。
 * 有解答时点它去解题过程（这时候再去文字页没意义），没解答时才回文字页改题面。
 */
function updateCaption(onScene: boolean) {
  const cap = $('scene-caption')
  const text = $<HTMLTextAreaElement>('problem-text').value.trim().replace(/\s+/g, ' ')
  if (!onScene || !text) {
    cap.style.display = 'none'
    return
  }
  cap.style.display = 'block'
  const short = text.length > 40 ? `${text.slice(0, 40)}…` : text
  const 去哪 = currentSolution ? '看解题过程' : '改题面'
  cap.textContent = `${short}　▸ ${去哪}`
}

let statusTimer: number | undefined

function say(text: string, kind: '' | 'ok' | 'err' = '') {
  const el = $('status')
  el.textContent = text
  el.className = kind
  // 自己消失。不消失的话它会一直压在最下面那排按钮上（这个是照着手机屏幕才发现的）。
  // 出错的留久一点，免得一眨眼就错过了。
  if (statusTimer) clearTimeout(statusTimer)
  if (text) {
    statusTimer = window.setTimeout(
      () => {
        el.textContent = ''
        el.className = ''
      },
      kind === 'err' ? 15000 : 5000,
    )
  }
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

/**
 * 把照片处理成两版：给模型看的大图，和存历史用的小缩略图。
 * 大图缩到长边 2048、JPEG 0.92 —— 模型看到的图本来就会被缩到约 1300，
 * 所以这个上限不会丢掉任何模型能看见的细节，纯粹是省上传流量。
 */
async function prepareImage(file: File): Promise<{ full: string; thumb: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const draw = (maxSide: number, quality: number) => {
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const ctx = cv.getContext('2d')
    if (!ctx) throw new Error('这台设备没能处理图片。')
    ctx.drawImage(bmp, 0, 0, w, h)
    return cv.toDataURL('image/jpeg', quality)
  }
  const full = draw(2048, 0.92)
  const thumb = draw(360, 0.6)
  bmp.close()
  return { full, thumb }
}

function fillText(result: OcrResult) {
  $<HTMLTextAreaElement>('problem-text').value = result.problemText
  $<HTMLTextAreaElement>('extra').value = ''
  currentRecordId = undefined

  // 点清单是防「下标被认丢」的主要手段：漏了下标在这里一眼就能看出来
  const pts = $('points')
  if (result.points.length) {
    pts.innerHTML = ''
    const head = document.createElement('div')
    head.className = 'pt-head'
    head.textContent = `识别到 ${result.points.length} 个点，请核对有没有漏下标`
    const list = document.createElement('div')
    list.className = 'pt-list'
    list.textContent = result.points.join('  ')
    const warn = document.createElement('div')
    warn.className = 'pt-warn'
    warn.textContent = '如果该有下标的点变成了光秃秃的字母（例如应有 A₁ 却只有 A），说明下标没认出来，请在下面改回来。'
    pts.append(head, list, warn)
  } else {
    pts.textContent = ''
  }

  const box = $('uncertain')
  box.innerHTML = ''
  if (result.uncertain.length) box.textContent = `这几处我没把握，你核对一下：${result.uncertain.join('；')}`
  say('识别完成，请核对文字。', 'ok')
  show('text')
  autoSave() // 识别出来就自动存一条，哪怕后面 3D 没建出来也不会白拍
}

/** 自动存档：题目文字与补充条件一变就存，同一道题是更新不是新增 */
function autoSave(sceneData?: Scene, solution?: Solution): void {
  const problemText = $<HTMLTextAreaElement>('problem-text').value.trim()
  if (!problemText) return
  try {
    const rec = history.save({
      id: currentRecordId,
      problemText,
      extra: $<HTMLTextAreaElement>('extra').value,
      thumbnail: currentThumb,
      scene: sceneData,
      solution,
    })
    currentRecordId = rec.id
  } catch {
    say('手机上存不下了，去历史里删掉几条旧的再试。', 'err')
  }
}

async function translate(dataUrl: string, target?: ProblemCandidate) {
  say(target ? `正在转写第 ${target.label} 题…` : '正在转写题面…')
  fillText(await readProblem(dataUrl, target))
}

// ---- 导航 ----
$('nav-photo').onclick = () => show('photo')
$('nav-3d').onclick = () => show('3d')
$('nav-history').onclick = () => {
  renderHistory()
  show('history')
}
const BALANCE_KEY = 'geo3d.balance'

interface CachedBalance {
  at: number
  available: boolean
  lines: string[]
  summary: string
}

function readCachedBalance(): CachedBalance | null {
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<CachedBalance>
    if (typeof p.at === 'number' && typeof p.summary === 'string' && Array.isArray(p.lines)) {
      return { at: p.at, available: !!p.available, lines: p.lines.map(String), summary: p.summary }
    }
  } catch {
    // 存坏了就当没有
  }
  return null
}

function formatBalance(b: CachedBalance): string {
  const when = new Date(b.at).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return [`${b.available ? '✓ 账户可用' : '账户当前不可用'}`, ...b.lines, `更新于 ${when}`].join('\n')
}

/** 顶栏常驻显示 */
function updateTopBalance(): void {
  const el = $('top-balance')
  const cached = readCachedBalance()
  el.textContent = cached ? cached.summary : '余额 --'
  el.style.color = cached && !cached.available ? '#ff7b72' : ''
}

function saveBalance(b: Omit<CachedBalance, 'at'>): void {
  try {
    localStorage.setItem(BALANCE_KEY, JSON.stringify({ ...b, at: Date.now() } satisfies CachedBalance))
  } catch {
    // 存不下就算了，不值得为此报错
  }
  updateTopBalance()
  const cached = readCachedBalance()
  if (cached) $('balance').textContent = formatBalance(cached)
}

/** auto 为真时是自动刷新：失败不覆盖上次的数值，只加一句说明 */
async function refreshBalance(auto: boolean): Promise<void> {
  const out = $('balance')
  if (!getKey()) {
    if (!auto) out.textContent = '还没有填 Key。'
    return
  }
  if (!auto) out.textContent = '正在查询余额…'
  try {
    const b = await fetchBalance()
    saveBalance({ available: b.available, lines: b.lines, summary: b.summary })
  } catch (e) {
    const cached = readCachedBalance()
    if (cached) out.textContent = `${formatBalance(cached)}\n（这次没刷出来：${message(e)}）`
    else out.textContent = message(e)
  }
}

$('nav-settings').onclick = () => {
  $<HTMLInputElement>('api-key').value = getKey()
  // 先把上次查到的额度显示出来，再后台刷新 —— 这样一进设置页就有东西看，不必先点按钮
  const cached = readCachedBalance()
  $('balance').textContent = cached ? formatBalance(cached) : ''
  show('settings')
  void refreshBalance(true)
}
$('btn-back').onclick = () => show('photo')
$('scene-caption').onclick = () => show(currentSolution ? 'solution' : 'text')
$('mode-toggle').onclick = () => setEditMode(!editMode)
$('annot-toggle').onclick = () => {
  annotMode = (((annotMode + 1) % 3) as 0 | 1 | 2)
  scene?.setAnnotations(shownAnnotations())
  updateAnnotButton()
}
$('dyn-toggle').onclick = () => {
  dynOpen = true
  dynRowsDirty = true
  syncSceneChrome()
}
// 收起按钮在面板底部：往上收
$('dyn-collapse').onclick = () => {
  dynOpen = false
  syncSceneChrome()
}

// ---- 设置页 ----
$<HTMLInputElement>('show-key').addEventListener('change', (ev) => {
  $<HTMLInputElement>('api-key').type = (ev.target as HTMLInputElement).checked ? 'text' : 'password'
})

// 保存与查询合成一步，少一个「以为自己保存了其实没保存」的坑
$('btn-test').onclick = async () => {
  setKey($<HTMLInputElement>('api-key').value)
  const out = $('balance')
  if (!getKey()) {
    out.textContent = '还没有填 Key。'
    return
  }
  out.textContent = '正在连接 DeepSeek…'
  await refreshBalance(false)
}

// ---- 拍照 / 相册 ----
$('file-camera').addEventListener('change', onPicked)
$('file-album').addEventListener('change', onPicked)

function onPicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 连续选同一个文件也要能触发 change
  if (file) void handleFile(file)
}

async function handleFile(file: File) {
  if (!getKey()) {
    say('还没填 API Key，先在设置里填上。', 'err')
    show('settings')
    return
  }

  try {
    say('正在处理照片…')
    const { full, thumb } = await prepareImage(file)
    currentThumb = thumb
    const preview = $('photo-preview')
    preview.innerHTML = ''
    const img = document.createElement('img')
    img.src = full
    preview.appendChild(img)

    say('正在找照片里有几道题…')
    const problems = await listProblems(full)

    if (problems.length <= 1) {
      // 照片里只有一道题就直接转写，省掉一次点选
      await translate(full, problems[0])
      return
    }
    renderPick(full, problems)
    show('pick')
  } catch (e) {
    if (e instanceof ApiError) say(e.message, 'err')
    else say(`出错了：${message(e)}`, 'err')
    show('photo')
  }
}

/** 选题页：框只当提示用，点框和点列表等价；识别始终用整张照片，所以框不准也不会漏条件 */
function renderPick(dataUrl: string, problems: ProblemCandidate[]) {
  const holder = $('pick-image')
  holder.innerHTML = ''
  const img = document.createElement('img')
  img.src = dataUrl
  holder.appendChild(img)

  const list = $('pick-list')
  list.innerHTML = ''

  for (const p of problems) {
    const pick = () => {
      void translate(dataUrl, p).catch((e) => say(message(e), 'err'))
    }

    const item = document.createElement('button')
    const head = document.createElement('b')
    head.textContent = `第 ${p.label} 题`
    const body = document.createElement('span')
    body.textContent = p.preview || '（没有取到开头文字）'
    item.append(head, document.createElement('br'), body)
    item.onclick = pick
    list.appendChild(item)

    if (!p.box) continue
    const [x, y, w, h] = p.box
    const box = document.createElement('div')
    box.className = 'box'
    box.style.cssText = `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%`
    const tag = document.createElement('b')
    tag.textContent = p.label
    box.appendChild(tag)
    box.onclick = pick
    holder.appendChild(box)
  }
}

$('btn-repick').onclick = () => {
  say('')
  $('photo-preview').innerHTML = ''
  show('photo')
}

/**
 * 载入内置示例题。
 * 走的是跟正常流程完全一样的那条路（解析 → 求解 → 合并辅助线 → 重新求解），
 * 所以它既能给你测界面，也能当作回归自检的种子（demo.check.ts 跑的就是这同一份数据）。
 */
$('btn-demo').onclick = () => {
  $<HTMLTextAreaElement>('problem-text').value = DEMO_PROBLEM
  $<HTMLTextAreaElement>('extra').value = ''
  $('points').textContent = ''
  $('uncertain').textContent = ''
  currentThumb = undefined
  currentRecordId = undefined
  currentScene = undefined
  currentSolution = undefined
  stopPlay()

  try {
    const parsed = parseScene(DEMO_SCENE)
    const solved = solve(parsed.points, parsed.constraints)
    if (!solved.ok) throw new Error(`示例场景解不出来，最大残差 ${solved.maxError.toExponential(2)}`)

    const sol = parseSolution(DEMO_SOLUTION, parsed)
    const merged = mergeSolution(parsed, sol)
    const reSolved = solve(merged.points, merged.constraints)
    if (!reSolved.ok) throw new Error('加上辅助线后示例图形对不上了')

    currentScene = parsed
    currentSolution = sol
    currentSolvedAll = { ...reSolved.points }
    stepIndex = -1
    scene?.setScene(toRenderable(merged, reSolved.points, parsed))
    pickDefaultMode()
    refreshAnnotations()
    renderSolution(sol)
    $<HTMLButtonElement>('btn-generate').textContent = '重新解题'
    say('已载入内置示例。', 'ok')
    show('solution')
  } catch (e) {
    say(`示例载入失败：${message(e)}`, 'err')
  }
}

$('btn-regen').onclick = () => {
  say('')
  $('photo-preview').innerHTML = ''
  show('photo')
}

// ---- 历史存档 ----
function renderHistory() {
  const list = $('history-list')
  list.innerHTML = ''
  const items = history.list()

  if (!items.length) {
    const empty = document.createElement('p')
    empty.className = 'muted'
    empty.textContent = '还没有存过题。拍一道题、生成 3D 之后会自动存进来；在文字页点「保存这道题」也能存。'
    list.appendChild(empty)
    return
  }

  for (const r of items) {
    const row = document.createElement('div')
    row.className = 'hitem'

    if (r.thumbnail) {
      const img = document.createElement('img')
      img.src = r.thumbnail
      img.alt = ''
      row.appendChild(img)
    } else {
      const ph = document.createElement('div')
      ph.className = 'hph'
      ph.textContent = r.scene ? '3D' : '文字'
      row.appendChild(ph)
    }

    const body = document.createElement('div')
    body.className = 'hbody'
    const title = document.createElement('div')
    title.className = 'htitle'
    title.textContent = r.problemText.replace(/\s+/g, ' ').slice(0, 60) || '（没有题面文字）'
    const meta = document.createElement('div')
    meta.className = 'hmeta'
    const when = new Date(r.savedAt).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    meta.textContent = `${when}　${r.scene ? '有 3D' : '只有文字'}`
    body.append(title, meta)
    row.appendChild(body)

    const del = document.createElement('button')
    del.className = 'hdel'
    del.textContent = '删除'
    del.onclick = (ev) => {
      ev.stopPropagation()
      history.remove(r.id)
      renderHistory()
    }
    row.appendChild(del)

    row.onclick = () => openRecord(r)
    list.appendChild(row)
  }
}

/** 打开一条存档。有场景就直接进 3D，没有就回到文字页。 */
function openRecord(r: HistoryRecord) {
  $<HTMLTextAreaElement>('problem-text').value = r.problemText
  $<HTMLTextAreaElement>('extra').value = r.extra
  $('points').textContent = ''
  $('uncertain').textContent = ''
  currentRecordId = r.id
  currentThumb = r.thumbnail
  currentScene = undefined
  currentSolution = undefined
  say('')

  if (r.scene && scene) {
    try {
      // 只存了场景，坐标是现在重算的 —— 求解只要几毫秒，比起存一份可能过期的坐标更可靠
      const solved = solve(r.scene.points, r.scene.constraints)
      if (solved.ok) {
        currentScene = r.scene
        const merged = r.solution ? mergeSolution(r.scene, r.solution) : r.scene
        const mergedSolved = solve(merged.points, merged.constraints)
        const finalPoints = mergedSolved.ok ? mergedSolved.points : solved.points
        currentSolvedAll = { ...finalPoints }
        scene.setScene(toRenderable(merged, finalPoints, r.scene))
        pickDefaultMode()
        currentSolution = r.solution
        refreshAnnotations()
        syncSceneChrome()
        stepIndex = -1
        stopPlay()
        $<HTMLButtonElement>('btn-generate').textContent = '重新解题'
        if (r.solution) {
          renderSolution(r.solution)
          show('solution')
          return
        }
        show('3d')
        return
      }
    } catch (e) {
      console.warn('[geo3d] 这条存档的场景没能重新解出来', e)
    }
  }
  $<HTMLButtonElement>('btn-generate').textContent = '开始解题'
  show('text')
}

$('btn-clear-history').onclick = () => {
  if (!history.list().length) return
  if (!confirm('确定把存过的题目全部删掉？这个操作没法撤销。')) return
  history.clear()
  renderHistory()
}

/**
 * 建图。这是整条链路的总闸门：
 * 模型出约束 → 本地算坐标 → 逐条回验 → 面还得真的共面。
 * 任何一步不过就升推理档重做，三档都不过就如实说建不出来 —— 绝不展示一张可能错的图。
 */
const EFFORTS = ['low', 'high', 'max'] as const

/** 已经建过图就直接用，没建过就现建。解题过程需要知道图里有哪些点，所以绕不开这一步。 */
async function ensureScene(problemText: string, extra: string): Promise<Scene | null> {
  if (currentScene) return currentScene

  let lastProblem = '未知原因'
  for (const [i, effort] of EFFORTS.entries()) {
    try {
      say(`正在把题目变成几何场景（推理档 ${effort}）…`)
      setProgress(8 + i * 22, `第 ${i + 1} 次尝试建模（推理档 ${effort}）…`)
      const raw = await buildScene(problemText, extra, effort)

      if (raw && typeof raw === 'object' && typeof (raw as { unsupported?: unknown }).unsupported === 'string') {
        throw new Error(`模型说这道题有条件表达不了：${(raw as { unsupported: string }).unsupported}`)
      }

      const parsed = parseScene(raw)
      say('正在解算图形…')
      setProgress(78, '约束已到手，正在解算坐标…')
      const solved = solve(parsed.points, parsed.constraints)
      if (!solved.ok) {
        const worst = [...solved.residuals].sort((a, b) => b.error - a.error).slice(0, 3)
        throw new Error(`解出来的图形不满足这些条件：${worst.map((r) => `${r.desc}（实际 ${r.actual}）`).join('；')}`)
      }

      setProgress(92, '正在逐条回验约束与共面性…')
      const render = toRenderable(parsed, solved.points)
      const notPlanar = checkFacesPlanar(render)
      if (notPlanar.length) throw new Error(`面不对：${notPlanar.join('；')}`)

      currentScene = parsed
      currentSolvedAll = { ...solved.points }
      sceneFromText = textKey() // 记住这份图形是按哪版题面建的
      scene?.setScene(render)
      pickDefaultMode()
      refreshAnnotations()
      syncSceneChrome()
      $<HTMLButtonElement>('btn-generate').textContent = '重新解题'
      autoSave(parsed) // 同一条存档从「只有文字」变成「有 3D」
      return parsed
    } catch (e) {
      if (e instanceof ApiError || e instanceof CancelledError) throw e // 网络、额度之类的错，升档重试没意义
      lastProblem = message(e)
      console.warn(`[geo3d] 推理档 ${effort} 失败：${lastProblem}`)
    }
  }
  throw new Error(lastProblem)
}

/** 后台任务进度条 + 取消 */
let abortCtrl: AbortController | null = null
/** 嵌套计数：开始解题会先建图再解题，两段共用一个可取消的任务 */
let taskDepth = 0

function beginTask(): void {
  if (taskDepth++ > 0) return
  abortCtrl = new AbortController()
  setAbortSignal(abortCtrl.signal)
}

function endTask(): void {
  if (--taskDepth > 0) return
  taskDepth = 0
  abortCtrl = null
  setAbortSignal(undefined)
  setProgress(null)
}

$('progress-cancel').onclick = () => {
  abortCtrl?.abort()
}

/**
 * 后台任务进度条。
 * 建模与解题都是多阶段的长任务（还要在推理档之间重试），没有进度显示就像卡死了。
 * 进度是「阶段式」的：真正到哪一步只有接口返回才知道，所以这里如实显示当前在做第几次尝试，
 * 而不是假装有一个精确的百分比。
 */
function setProgress(pct: number | null, label = ''): void {
  const box = $('progress')
  if (pct === null) {
    box.style.display = 'none'
    return
  }
  box.style.display = 'block'
  $('progress-fill').style.width = `${Math.min(100, Math.max(0, pct))}%`
  $('progress-text').textContent = label
}

async function runBuild(btn: HTMLButtonElement, then?: () => void | Promise<void>): Promise<void> {
  const problemText = $<HTMLTextAreaElement>('problem-text').value.trim()
  const extra = $<HTMLTextAreaElement>('extra').value
  if (!problemText) {
    say('题目文字是空的。', 'err')
    return
  }
  if (!scene) {
    say('这台设备没法渲染 3D，换一台设备再试。', 'err')
    return
  }
  btn.disabled = true
  beginTask()
  setProgress(4, '准备开始…')
  try {
    await ensureScene(problemText, extra)
    setProgress(100, '图形已就绪')
    say('图形已建好，这就是本题的立体图。', 'ok')
    // 图形一建好就进 3D：不管走哪条路，先把图给你看。
    // 要推解题的场合，解题在后台继续跑，推完再进解题过程页。
    show('3d')
    if (then) await then()
    else setTimeout(() => setProgress(null), 400)
  } catch (e) {
    if (e instanceof CancelledError) {
      say('已取消。')
      return
    }
    say(`没能建出图形。卡在：${message(e)}`, 'err')
    show('text')
  } finally {
    btn.disabled = false
    endTask()
  }
}

/**
 * 文字页上的主按钮：建图形、推解题，然后直接进解题过程页。
 * 图形是在这一步顺带建好的，所以解题过程页底部那个「看带辅助线的图形」是立刻能点的，不用再等。
 */
$('btn-generate').onclick = async () => {
  const btn = $<HTMLButtonElement>('btn-generate')
  // 已经推过一次就直接拿出来看，不必再花一次接口调用 —— 但题面改过就不算「同一次」
  if (currentSolution && solutionFromText === textKey()) {
    renderSolution(currentSolution)
    show('solution')
    return
  }
  await runBuild(btn, async () => {
    await generateSolution(btn)
  })
}

/** 旁边那个小按钮：只想先看看图形建得对不对，不花推理的钱、也不用等解答。 */
$('btn-shape').onclick = async () => {
  if (currentScene && sceneFromText === textKey()) {
    show('3d')
    return
  }
  await runBuild($<HTMLButtonElement>('btn-shape'))
}

/**
 * 题面与补充条件的指纹。
 * 用途：判断手上这份图形/解答是不是按当前题面做的。
 * 不比对的话，改完题面再点按钮会看到上一次的结果，人会以为改动没生效。
 */
function textKey(): string {
  return `${$<HTMLTextAreaElement>('problem-text').value.trim()}\u0000${$<HTMLTextAreaElement>('extra').value.trim()}`
}

let sceneFromText = ''
let solutionFromText = ''

// ---- 解题过程 ----
let currentSolution: Solution | undefined

function renderSolution(sol: Solution): void {
  const ansBox = $('solution-answers')
  ansBox.innerHTML = ''
  if (sol.answers.length) {
    for (const a of sol.answers) {
      const line = document.createElement('div')
      line.className = 'ans'
      const label = document.createElement('b')
      label.textContent = `${a.label} `
      line.append(label, document.createTextNode(a.value))
      ansBox.appendChild(line)
    }
  }

  const box = $('solution-steps')
  box.innerHTML = ''
  sol.steps.forEach((s, i) => {
    const el = document.createElement('div')
    el.className = 'step'

    const head = document.createElement('div')
    head.className = 'st-head'
    const no = document.createElement('span')
    no.className = 'st-no'
    no.textContent = `${i + 1}.`
    const title = document.createElement('span')
    title.textContent = s.title
    head.append(no, title)
    el.appendChild(head)

    const text = document.createElement('div')
    text.className = 'st-text'
    text.textContent = s.text
    el.appendChild(text)

    if (s.why) {
      const why = document.createElement('div')
      why.className = 'st-why'
      why.textContent = `依据：${s.why}`
      el.appendChild(why)
    }

    const drawn = [
      s.addPoints.length ? `新增点 ${s.addPoints.map((p) => p.name).join('、')}` : '',
      s.addEdges.length ? `新增线 ${s.addEdges.map((e) => e.join('')).join('、')}` : '',
      s.uses.points.length ? `用到点 ${s.uses.points.join('、')}` : '',
      s.uses.edges.length ? `用到线 ${s.uses.edges.map((e) => e.join('')).join('、')}` : '',
    ].filter(Boolean)
    if (drawn.length) {
      const d = document.createElement('div')
      d.className = 'st-draw'
      d.textContent = drawn.join('；')
      el.appendChild(d)
    }

    box.appendChild(el)
  })
}

async function generateSolution(btn: HTMLButtonElement): Promise<void> {
  const problemText = $<HTMLTextAreaElement>('problem-text').value.trim()
  const extra = $<HTMLTextAreaElement>('extra').value
  const base = currentScene
  if (!base) return

  btn.disabled = true
  let lastProblem = '未知原因'
  const points = base.points.map((p) => p.name)

  try {
    for (const [i, effort] of EFFORTS.entries()) {
      try {
        say(`正在推理解题过程（推理档 ${effort}）…`)
        setProgress(30 + i * 25, `第 ${i + 1} 次尝试推理解题（推理档 ${effort}）…`)
        const raw = await solveProblem(problemText, extra, points, effort)

        if (raw && typeof raw === 'object' && typeof (raw as { unsupported?: unknown }).unsupported === 'string') {
          throw new Error(`模型说这一步表达不了：${(raw as { unsupported: string }).unsupported}`)
        }

        const sol = parseSolution(raw, base)
        // 把逐步画出的辅助线并进场景重解一遍，图形要是变了说明辅助线画歪了
        const merged = mergeSolution(base, sol)
        const solved = solve(merged.points, merged.constraints)
        if (!solved.ok) {
          const worst = [...solved.residuals].sort((a, b) => b.error - a.error).slice(0, 2)
          throw new Error(`加上辅助线后图形对不上了：${worst.map((r) => r.desc).join('；')}`)
        }

        currentSolution = sol
        solutionFromText = textKey() // 记住这份解答是按哪版题面推的
        stepIndex = -1 // 换了新题就回到「全部显示」，免得接着上一条的进度
        stopPlay()
        scene?.setScene(toRenderable(merged, solved.points, base))
        refreshAnnotations()
        renderSolution(sol)
        autoSave(base, sol)
        say('')
        setProgress(100, '解题过程已就绪')
        setTimeout(() => setProgress(null), 400)
        show('solution')
        return
      } catch (e) {
        if (e instanceof ApiError || e instanceof CancelledError) throw e
        lastProblem = message(e)
        console.warn(`[geo3d] 解题过程 推理档 ${effort} 失败：${lastProblem}`)
      }
    }
    setProgress(null)
    say(`三档推理都试过了，解题过程还是没出来。最后一次卡在：${lastProblem}`, 'err')
    show('text')
  } catch (e) {
    if (e instanceof CancelledError) {
      // 图形已经建好了，取消的只是解题那一半，所以退回去看图而不是退回文字页
      say('已取消，图形已经建好了。')
      show('3d')
      return
    }
    throw e
  } finally {
    btn.disabled = false
  }
}

$('btn-solution-3d').onclick = () => {
  setStep(-1) // 先整个看一遍，再按播放逐条走
  show('3d')
}
$('btn-solution-back').onclick = () => show('text')

// ---- 步骤播放器：把辅助线按解题步骤逐条画出来 ----
let stepIndex = -1 // -1 表示全部显示
let playing = false
let playTimer: number | undefined

function applyStep(): void {
  const base = currentScene
  const sol = currentSolution
  if (!base || !sol || !scene) return
  const label = $('pl-label')
  const text = $('pl-text')
  const range = $<HTMLInputElement>('pl-range')
  range.max = String(sol.steps.length - 1)
  range.value = String(stepIndex)

  if (stepIndex < 0) {
    scene.setReveal(null)
    scene.setHighlight(null)
    label.textContent = '全部'
    text.textContent = '已显示全部辅助线。拖上面的滑杆或点「播放」，可以按解题步骤逐条看它们是怎么画出来的。'
    return
  }
  const tl = stepTimeline(base, sol)
  const at = tl.afterStep[stepIndex]
  scene.setReveal({ points: at.points, edges: at.edges })
  const step = sol.steps[stepIndex]
  scene.setHighlight({
    points: new Set(step.uses.points),
    edges: new Set(step.uses.edges.map(([a, b]) => edgeKey(a, b))),
    faces: new Set(step.uses.faces.map((f) => faceKey(f))),
  })
  label.textContent = `${stepIndex + 1} / ${sol.steps.length}`
  text.textContent = `${stepIndex + 1}. ${step.title}`
}

function setStep(i: number): void {
  const sol = currentSolution
  if (!sol) return
  stepIndex = i < 0 ? -1 : Math.min(i, sol.steps.length - 1)
  applyStep()
}

function stopPlay(): void {
  playing = false
  if (playTimer !== undefined) window.clearTimeout(playTimer)
  playTimer = undefined
  $('pl-play').textContent = '▶ 播放'
}

$('pl-prev').onclick = () => {
  stopPlay()
  setStep(stepIndex <= 0 ? -1 : stepIndex - 1)
}
$('pl-next').onclick = () => {
  stopPlay()
  setStep(stepIndex < 0 ? 0 : stepIndex + 1)
}
$('pl-play').onclick = () => {
  const sol = currentSolution
  if (!sol) return
  if (playing) {
    stopPlay()
    return
  }
  playing = true
  $('pl-play').textContent = '⏸ 暂停'
  setStep(0)
  const tick = () => {
    playTimer = undefined
    if (!playing || !currentSolution) return
    if (stepIndex >= currentSolution.steps.length - 1) {
      stopPlay()
      return
    }
    setStep(stepIndex + 1)
    playTimer = window.setTimeout(tick, 2600)
  }
  playTimer = window.setTimeout(tick, 2600)
}
$('pl-text').onclick = () => show('solution')

// 滑杆可以直接拖到任意一步
$('pl-range').addEventListener('input', () => {
  stopPlay()
  setStep(Number($<HTMLInputElement>('pl-range').value))
})

updateCaption(false)
show('photo')

// 顶栏额度常驻：先拿上次拿到的值顶上，再后台刷新一次
updateTopBalance()
if (getKey()) void refreshBalance(true)
