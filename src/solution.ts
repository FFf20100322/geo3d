import type { PointDef } from './solver'
// 带 .ts 后缀：这个模块要被 node 直接导入跑自检，值导入不给后缀会解析不到（类型导入会被剥离，所以那些可以不写）
import { edgeKey, toDisplayName, type Scene } from './scene.ts'
import { latexToPlain, normalizeMath, normalizeSubscripts } from './text.ts'
import type { AngleSpec, LengthSpec } from './annotation.ts'

/**
 * 解题过程层。
 *
 * 关键约束：**辅助点只能是「算得出来」的点**（中点、分点、平移派生、垂足、射影），
 * 不允许模型在解题步骤里凭空插一个自由点。
 * 因为自由点需要新的约束才能定位，而那是「改题目图形」，不是「画辅助线」——
 * 一旦允许，模型给的辅助线就可能把原图形拽歪，而你还看不出来。
 */

export type AuxPointKind = 'midpoint' | 'ratio' | 'offset' | 'perpFoot' | 'projLine'

export interface Uses {
  points: string[]
  edges: [string, string][]
  faces: string[][]
}

/**
 * 解题步骤、依据、答案都要过这一道。
 *
 * 为什么：这些文字和你核对用的题面一样，都是模型自由写出来的，都可能原样吐 LaTeX。
 * 题面早就接了这一道转换，但步骤和答案当时漏了 —— 于是题面干干净净、
 * 一到解题过程里又是 \frac{1}{2}。同一个漏洞的另一个出口，补上。
 */
const readable = (s: string): string => normalizeMath(latexToPlain(s.trim()))

export interface Step {
  title: string
  text: string
  /** 用到的定理或依据，一句话 */
  why: string
  /** 这一步新画出来的辅助点与线段 */
  addPoints: PointDef[]
  addEdges: [string, string][]
  /** 这一步主要用到的已有元素，用来在 3D 里高亮 */
  uses: Uses
  /**
   * 这一步属于哪一问（'1'、'2'…；'0' 表示不属于任何一问的通识步骤）。
   * 不填就是「哪一问都算」—— 只有一问的题什么都不用改。
   */
  q?: string
  /**
   * 这一步用的哪种解题方法（'向量法' / '坐标系法' / '基底法'）。
   * 同一问的不同解法就是「q 相同、via 不同」的几组步骤 ——
   * 用按钮切换时只放对应那一组，所以一次只会看到一种方法。
   */
  via?: string
}

export interface Solution {
  steps: Step[]
  answers: { label: string; value: string }[]
  /**
   * 要画出来的箭头。三类东西共用这一个字段：
   * - **向量法**的向量：黄色
   * - **基底法**的基底：蓝色（要和黄色区分开）
   * - **坐标系法**的三个坐标轴：蓝色
   * 所以不必为三种方法各造一套数据结构。
   */
  arrows?: { from: string; to: string; label?: string; color?: 'yellow' | 'blue' }[]
  /**
   * **面的法向量**。
   *
   * 为什么不并进 arrows：arrows 的两端都是**图上已有的点**，而法向量的尖端
   * **不是任何一个点** —— 它是按面的三个顶点现算出来的。所以它只能给「哪个面、
   * 从哪个点出发、多长」，由程序自己算出方向。
   *
   * 这样算还有个好处：它跟着动点走 —— 面一动，法向量自动跟着转。
   */
  normals?: {
    /** 用哪三个（或更多）点确定这个面 */
    face: string[]
    /** 从哪个点出发画（通常是该面上的一个点） */
    at: string
    /** 画多长。不给就按图形大小自己定一个 */
    length?: number
    label?: string
    color?: 'yellow' | 'blue'
  }[]
  /**
   * 坐标系法的空间直角坐标系：原点 + 三个轴上的单位点。
   * 给了它，程序就能**自己算出每个点的坐标**，不必让模型逐个报坐标
   * （模型报坐标容易错，而我们本来就有坐标 —— 自己算是免费的）。
   *
   * `note` 是**为什么这么建系**的一句话。用户明确要求能看懂系统的选择：
   * 只说「以 A 为原点」不够，要说清「因为 AB、AD、AA₁ 两两垂直且交于 A，
   * 三条棱直接当坐标轴，不用做任何辅助线」—— 那才是「最简」的理由。
   */
  frame?: { origin: string; x: string; y: string; z: string; note?: string }
  /** 这道题涉及、需要画弧标注的角度 */
  angles: AngleSpec[]
  /** 需要在线段上标出来的长度 */
  lengths: LengthSpec[]
}

const ANGLE_KINDS = ['lineLine', 'linePlane', 'dihedral'] as const

/** 解析一条角度看描述。引用不存在的点就报错，不猜。 */
function parseAngle(raw: unknown, i: number, ref: (x: unknown, what: string) => string): AngleSpec {
  if (!isObj(raw)) throw new SolutionError(`第 ${i + 1} 个角不是对象`)
  const kind = str(raw.kind, `第 ${i + 1} 个角的 kind`)
  if (!(ANGLE_KINDS as readonly string[]).includes(kind)) {
    throw new SolutionError(`第 ${i + 1} 个角的类型「${kind}」我还不会画`)
  }
  // label 是「这个角叫什么」，value 是「它多大」。两者都可以不给：
  // 度数反正由本地算，模型给的写法只是更好看的排版，对不上会被丢掉。
  const label = raw.label === undefined ? undefined : str(raw.label, `第 ${i + 1} 个角的 label`)
  const value = raw.value === undefined ? undefined : str(raw.value, `第 ${i + 1} 个角的 value`)
  let of: AngleSpec['of']
  if (raw.of !== undefined) {
    const text = str(raw.of, `第 ${i + 1} 个角的 of`)
    if (text !== 'degrees' && text !== 'cos' && text !== 'sin') {
      throw new SolutionError(`第 ${i + 1} 个角的 of 只能写 degrees、cos 或 sin，收到「${text}」`)
    }
    of = text
  }

  const pair = (x: unknown, what: string): [string, string] => {
    const a = arr(x, what).map((y) => ref(y, what))
    if (a.length !== 2) throw new SolutionError(`${what} 应该是两个点`)
    return a as [string, string]
  }
  if (kind === 'lineLine') {
    return { kind, p: pair(raw.p, '直线的两个端点'), q: pair(raw.q, '直线的两个端点'), label, value, of }
  }
  if (kind === 'linePlane') {
    const line = pair(raw.line, '直线的两个端点')
    const plane = arr(raw.plane, '平面的三个点').map((y) => ref(y, '平面'))
    if (plane.length !== 3) throw new SolutionError('平面应该是三个点')
    return { kind, line, plane: plane as [string, string, string], label, value, of }
  }
  return {
    kind: 'dihedral',
    edge: pair(raw.edge, '棱的两个端点'),
    inA: ref(raw.inA, '第一个面内的点'),
    inB: ref(raw.inB, '第二个面内的点'),
    label,
    value,
    of,
  }
}

/** 把一串字母切成若干个已知点名，返回所有切法（限制数量，避免病态输入炸开） */
function splitPoints(s: string, known: Set<string>): string[][] {
  const out: string[][] = []
  const walk = (i: number, acc: string[]) => {
    if (out.length > 64) return
    if (i === s.length) {
      out.push([...acc])
      return
    }
    for (let j = i + 1; j <= s.length; j++) {
      const piece = s.slice(i, j)
      if (!known.has(piece)) continue
      acc.push(piece)
      walk(j, acc)
      acc.pop()
    }
  }
  walk(0, [])
  return out
}

export interface ParsedElement {
  point: string | null
  edge: [string, string] | null
  face: string[] | null
}

/**
 * 把 uses 里的一项解析成「一个点」「一条棱」或「一个面」。
 * 模型三种写法都会用：点写 "A"，棱写 "BC" 或 "B1C1"，面写 "ABCD" 或 "ABB1A1"。
 * 点名可能自带下标，所以不能按固定长度切，得把所有切分位置都试一遍。
 */
export function parseElementName(raw: string, known: Set<string>, faces: string[][] = []): ParsedElement | null {
  const s = normalizeSubscripts(raw.trim())
  if (!s) return null
  if (known.has(s)) return { point: s, edge: null, face: null }
  for (let i = 1; i < s.length; i++) {
    const a = s.slice(0, i)
    const b = s.slice(i)
    if (known.has(a) && known.has(b)) return { point: null, edge: [a, b], face: null }
  }
  // 面：切成三个以上点名后，看是否和场景里某个面的顶点集合一致
  for (const combo of splitPoints(s, known)) {
    if (combo.length < 3) continue
    const set = new Set(combo)
    const hit = faces.find((f) => f.length === set.size && f.every((k) => set.has(k)))
    if (hit) return { point: null, edge: null, face: hit }
  }
  return null
}

class SolutionError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const str = (x: unknown, what: string): string => {
  if (typeof x !== 'string' || !x.trim()) throw new SolutionError(`${what} 应该是一个字符串`)
  return x.trim()
}
const arr = (x: unknown, what: string): unknown[] => {
  if (!Array.isArray(x)) throw new SolutionError(`${what} 应该是一个数组`)
  return x
}

/** 辅助点允许的类型 —— 全都是「拿到已知点就能直接算出来」的，不需要再解一次方程 */
const AUX_KINDS: Record<AuxPointKind, number> = {
  midpoint: 2,
  ratio: 2,
  offset: 3,
  perpFoot: 4,
  projLine: 3,
}

const DENY = '辅助线只能画中点、分点、平移、垂足、射影这几种，这一步用了别的画法，我还不会处理。'

export function parseSolution(raw: unknown, scene: Scene): Solution {
  if (!isObj(raw)) throw new SolutionError('解题过程不是一个对象')
  const rawSteps = arr(raw.steps, 'steps')
  if (!rawSteps.length) throw new SolutionError('解题过程是空的')

  const known = new Set(scene.points.map((p) => p.name))
  const steps: Step[] = []

  for (const [i, s] of rawSteps.entries()) {
    if (!isObj(s)) throw new SolutionError(`第 ${i + 1} 步不是一个对象`)
    const title = readable(str(s.title, `第 ${i + 1} 步的 title`))
    const text = readable(str(s.text, `第 ${i + 1} 步的 text`))
    const why = typeof s.why === 'string' ? readable(s.why) : ''

    const addPoints: PointDef[] = []
    for (const raw of arr(s.addPoints ?? [], `第 ${i + 1} 步的辅助点`)) {
      if (!isObj(raw)) throw new SolutionError(`第 ${i + 1} 步的辅助点写错了`)
      // 模型写 A1，场景里存的是 A₁，两边必须先统一成同一种写法
      const name = toDisplayName(str(raw.name, '辅助点的 name'))
      if (known.has(name)) continue // 已经有的点不算新增
      const kind = str(raw.kind, `辅助点 ${name} 的 kind`) as AuxPointKind
      const need = AUX_KINDS[kind]
      if (!need) throw new SolutionError(DENY)
      const of = arr(raw.of, `辅助点 ${name} 的 of`).map((x) => toDisplayName(str(x, '辅助点引用的点')))
      if (of.length !== need) throw new SolutionError(`辅助点 ${name} 的 of 应该有 ${need} 个点`)
      for (const k of of) if (!known.has(k)) throw new SolutionError(`辅助点 ${name} 引用了还不存在的点 ${k}`)
      if (kind === 'midpoint') addPoints.push({ name, kind, of: of as [string, string] })
      else if (kind === 'projLine') addPoints.push({ name, kind, of: of as [string, string, string] })
      else if (kind === 'perpFoot') addPoints.push({ name, kind, of: of as [string, string, string, string] })
      else if (kind === 'offset') addPoints.push({ name, kind, of: of as [string, string, string] })
      else addPoints.push({ name, kind: 'ratio', of: of as [string, string], t: typeof raw.t === 'number' ? raw.t : 0.5 })
      known.add(name)
    }

    const addEdges: [string, string][] = arr(s.addEdges ?? [], `第 ${i + 1} 步的辅助线`).map((e) => {
      const pair = arr(e, `第 ${i + 1} 步的辅助线`).map((x) => toDisplayName(str(x, '线段端点')))
      if (pair.length !== 2) throw new SolutionError(`第 ${i + 1} 步的辅助线需要两个端点`)
      for (const k of pair) if (!known.has(k)) throw new SolutionError(`第 ${i + 1} 步的辅助线引用了不存在的点 ${k}`)
      return pair as [string, string]
    })

    const uses: Uses = { points: [], edges: [], faces: [] }
    for (const raw of arr(s.uses ?? [], `第 ${i + 1} 步的 uses`)) {
      const parsed = parseElementName(str(raw, 'uses 里的元素'), known, scene.faces)
      if (!parsed) throw new SolutionError(`第 ${i + 1} 步用到还不存在的元素 ${String(raw)}`)
      if (parsed.point) uses.points.push(parsed.point)
      if (parsed.edge) uses.edges.push(parsed.edge)
      if (parsed.face) uses.faces.push(parsed.face)
    }

    // 这两项是可选的：只有「一问多解、要按钮切换」的题才填，其余题不受影响
    const q = typeof s.q === 'string' || typeof s.q === 'number' ? String(s.q) : undefined
    const via = typeof s.via === 'string' && s.via.trim() ? readable(s.via) : undefined
    steps.push({ title, text, why, addPoints, addEdges, uses, q, via })
  }

  // 角度描述里引用的点必须在图上真的存在（含前面步骤刚画出来的辅助点）
  const ref = (x: unknown, what: string): string => {
    const name = toDisplayName(str(x, what))
    if (!known.has(name)) throw new SolutionError(`${what} 引用了不存在的点 ${name}`)
    return name
  }

  const answers = arr(raw.answers ?? [], 'answers').map((a, i) => {
    if (!isObj(a)) throw new SolutionError(`第 ${i + 1} 个答案写错了`)
    return { label: readable(str(a.label, '答案的 label')), value: readable(str(a.value, '答案的 value')) }
  })

  const angles = arr(raw.angles ?? [], 'angles').map((a, i) => parseAngle(a, i, ref))

  // 长度：只说哪两个点之间、以及想显示的写法。数值一律由本地算，模型报的走反验。
  const lengths: LengthSpec[] = arr(raw.lengths ?? [], 'lengths').map((x, i) => {
    if (!isObj(x)) throw new SolutionError(`第 ${i + 1} 个长度不是对象`)
    const p = arr(x.p, `第 ${i + 1} 个长度的两个端点`).map((y) => ref(y, '长度'))
    if (p.length !== 2) throw new SolutionError(`第 ${i + 1} 个长度应该是两个点`)
    const label = x.label === undefined ? undefined : readable(str(x.label, '长度的 label'))
    const value = x.value === undefined ? undefined : str(x.value, '长度的 value')
    return { p: p as [string, string], label, value }
  })

  // 箭头与坐标系：都是可选的，只有「三种解题法」那类题才给。
  // 引用的点必须在图上真的存在，所以这里用 ref 逐个数过一遍 ——
  // 写错了要当场报出来，不能让它在渲染层悄悄画不出来。
  const arrows = arr(raw.arrows ?? [], 'arrows').map((x, i) => {
    if (!isObj(x)) throw new SolutionError(`第 ${i + 1} 个箭头不是对象`)
    const from = ref(x.from, '箭头的起点')
    const to = ref(x.to, '箭头的终点')
    const color: 'yellow' | 'blue' = x.color === 'blue' ? 'blue' : 'yellow'
    const label = typeof x.label === 'string' ? readable(x.label) : undefined
    return { from, to, label, color }
  })

  // 面法向量：引用的点必须都存在，跟别处一样当场查出来，不许静默失配
  const normals = arr(raw.normals ?? [], 'normals').map((x, i) => {
    if (!isObj(x)) throw new SolutionError(`第 ${i + 1} 个法向量不是对象`)
    const face = arr(x.face, `第 ${i + 1} 个法向量的 face`).map((n) => ref(n, '法向量的面'))
    if (face.length < 3) throw new SolutionError(`第 ${i + 1} 个法向量的面至少要三个点`)
    const color: 'yellow' | 'blue' = x.color === 'blue' ? 'blue' : 'yellow'
    const length = x.length === undefined ? undefined : Number(str(x.length, `第 ${i + 1} 个法向量的长度`))
    if (length !== undefined && !Number.isFinite(length)) throw new SolutionError(`第 ${i + 1} 个法向量的长度不是数`)
    return {
      face,
      at: ref(x.at, `第 ${i + 1} 个法向量的起点`),
      length,
      label: typeof x.label === 'string' ? readable(x.label) : undefined,
      color,
    }
  })

  let frame: { origin: string; x: string; y: string; z: string; note?: string } | undefined
  if (raw.frame !== undefined) {
    if (!isObj(raw.frame)) throw new SolutionError('frame 不是一个对象')
    frame = {
      origin: ref(raw.frame.origin, '坐标系原点'),
      x: ref(raw.frame.x, 'x 轴上的点'),
      y: ref(raw.frame.y, 'y 轴上的点'),
      z: ref(raw.frame.z, 'z 轴上的点'),
      // 为什么这么建系。缺了也能跑，但用户就看不到系统的选择了。
      note: typeof raw.frame.note === 'string' ? readable(raw.frame.note) : undefined,
    }
  }

  return { steps, answers, angles, lengths, arrows, normals, frame }
}

/** 把解题过程里逐步新增的辅助元素并进场景，得到「带辅助线的完整图形」 */
export function mergeSolution(scene: Scene, solution: Solution): Scene {
  const points = [...scene.points]
  const edges = [...scene.edges]
  const seen = new Set(points.map((p) => p.name))
  for (const step of solution.steps) {
    for (const p of step.addPoints) {
      if (seen.has(p.name)) continue
      points.push(p)
      seen.add(p.name)
    }
    for (const e of step.addEdges) if (!edges.some((x) => x[0] === e[0] && x[1] === e[1])) edges.push(e)
  }
  // **一定要先把原场景展开**。
  //
  // 这里踩过一次，而且一次害了两个功能：原来写的是
  //   return { points, edges, faces: scene.faces, constraints: scene.constraints }
  // 只挑了四个字段，**把 solids 和 variants 悄悄丢了** ——
  // 后果是曲面立体画不出来、每问独有的条件在「记住图形」之后失效，
  // 而且**两处都不报错**，只是东西不见了，最难查。
  //
  // 以后往 Scene 上加字段时，这里不用改，因为已经展开了。
  return { ...scene, points, edges, faces: scene.faces, constraints: scene.constraints }
}

export interface StepPositions {
  /** 每一步执行完之后，场景里已经有哪些点与线段 */
  afterStep: { points: Set<string>; edges: Set<string> }[]
}

/** 算出「走到第 k 步时已经画出了什么」，供动画逐条显示辅助线用 */
export function stepTimeline(scene: Scene, solution: Solution): StepPositions {
  const points = new Set(scene.points.map((p) => p.name))
  const edges = new Set(scene.edges.map(([a, b]) => edgeKey(a, b)))
  const afterStep: StepPositions['afterStep'] = []
  for (const step of solution.steps) {
    for (const p of step.addPoints) points.add(p.name)
    for (const e of step.addEdges) edges.add(edgeKey(e[0], e[1]))
    afterStep.push({ points: new Set(points), edges: new Set(edges) })
  }
  return { afterStep }
}
