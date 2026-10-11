import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { EDGES, FACES, VERTICES, selfCheck } from './geo'
import { edgeKey, type Renderable } from './scene'
import type { Ray } from './drag'
import type { AnnotationShape } from './annotation'
import type { Vec3 } from './solver'

/**
 * 3D 视图。挂载一次、反复显示隐藏，避免来回重建 WebGL 上下文。
 *
 * 每条棱单独一个对象、每个标签单独一个 DOM 元素，为的是能按解题步骤逐条显示辅助线 ——
 * 如果所有棱合在一个 geometry 里，就没法单独控制其中某一条的显隐。
 */

export interface Reveal {
  /** 到这一步为止已经画出来的点与棱。题面原有的元素不受它影响，永远显示。 */
  points: Set<string>
  edges: Set<string>
}

/** 当前步骤用到的元素，画成醒目色 */
export interface Highlight {
  points: Set<string>
  edges: Set<string>
  /** 面的名字（顶点按顺序拼起来） */
  faces: Set<string>
}

export interface Scene3d {
  setActive(on: boolean): void
  setScene(r: Renderable): void
  /** null 表示全部显示（把辅助线一次性都亮出来） */
  setReveal(reveal: Reveal | null): void
  /** null 表示这一步没有要强调的东西 */
  setHighlight(hl: Highlight | null): void
  /** 重画全部角度标注。传空数组就是关掉标注。 */
  setAnnotations(list: AnnotationShape[]): void
  /** 只挪动若干个点并同步更新连着它们的棱，用来做动点拖动 */
  setPositions(pos: Record<string, Vec3>): void
  /** 允许被手指抓住的点。命中判定用实时坐标，所以拖完之后不用重新登记。 */
  setGrabbables(names: string[]): void
  /**
   * 上方要给别的面板让出多少像素。
   * 让位的方式是缩小渲染区域本身，而不是把模型藏在面板后面 ——
   * 否则调参数的时候根本看不见自己调的是什么。
   */
  setViewInset(top: number, bottom: number): void
  /** 手指按在动点上时触发（这时不会旋转视角） */
  onGrab: ((name: string) => void) | null
  /** 拖动过程中持续触发，参数是手指发出的射线 */
  onDragRay: ((name: string, ray: Ray) => void) | null
  onRelease: ((name: string) => void) | null
  /** 单击某个面把它关掉/打开之后触发，用来刷新界面上的按钮 */
  onFaceToggle: (() => void) | null
  /** 一键全部显示 / 全部隐藏 */
  setAllFaces(on: boolean): void
  /** 现在是不是所有面都被关掉了（按钮文案要用） */
  allFacesHidden(): boolean
  /** 这张图有没有面 */
  hasFaces(): boolean
  /** 切换视图时可以顺手复位，避免上一条题的显示状态漏到这一条 */
  hasAux(): boolean
}

function perfTier() {
  // 安卓 14 机型跨度很大，这里只用设备信息粗判
  // ponytail: 定档目前只看设备内存；帧耗时校正等场景变大后再加，现在场景太小测不出差异
  const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory
  const low = typeof ram === 'number' && ram <= 4
  return { low, maxPixelRatio: low ? 1 : Math.min(window.devicePixelRatio, 2) }
}

/** 把 geo.ts 里写死的示例正方体转成通用结构，作为 3D 页的默认画面 */
function demoScene(): Renderable {
  const v = (k: string) => VERTICES[k]
  return {
    vertices: Object.entries(VERTICES).map(([name, at]) => ({ name, at, aux: false, moving: false })),
    edges: EDGES.map(([a, b]) => ({ key: edgeKey(a, b), a: v(a), b: v(b), aux: false })),
    faces: FACES.map((f) => ({ key: f.pts.join(''), pts: f.pts.map(v), names: [...f.pts], color: f.color })),
  }
}

export function mountScene3d(host: HTMLElement, labelHost: HTMLElement, hint: HTMLElement): Scene3d | null {
  selfCheck()
  const tier = perfTier()

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !tier.low })
    if (!renderer.getContext()) throw new Error('no webgl context')
  } catch {
    // 兼容性兜底：低端机 GPU 驱动可能拒绝创建上下文，失败要给人话，不能白屏
    host.innerHTML =
      '<p style="padding:80px 24px;text-align:center;color:#98a2b3">这台设备没能创建 3D 渲染（WebGL2）。可以试着在系统里更新「Android System WebView」后重开本页。</p>'
    return null
  }
  renderer.setPixelRatio(tier.maxPixelRatio)
  host.appendChild(renderer.domElement)

  const labelRenderer = new CSS2DRenderer({ element: labelHost })

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1115)

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 500)
  camera.position.set(2.2, 1.8, 2.6)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 0.5
  controls.maxDistance = 60

  const group = new THREE.Group()
  scene.add(group)

  const v3 = ([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z)
  const matEdge = new THREE.LineBasicMaterial({ color: 0xdfe6f2 })
  const matAux = new THREE.LineDashedMaterial({ color: 0x7dd3a0, dashSize: 0.18, gapSize: 0.12 })
  const matHl = new THREE.LineBasicMaterial({ color: 0xffd166 })

  let edgeObjects = new Map<string, THREE.LineSegments>()
  let vertexObjects = new Map<string, CSS2DObject>()
  let auxEdges = new Set<string>()
  let auxPoints = new Set<string>()
  const faceObjects = new Map<string, { mesh: THREE.Mesh; color: number; pts: string[] }>()
  /** 被用户手动关掉的面。换图时清空，所以每次换图都是全显示。 */
  const hiddenFaces = new Set<string>()

  /** 把显隐规则重新落到每个面上。任何一次重建/高亮之后都要调一次。 */
  function applyFaceVisibility() {
    for (const [key, entry] of faceObjects) entry.mesh.visible = !hiddenFaces.has(key)
  }
  const edgeEnds = new Map<string, [string, string]>()
  /**
   * 把一个多边形面写成三角扇。顶点是现算的，所以面能跟着动点走。
   * 顶点数变了就重建整个几何体，没变就就地改坐标（拖动时每帧都会走到这里）。
   */
  function writeFaceGeometry(mesh: THREE.Mesh, pts: Vec3[]) {
    if (pts.length < 3) return
    const verts: number[] = []
    for (let i = 1; i < pts.length - 1; i++) {
      for (const p of [pts[0], pts[i], pts[i + 1]]) verts.push(p[0], p[1], p[2])
    }
    const geo = mesh.geometry
    const attr = geo.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!attr || attr.count !== verts.length / 3) {
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    } else {
      for (let i = 0; i < verts.length / 3; i++) attr.setXYZ(i, verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2])
      attr.needsUpdate = true
    }
    geo.computeBoundingSphere()
  }

  let positions: Record<string, Vec3> = {}

  function setScene(r: Renderable) {
    group.clear()
    labelHost.innerHTML = '' // 换场景时清掉可能残留的标签 DOM
    edgeObjects = new Map()
    vertexObjects = new Map()
    faceObjects.clear()
    hiddenFaces.clear() // 换图就是全显示，别把上一张图关掉的面带到这一张
    edgeEnds.clear()
    auxEdges = new Set(r.edges.filter((e) => e.aux).map((e) => e.key))
    auxPoints = new Set(r.vertices.filter((v) => v.aux).map((v) => v.name))
    positions = {}
    for (const v of r.vertices) positions[v.name] = v.at

    // 半透明面：每个共面一个颜色
    for (const f of r.faces) {
      if (f.pts.length < 3) continue
      const mesh = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({
          color: f.color,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      writeFaceGeometry(mesh, f.pts)
      group.add(mesh)
      mesh.userData.faceKey = f.key // 点面切换显隐时要靠它认回是哪个面
      faceObjects.set(f.key, { mesh, color: f.color, pts: f.names })
    }
    applyFaceVisibility()

    // 每条棱单独一个对象：辅助线要能按步骤逐条出现，就必须能单独控显隐
    for (const e of r.edges) {
      const geo = new THREE.BufferGeometry().setFromPoints([v3(e.a), v3(e.b)])
      const line = new THREE.LineSegments(geo, e.aux ? matAux : matEdge)
      if (e.aux) line.computeLineDistances()
      group.add(line)
      edgeObjects.set(e.key, line)
    }

    // 点标注走 DOM 覆盖层，永远压在最上面 —— 「点标注必须常驻」靠这层保证
    for (const v of r.vertices) {
      const el = document.createElement('div')
      el.className = v.moving ? 'pt mov' : v.aux ? 'pt aux' : 'pt'
      el.textContent = v.name
      const obj = new CSS2DObject(el)
      obj.position.copy(v3(v.at))
      group.add(obj)
      vertexObjects.set(v.name, obj)
    }

    // 从棱的 key 反推两端点名，拖动动点时要按名字找连着的棱
    for (const e of r.edges) {
      const [a, b] = e.key.split('|')
      edgeEnds.set(e.key, [a, b])
    }

    fitCamera(r)
  }

  /** 只挪动给定的点，并同步更新连着它们的棱。动点拖动走这条路，不必重建整个场景。 */
  function setPositions(pos: Record<string, Vec3>) {
    const moved = Object.keys(pos)
    if (!moved.length) return
    for (const name of moved) positions[name] = pos[name]

    for (const name of moved) {
      const obj = vertexObjects.get(name)
      if (obj) obj.position.set(pos[name][0], pos[name][1], pos[name][2])
    }
    const dirty = new Set(moved)
    for (const [key, line] of edgeObjects) {
      const ends = edgeEnds.get(key)
      if (!ends || (!dirty.has(ends[0]) && !dirty.has(ends[1]))) continue
      const a = positions[ends[0]]
      const b = positions[ends[1]]
      if (!a || !b) continue
      const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
      attr.setXYZ(0, a[0], a[1], a[2])
      attr.setXYZ(1, b[0], b[1], b[2])
      attr.needsUpdate = true
      line.geometry.computeBoundingSphere()
    }

    // 面也要跟着动。一个面由它那几个顶点决定，所以只要顶点里有被挪动的，就重算它。
    //
    // 注意这里只会因为**动点**而触发：setPositions 只由拖动路径调用，传进来的就是动点
    // 与它们的派生点，普通顶点永远不在其中。所以静态的面（题面本来就有的那些）
    // 一次也不会重算，只有像「三个动点张成的那个面」才会随拖动实时更新。
    for (const entry of faceObjects.values()) {
      if (!entry.pts.some((n) => dirty.has(n))) continue
      const pts = entry.pts.map((n) => positions[n])
      if (pts.some((p) => !p)) continue
      writeFaceGeometry(entry.mesh, pts)
    }
  }

  function setReveal(reveal: Reveal | null) {
    for (const [key, line] of edgeObjects) {
      if (!auxEdges.has(key)) continue // 题面原有的棱永远显示
      line.visible = reveal === null || reveal.edges.has(key)
    }
    for (const [name, obj] of vertexObjects) {
      if (!auxPoints.has(name)) continue
      obj.visible = reveal === null || reveal.points.has(name)
    }
  }

  function setHighlight(hl: Highlight | null) {
    for (const [key, line] of edgeObjects) {
      const on = hl?.edges.has(key) ?? false
      // 高亮的优先于辅助线的绿色，但隐藏状态仍然是隐藏
      line.material = on ? matHl : auxEdges.has(key) ? matAux : matEdge
    }
    for (const [name, obj] of vertexObjects) {
      obj.element.classList.toggle('hl', hl?.points.has(name) ?? false)
    }
    // 面被高亮时提高不透明度并换成醒目色，其余恢复各自原来的颜色
    for (const [key, entry] of faceObjects) {
      const on = hl?.faces.has(key) ?? false
      const mat = entry.mesh.material as THREE.MeshBasicMaterial
      mat.color.setHex(on ? 0xffd166 : entry.color)
      mat.opacity = on ? 0.46 : 0.22
    }
  }

  /** 角度标注单独放一组，开关起来不影响图形本身 */
  const annotGroup = new THREE.Group()
  scene.add(annotGroup)
  const matArc = new THREE.LineBasicMaterial({ color: 0x6ee7ff })
  const matExtra = new THREE.LineDashedMaterial({
    color: 0x6ee7ff,
    dashSize: 0.12,
    gapSize: 0.1,
    opacity: 0.75,
    transparent: true,
  })

  interface AnnotSlot {
    line: THREE.Line
    extras: THREE.LineSegments[]
    label: CSS2DObject
  }
  const slots: AnnotSlot[] = []

  /** 就地更新一条线的顶点，数量对不上就整条重建 */
  function setLinePoints(obj: THREE.Line | THREE.LineSegments, pts: Vec3[]) {
    const geo = obj.geometry
    const attr = geo.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!attr || attr.count !== pts.length) {
      geo.setFromPoints(pts.map(v3))
    } else {
      pts.forEach((p, i) => attr.setXYZ(i, p[0], p[1], p[2]))
      attr.needsUpdate = true
    }
    geo.computeBoundingSphere()
  }

  /**
   * 重画角度标注。
   * 刻意做成就地复用对象而不是每次重建：拖动动点时每帧都会调到这里，
   * 每帧新建几何体与标签 DOM 在手机上会明显发卡。
   */
  function setAnnotations(list: AnnotationShape[]) {
    while (slots.length > list.length) {
      const s = slots.pop()
      if (!s) break
      annotGroup.remove(s.line, s.label, ...s.extras)
    }
    list.forEach((a, i) => {
      let s = slots[i]
      if (!s) {
        const el = document.createElement('div')
        el.className = 'angle-label'
        const label = new CSS2DObject(el)
        s = { line: new THREE.Line(new THREE.BufferGeometry(), matArc), extras: [], label }
        annotGroup.add(s.line, s.label)
        slots[i] = s
      }
      setLinePoints(s.line, a.arc)
      while (s.extras.length > a.extras.length) {
        const gone = s.extras.pop()
        if (gone) annotGroup.remove(gone)
      }
      a.extras.forEach((pair, j) => {
        let e = s.extras[j]
        if (!e) {
          e = new THREE.LineSegments(new THREE.BufferGeometry(), matExtra)
          annotGroup.add(e)
          s.extras[j] = e
        }
        setLinePoints(e, pair)
        e.computeLineDistances()
      })
      // 没有文字就不占位置（直角只画符号，不写度数）
      const el = s.label.element as HTMLElement
      el.textContent = a.text
      el.style.display = a.text ? 'block' : 'none'
      s.label.position.copy(v3(a.labelAt))
    })
  }

  /** 场景的尺度由题目里的长度决定（可能是 2，也可能是 6），所以每次换场景都要重新取景 */  function fitCamera(r: Renderable) {
    const all = [...r.vertices.map((v) => v3(v.at)), ...r.edges.flatMap((e) => [v3(e.a), v3(e.b)])]
    if (!all.length) return
    const box = new THREE.Box3().setFromPoints(all)
    const center = box.getCenter(new THREE.Vector3())
    const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.5)
    controls.target.copy(center)
    const dir = new THREE.Vector3(1, 0.8, 1.2).normalize()
    camera.position.copy(center).addScaledVector(dir, radius * 2.9)
    // 近裁剪面设小、最近距离几乎不限，这样放大时能一路进到模型内部去看
    camera.near = radius / 2000
    camera.far = radius * 200
    camera.updateProjectionMatrix()
    controls.minDistance = radius * 0.01
    controls.maxDistance = radius * 12
    controls.update()
  }

  // 相机宽高比、画布尺寸、标签层尺寸三者必须一致，否则会出现「字母和图错位」。
  let topInset = 0
  let bottomInset = 0
  const syncViewport = () => {
    const w = window.innerWidth
    // 上下被控件占掉的那两块要扣掉，渲染区域缩到中间；至少留 80 像素
    const h = Math.max(80, window.innerHeight - topInset - bottomInset)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    labelRenderer.setSize(w, h)
    renderer.domElement.style.marginTop = `${topInset}px`
    labelHost.style.top = `${topInset}px`
    const canvas = renderer.domElement
    // 我看不到画面，所以让页面自己把「尺寸对不上」这类事说出来
    const problems: string[] = []
    if (canvas.clientWidth !== w || canvas.clientHeight !== h) {
      problems.push(`画布 ${canvas.clientWidth}×${canvas.clientHeight} 与预期 ${w}×${h} 不一致`)
    }
    // 标注层与画布必须严丝合缝，差一点字母就会整体偏移（这是项目最早的那个 bug）
    const cr = canvas.getBoundingClientRect()
    const lr = labelHost.getBoundingClientRect()
    if (Math.abs(cr.top - lr.top) > 1 || Math.abs(cr.height - lr.height) > 1 || Math.abs(cr.width - lr.width) > 1) {
      problems.push(`标注层(${Math.round(lr.top)},${Math.round(lr.height)}) 与画布(${Math.round(cr.top)},${Math.round(cr.height)}) 没对齐`)
    }
    hint.textContent = problems.length
      ? `⚠ ${problems.join('；')}`
      : '按住橙色点可直接拖动 · 单指旋转 · 双指缩放'
  }
  window.addEventListener('resize', syncViewport)

  // ---- 手势消歧：按在动点上就拖点，按在别处就转视角 ----
  // 监听挂在 #app 的捕获阶段：它比画布自己的监听器先跑，所以能抢在轨道控制之前把事件截下来。
  // 直接在画布上监听是没用的 —— 同一元素上的监听器按注册顺序执行，抢不过先注册的 OrbitControls。
  let grabbables: string[] = []
  let dragging: string | null = null
  let activePointer: number | null = null
  /** 当前按在屏幕上的手指数。超过一根就一律让给缩放与转视角。 */
  const activePointers = new Set<number>()
  /** 拖点开始时那根手指落下的位置，用来在让位时补交给轨道控制 */
  let dragStart = { x: 0, y: 0 }
  /** 我们自己补发的事件不要再被自己处理一遍 */
  let replaying = false
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  /** 命中半径（CSS 像素）。手指比鼠标粗，给小了会抓不住。 */
  const HIT_RADIUS = 36

  const screenOf = (at: Vec3) => {
    const v = new THREE.Vector3(at[0], at[1], at[2]).project(camera)
    // 必须按画布自己的矩形换算，不能用窗口 —— 渲染区被上下控件挤小并下移之后，
    // 拿窗口尺寸去换算会整体偏掉，表现就是「手指按在点上却抓不住」。
    const r = renderer.domElement.getBoundingClientRect()
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height }
  }

  const rayAt = (x: number, y: number): Ray => {
    const r = renderer.domElement.getBoundingClientRect()
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const o = raycaster.ray.origin
    const d = raycaster.ray.direction
    return { origin: [o.x, o.y, o.z], dir: [d.x, d.y, d.z] }
  }

  /** 单击（而不是拖动或转视角）时，点到的那个面切换显隐 */
  let tapStart: { x: number; y: number; t: number } | null = null
  const faceRaycaster = new THREE.Raycaster()

  /**
   * 找出这条视线方向上离屏幕最近的那个面 —— 不管它是开着还是关着。
   *
   * 这是面显隐的关键规矩：**不允许透过一个面去点它后面的面**。
   * 好处是「再点一次就恢复」自然成立：同一个位置再点，命中的仍然是同一个面，
   * 于是原路切回来。早先的写法只朝「还看得见的面」打射线，藏掉一个之后
   * 射线就穿过去打到了后面那个面，越点越少 —— 那是个 bug。
   */
  function nearestFaceAt(x: number, y: number): string | null {
    const r = renderer.domElement.getBoundingClientRect()
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    faceRaycaster.setFromCamera(ndc, camera)
    const meshes: THREE.Object3D[] = []
    for (const entry of faceObjects.values()) meshes.push(entry.mesh)
    if (!meshes.length) return null
    // intersectObjects 按距离从近到远返回，取第一个就是离屏幕最近的
    const hit = faceRaycaster.intersectObjects(meshes, false)[0]
    return (hit?.object.userData.faceKey as string | undefined) ?? null
  }

  function toggleFaceAt(x: number, y: number): void {
    const key = nearestFaceAt(x, y)
    if (!key) return
    if (hiddenFaces.has(key)) hiddenFaces.delete(key)
    else hiddenFaces.add(key)
    applyFaceVisibility()
    api.onFaceToggle?.()
  }

  /** 放弃当前这次拖点，把控制权交还给轨道控制 */
  function cancelDrag(): void {
    if (dragging === null) return
    const id = activePointer
    dragging = null
    activePointer = null
    controls.enabled = true
    if (id !== null) {
      try {
        host.releasePointerCapture(id)
      } catch {
        // 没抓住也无所谓，忽略
      }
    }
    api.onRelease?.('')
  }

  /**
   * 把第一根手指的按下事件补交给轨道控制。
   * 因为拖点开始时我们把那次 pointerdown 拦下了，轨道控制只看到第二根手指，
   * 会把「捏合缩放」当成「单指旋转」。补一次，它才认得这是两指手势。
   */
  function replayPointerDown(pointerId: number, x: number, y: number, pointerType: string): void {
    replaying = true
    try {
      renderer.domElement.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId,
          pointerType,
          isPrimary: true,
          clientX: x,
          clientY: y,
          buttons: 1,
          bubbles: true,
          cancelable: true,
        }),
      )
    } finally {
      replaying = false
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (replaying) return
    tapStart = { x: e.clientX, y: e.clientY, t: Date.now() }
    activePointers.add(e.pointerId)

    // 两根以上的手指 = 用户在缩放或转视角，一律不拖点
    if (activePointers.size > 1) {
      if (dragging !== null && activePointer !== null) {
        const firstId = activePointer
        const { x, y } = dragStart
        cancelDrag()
        replayPointerDown(firstId, x, y, e.pointerType)
      }
      return // 不拦截，这一根正常传给轨道控制
    }

    if (!grabbables.length) return
    let hit: { name: string; d: number } | null = null
    for (const name of grabbables) {
      const at = positions[name]
      if (!at) continue
      const s = screenOf(at)
      const d = Math.hypot(s.x - e.clientX, s.y - e.clientY)
      if (d <= HIT_RADIUS && (!hit || d < hit.d)) hit = { name, d }
    }
    if (!hit) return // 没按在动点上，交给轨道控制正常旋转
    e.stopPropagation() // 抢在 OrbitControls 之前把事件截下来
    e.preventDefault()
    dragging = hit.name
    activePointer = e.pointerId
    dragStart = { x: e.clientX, y: e.clientY }
    controls.enabled = false
    host.setPointerCapture?.(e.pointerId)
    api.onGrab?.(dragging)
    api.onDragRay?.(dragging, rayAt(e.clientX, e.clientY))
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging === null || e.pointerId !== activePointer) return
    e.stopPropagation()
    api.onDragRay?.(dragging, rayAt(e.clientX, e.clientY))
  }

  function endDrag(e: PointerEvent) {
    activePointers.delete(e.pointerId)

    if (dragging !== null && e.pointerId === activePointer) {
      e.stopPropagation()
      const name = dragging
      dragging = null
      activePointer = null
      controls.enabled = true
      host.releasePointerCapture?.(e.pointerId)
      tapStart = null // 拖过点就不算单击
      api.onRelease?.(name)
      return
    }

    // 没在拖点：判断这是不是一次干净的单击（手指几乎没动、时间也短）。
    // 转视角与拖点都会让手指移动，所以不会被误判成单击。
    const start = tapStart
    tapStart = null
    if (!start || activePointers.size > 0) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) return
    if (Date.now() - start.t > 600) return
    toggleFaceAt(e.clientX, e.clientY)
  }

  host.addEventListener('pointerdown', onPointerDown, { capture: true })
  host.addEventListener('pointermove', onPointerMove, { capture: true })
  host.addEventListener('pointerup', endDrag, { capture: true })
  host.addEventListener('pointercancel', endDrag, { capture: true })
  // 拖动中不要弹出长按菜单或选中文字
  host.addEventListener('contextmenu', (e) => e.preventDefault())

  const loop = () => {
    controls.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
  }

  setScene(demoScene())

  const api: Scene3d = {
    setScene,
    setReveal,
    setHighlight,
    setAnnotations,
    setPositions,
    setGrabbables: (names) => {
      grabbables = names
    },
    setViewInset: (top, bottom) => {
      const nextTop = Math.max(0, Math.round(top))
      const nextBottom = Math.max(0, Math.round(bottom))
      if (nextTop === topInset && nextBottom === bottomInset) return
      topInset = nextTop
      bottomInset = nextBottom
      syncViewport()
    },
    onGrab: null,
    onDragRay: null,
    onRelease: null,
    onFaceToggle: null,
    setAllFaces(on) {
      hiddenFaces.clear()
      // 「全部隐藏」就是把每个面都记成隐藏的；「全部显示」就是清空这张名单
      if (!on) for (const key of faceObjects.keys()) hiddenFaces.add(key)
      applyFaceVisibility()
    },
    allFacesHidden: () => faceObjects.size > 0 && hiddenFaces.size >= faceObjects.size,
    hasFaces: () => faceObjects.size > 0,
    hasAux: () => auxEdges.size > 0 || auxPoints.size > 0,
    setActive(on: boolean) {
      // 切到别的界面时停掉渲染循环，省电也省得标签漏出来
      // 注意要用 'block' 而不是 ''：样式表里 #hint 默认是 display:none，置空会退回那条规则，提示行就永远不出现
      labelHost.style.display = on ? 'block' : 'none'
      hint.style.display = on ? 'block' : 'none'
      if (!on) {
        renderer.setAnimationLoop(null)
        return
      }
      syncViewport()
      renderer.setAnimationLoop(loop)
    },
  }
  return api
}
