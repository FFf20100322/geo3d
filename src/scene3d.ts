import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { EDGES, FACES, VERTICES, selfCheck } from './geo'
import { planeNormal } from './angle'
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
  /**
   * 这一步**正在长出来**的那几条棱，以及长到了几成（0..1）。
   *
   * 为什么要有它：滑杆如果只有「四个节点」，就只能看四条辅助线一条条蹦出来，
   * 中间什么都没有 —— 而辅助线是怎么画出来的，恰恰是解题过程里最该看清的部分。
   * 有了这个，滑杆可以分成很细的格子，一条线从无到有慢慢拉出来。
   */
  grow?: { edges: Set<string>; t: number }
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
  /**
   * 画/清掉带箭头的矢量。三种解题法共用：
   * 向量法是黄色的向量，基底法与坐标系法是蓝色的基底与坐标轴。
   */
  setArrows(list: { from: string; to: string; color: 'yellow' | 'blue'; label?: string; extend?: number }[]): void
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
  /** 某个面现在是不是被关掉了。元素清单只读它，不自己再记一份状态。 */
  isFaceHidden(key: string): boolean
  /** 开/关某个面。清单上的勾选框与图上单击面改的是同一份状态。 */
  setFaceHidden(key: string, hidden: boolean): void
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
  /** 每条棱两端的世界坐标，滑杆按进度把辅助线拉出来时要用（别和下面那个同名的搞混） */
  let edgeCoords = new Map<string, [Vec3, Vec3]>()
  let vertexObjects = new Map<string, CSS2DObject>()
  /** 点名对应的那个 DOM，用来处理标注互相遮挡 */
  const labelEls = new Map<string, HTMLElement>()
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
    labelsDirty = true // 换了图要重新排一次标注
    edgeObjects = new Map()
    vertexObjects = new Map()
    faceObjects.clear()
    hiddenFaces.clear() // 换图就是全显示，别把上一张图关掉的面带到这一张
    edgeEnds.clear()
    edgeCoords.clear() // 换了图形，上一张图的棱端点坐标就没用了，留着会张冠李戴
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
      // 两端坐标留着：滑杆把一条辅助线拉出来时，要按进度把端点从起点往终点挪
      edgeCoords.set(e.key, [e.a, e.b])
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
      labelEls.set(v.name, el)
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
    // 不是用手指拖点（例如面板上的滑杆）时，位置一变就重排一次；
    // 手指拖点那条路要按住，等松手再排 —— 那是用户明确要求的。
    if (dragging === null) labelsDirty = true
    for (const name of moved) positions[name] = pos[name]

    for (const name of moved) {
      const obj = vertexObjects.get(name)
      if (obj) obj.position.set(pos[name][0], pos[name][1], pos[name][2])
    }
    const dirty = new Set(moved)
    for (const [key, line] of edgeObjects) {
      // 这里要的是**两端的点名**（下面按名字去查新坐标），不是坐标本身
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
    const grow = reveal?.grow
    for (const [key, line] of edgeObjects) {
      if (!auxEdges.has(key)) continue // 题面原有的棱永远显示
      if (grow?.edges.has(key)) {
        // 正在长出来：把第二个端点从起点往终点挪，挪到几成就画到几成。
        // 直接改顶点缓冲（而不是用缩放）—— 线段的粗细不该跟着变。
        line.visible = true
        const ends = edgeCoords.get(key)
        if (ends) {
          const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
          const [a, b] = ends
          const t = Math.max(0, Math.min(1, grow.t))
          attr.setXYZ(1, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
          attr.needsUpdate = true
          line.geometry.computeBoundingSphere()
        }
        continue
      }
      line.visible = reveal === null || reveal.edges.has(key)
      // 长完的那些要恢复成完整的一条，否则上一帧的「半截」会留着
      const ends = edgeCoords.get(key)
      if (ends && line.visible) {
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
        attr.setXYZ(1, ends[1][0], ends[1][1], ends[1][2])
        attr.needsUpdate = true
      }
    }
    for (const [name, obj] of vertexObjects) {
      if (!auxPoints.has(name)) continue
      obj.visible = reveal === null || reveal.points.has(name)
    }
  }

  /** 带箭头的矢量。三种解题法共用：向量法黄色，基底法与坐标系法蓝色。 */
  const arrowGroup = new THREE.Group()
  scene.add(arrowGroup)
  const ARROW_COLORS = { yellow: 0xffd166, blue: 0x4f8cff } as const

  /** 箭头尖端的字（坐标轴的 x/y/z），跟着模型一起转，所以挂在 group 下 */
  let arrowLabels: CSS2DObject[] = []
  /**
   * 箭头尖端离图形中心最远有多远。
   *
   * 坐标轴会伸出图形之外（用户要求「比图形长一点」），取景如果只按图形本身算，
   * **轴尖就会被切在屏幕外** —— 真机上见过 z 轴的那个字跑到屏幕上方看不见了。
   * 所以取景要把这个也算进去。标注显隐仍然只看图形本身的大小（那是另一回事）。
   */
  let arrowReach = 0

  function setArrows(list: { from: string; to: string; color: 'yellow' | 'blue'; label?: string; extend?: number }[]): void {    // 每次重建最省事：箭头数量很少（顶多几个），而增量更新要维护一堆映射关系，
    // 那是给几百个对象准备的复杂度，这里用不上。
    for (const a of [...arrowGroup.children]) arrowGroup.remove(a)
    for (const l of arrowLabels) l.removeFromParent()
    arrowLabels = []
    arrowReach = 0
    for (const item of list) {
      const a = positions[item.from]
      const b = positions[item.to]
      if (!a || !b) continue
      const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
      // extend：把箭头**伸出去一截**。坐标轴必须这么做 ——
      // 三个轴上取的点本来就是图形自己的顶点（比如 A、B、D、A₁），
      // 不延长的话箭头正好停在那些点上，和原点标注糊在一起，也看不出轴伸到哪儿。
      const dirLen = dir.length()
      const len = dirLen * (item.extend ?? 1)
      if (dirLen < 1e-9) continue
      const unit = dir.clone().normalize()
      // **把箭头从它所依附的那条棱旁边错开一点。**
      // 基底的三个方向常常正好和图形的棱重合（比如 AB、AD、AA₁ 就是正方体的三条棱），
      // 不错开的话箭头完全被棱盖住，看上去像没画。
      // 错开方向取「垂直于箭头、也垂直于视线」—— 这样在屏幕上看起来是**横向平移**，
      // 不管从哪个角度看都不会盖在棱上。
      let off = new THREE.Vector3(0, 0, 0)
      if (lastFit) {
        const view = camera.position.clone().sub(lastFit.center).normalize()
        const side = new THREE.Vector3().crossVectors(unit, view)
        if (side.lengthSq() > 1e-9) off = side.normalize().multiplyScalar(lastFit.radius * 0.045)
      }
      const start = new THREE.Vector3(a[0] + off.x, a[1] + off.y, a[2] + off.z)
      const head = len * 0.09
      const arrow = new THREE.ArrowHelper(unit, start, len, ARROW_COLORS[item.color], head, head * 0.55)
      // 画在图形旁边一点，免得和棱完全重叠、看不出那里有箭头
      arrow.renderOrder = 2
      arrowGroup.add(arrow)
      // 记下箭头伸到多远，取景要用（把错开的量也算上）
      if (lastFit) {
        const c = lastFit.center
        const tipX = start.x + unit.x * len
        const tipY = start.y + unit.y * len
        const tipZ = start.z + unit.z * len
        arrowReach = Math.max(arrowReach, Math.hypot(tipX - c.x, tipY - c.y, tipZ - c.z))
      }
      // 尖端那个字（坐标轴的 x / y / z）。没有它根本分不出哪条轴是哪条。
      if (item.label) {
        const el = document.createElement('div')
        el.className = 'axis-label'
        el.textContent = item.label
        const obj = new CSS2DObject(el)
        // 字放在**箭头的实际尖端**：起点已经错开过，长度也可能被 extend 延长过，
        // 所以要按 start + unit×len 算，不能用原来那个点。
        obj.position.set(start.x + unit.x * len, start.y + unit.y * len, start.z + unit.z * len)
        group.add(obj)
        arrowLabels.push(obj)
      }
    }
    // 箭头变了就可能伸得更远，取景跟着重算一次（用户自己转过视角就不动他的）
    if (!userAdjusted) applyFit()
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
    labelsDirty = true
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
    const size = box.getSize(new THREE.Vector3())
    const radius = Math.max(size.length() / 2, 0.5)
    controls.target.copy(center)

    // 取景方向：找最大的那个面当「底面」，从它法向偏大约 40° 看过去。
    //
    // 试过两种不行的办法：
    // ① 写死一个方向 —— 模型不一定把底面放在水平面上，真机上见过锥顶偏到左下方的图；
    // ② 挑「投影面积最大」的方向 —— 对四棱锥来说那等于正对一个侧面，反而最扁、最不像立体。
    // 按几何选才对：底面法向偏开一点，既看得到底面、也看得到侧面，这就是课本插图的视角。
    let basePts: Vec3[] | null = null
    let baseArea = 0
    for (const f of r.faces) {
      if (!f.pts || f.pts.length < 3) continue
      const n = planeNormal(f.pts[0], f.pts[1], f.pts[2])
      if (!n) continue
      let area = 0
      for (let i = 1; i + 1 < f.pts.length; i++) {
        const [a, b, c] = [f.pts[0], f.pts[i], f.pts[i + 1]]
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
        const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
        const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
        area += Math.hypot(cr[0], cr[1], cr[2]) / 2
      }
      if (area > baseArea) {
        baseArea = area
        basePts = f.pts
      }
    }

    let dir: THREE.Vector3
    const bn = basePts ? planeNormal(basePts[0], basePts[1], basePts[2]) : null
    if (bn) {
      const n = new THREE.Vector3(bn[0], bn[1], bn[2]).normalize()

      // 法向的朝向是算出来的、正负都有可能，必须把它摆到「立体所在的那一侧」，
      // 否则相机会跑到图形底下去 —— 真机上就见过从下往上看四棱锥，
      // 顶点 P 被投影到底面四边形外面，整张图看不懂。
      // 判据很直接：立体里总有点不在底面上，取离底面最远的那个点，
      // 看在法向的正侧还是负侧，负侧就把法向翻过来。
      const base0 = basePts![0]
      const b0 = new THREE.Vector3(base0[0], base0[1], base0[2])
      const rel = new THREE.Vector3()
      let far = 0
      for (const p of all) {
        rel.set(p.x, p.y, p.z).sub(b0)
        const d = rel.dot(n)
        if (Math.abs(d) > Math.abs(far)) far = d
      }
      if (far < 0) n.negate()

      // 找一个与法向垂直的方向当「斜过去」的参照
      const seed = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
      const tangent = new THREE.Vector3().crossVectors(n, seed).normalize()
      // 偏离法向多远：1.2 对应相机在底面上方约 40°，是「既看得到底面、也看得到侧面」的折中。
      // 试过 0.85（约 50°，太靠上、高被压扁）与 2.0（约 27°，太贴底面）。
      dir = n.clone().addScaledVector(tangent, 1.2).normalize()
    } else {
      dir = new THREE.Vector3(1, 0.8, 1.2).normalize()
    }
    camera.position.copy(center).addScaledVector(dir, radius * 2.9)
    // 近裁剪面设小、最近距离几乎不限，这样放大时能一路进到模型内部去看
    camera.near = radius / 2000
    camera.far = radius * 200
    camera.updateProjectionMatrix()
    controls.minDistance = radius * 0.01
    controls.maxDistance = radius * 12
    controls.update()

    // 记住这次取景，等上下让位定下来之后还要按真实可用区域重算一次距离
    lastFit = { center: center.clone(), radius, dir: dir.clone() }
    userAdjusted = false
    applyFit()
  }

  /**
   * 取景距离：按**当前**的宽高比与视野角算，让图形的外接球正好装得下。
   *
   * 为什么不能写死一个倍数：上下的工具条与播放条会占掉一块，画布实际比窗口矮不少。
   * 用窗口尺寸算出来的距离，等让位生效之后就太近了 —— 真机上见过图形撑出屏幕、
   * 只看得到中间一块。这里按真实的宽高比算，让位变化时重算一次就总是合适的。
   */
  function applyFit(): void {
    if (!lastFit) return
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.01))
    // 箭头（坐标轴）可能伸到图形外面，取景要按「图形与箭头的较大者」来 ——
    // 只按图形算的话，轴尖会被切在屏幕外（真机上 z 轴的字就跑到了屏幕上面）。
    const need = Math.max(lastFit.radius, arrowReach)
    const dv = need / Math.sin(vFov / 2)
    const dh = need / Math.sin(Math.min(hFov / 2, Math.PI / 2 - 1e-3))
    const dist = Math.max(dv, dh) * 1.1 // 留一成余量，免得贴着边
    controls.target.copy(lastFit.center)
    camera.position.copy(lastFit.center).addScaledVector(lastFit.dir, dist)
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
      : labelProblems.length
        ? `⚠ ${labelProblems.join('；')}`
        : '按住橙色点可直接拖动 · 单指旋转 · 双指缩放'
  }
  window.addEventListener('resize', syncViewport)

  // ---- 手势消歧：按在动点上就拖点，按在别处就转视角 ----
  // 监听挂在 #app 的捕获阶段：它比画布自己的监听器先跑，所以能抢在轨道控制之前把事件截下来。
  // 直接在画布上监听是没用的 —— 同一元素上的监听器按注册顺序执行，抢不过先注册的 OrbitControls。
  let grabbables: string[] = []
  let dragging: string | null = null
  /**
   * 标注要不要重排。
   *
   * 用户要求角度标注**不要在拖动/旋转过程中实时重排**，停手之后算一次就行：
   * 转的时候顺、也不会有标注乱跳。所以这个标记只在「交互结束」与
   * 「图形本身变了且不是在拖点」时置起，拖动过程中一律按住。
   */
  /** 复用的临时向量：算标签世界坐标用，避免每帧新建对象 */
  const tmpWorld = new THREE.Vector3()
  /** 上一次取景的参数；让位变化时要按新的宽高比重算距离 */
  let lastFit: { center: THREE.Vector3; radius: number; dir: THREE.Vector3 } | null = null
  /** 用户手动转过/缩放过之后就不再自动取景 —— 否则一让位就把人家的视角掰回去 */
  let userAdjusted = false
  let labelsDirty = true
  /**
   * 标注排完之后仍然重叠的地方。排完就把结果记在这里，由提示行显示出来 ——
   * 「标注互相压住」在画面上看着只是字糊了，不报出来就没人知道是哪儿出的问题。
   */
  let labelProblems: string[] = []
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
      labelsDirty = true // 手松了才重排一次
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

  /** 估算一个标签在屏幕上的宽度：中日韩字符按一个字宽算，其余按半个。
   *  必须按文字长度估：标签长短差三倍（「∠APB = 60°」对「PA 与底面所成角 = √3/3」），
   *  用固定宽度的话长标签的中心离得远、判不出冲突，实际却盖住了旁边的点标注。 */
  function estimateWidth(text: string): number {
    let units = 0
    for (const ch of text) units += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.6
    return Math.max(36, units * 13 + 18)
  }

  /**
   * 角度与长度标签互相压住时，在屏幕空间把它们推开。
   *
   * 点标注**永远不隐藏**（用户定过「所有的点的标注必须常驻」），所以冲突时是让这些标签让位：
   * 既要互相躲开，也要躲开点的标注。推开量加在 CSS2DRenderer 设好的 transform 后面
   * （CSS 变换可以叠加），不动标签在世界里的位置，所以下一帧重新算也不会越推越偏。
   */
  function spreadAnnotLabels(): void {
    const items: { el: HTMLElement; x: number; y: number; dx: number; dy: number; w: number }[] = []
    for (const s of slots) {
      const el = s.label.element as HTMLElement
      if (el.style.display === 'none' || !el.textContent) continue
      // 必须用**世界坐标**：标签挂在 group 下，position 是局部坐标，
      // 直接拿它去投影算出来的是错的位置 —— 表现就是「检测说没重叠、画面上却压着」。
      s.label.getWorldPosition(tmpWorld)
      const sc = screenOf([tmpWorld.x, tmpWorld.y, tmpWorld.z])
      items.push({ el, x: sc.x, y: sc.y, dx: 0, dy: 0, w: estimateWidth(el.textContent ?? '') })
    }

  }

  /**
   * 图形在屏幕上小于这个像素半径时，标注整体不显示（否则必然糊成一团）。
   *
   * 这是一个**凭手感调的旋钮**，没有理论值：定大了，稍微缩一点标注就没了（用户嫌过）；
   * 定小了，缩到看不清时还挤着一堆字。现在的 28 是用户看过之后定的量级 ——
   * 「差不多像现在这么小的时候才消失」。要改就改这一个数。
   */
  const ANNOT_MIN_PIXELS = 28

  /**
   * 缩得太小时把标注整体藏起来，**任何档位都一样**。
   *
   * 为什么要有这条：标注贴着面摆（不做避让）之后，图形一小就必然挤在一起 ——
   * 那是无解的，屏幕上没有那么多地方。与其让它糊成一团，不如干脆不显示：
   * 缩到那个程度，用户本来也是在找位置，不是在看具体某个角。
   */
  function syncAnnotVisibility(): void {
    if (!lastFit) return
    // 用「距离 + 视野角」直接算图形在屏幕上的像素半径。
    //
    // 这里踩过一个坑：最初是把「中心点 + 半径 × 相机的上方向」投影到屏幕上量两点距离。
    // 那个算法的结果**会随观察角度变** —— 相机转到从正上方往下看时，
    // 「上方向」几乎与视线平行，投到屏幕上几乎没有长度，于是被误判成「缩得太小」，
    // 转个角度标注就整片消失。
    // 用户要的是「只有缩小时才不显示」，所以必须用与朝向无关的量：
    // 像素半径 = 世界半径 / 距离 × (画布高 / (2·tan(半视野角)))，再除以 2。
    const h = renderer.domElement.getBoundingClientRect().height
    if (h <= 0) return
    const dist = camera.position.distanceTo(lastFit.center)
    const vFov = (camera.fov * Math.PI) / 180
    const pixels = (lastFit.radius / Math.max(dist, 1e-6)) * (h / (2 * Math.tan(vFov / 2))) / 2
    annotGroup.visible = pixels >= ANNOT_MIN_PIXELS
  }

  const loop = () => {
    controls.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
    // 标注会不会糊成一团是跟着缩放变的，所以每帧看一眼
    syncAnnotVisibility()
    // 标注的摆放不每帧算：用户要求拖动/旋转过程中不要实时重排，停手之后算一次就行。
    // 这样转起来顺，也不会看到标注在转动过程中乱跳。
    if (labelsDirty) {
      spreadAnnotLabels()
      labelsDirty = false
    }
  }

  // 手一松就重排一次（拖动、旋转、缩放结束都算）
  controls.addEventListener('start', () => {
    // 用户一动手就接管视角，之后不再自动取景
    userAdjusted = true
  })
  controls.addEventListener('end', () => {
    labelsDirty = true
  })

  // 画布尺寸一变也要重排。这一条是必须的：挂载后的第一帧画布往往还没定尺寸
  // （渲染区要让位给上下那些控件），那一帧所有标签会投影到同一个点、被挤成一堆；
  // 而重排现在只在「需要时」发生，没有这个监听，那一堆错误位置就会一直留着。
  new ResizeObserver(() => {
    labelsDirty = true
  }).observe(host)

  setScene(demoScene())

  const api: Scene3d = {
    setScene,
    setReveal,
    setHighlight,
    setAnnotations,
    setPositions,
    setArrows,
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
      // 可用区域变了：用户还没自己转过就重新取一次景，转过就不动他的视角
      if (!userAdjusted) applyFit()
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
    isFaceHidden: (key) => hiddenFaces.has(key),
    setFaceHidden(key, hidden) {
      // 清单上的勾选框走这条路。改完要通知界面，让「面：全开/全关」按钮与
      // 清单上的回显一起刷新 —— 两处不同步就会出现「清单说开着、图上是关的」。
      if (hidden) hiddenFaces.add(key)
      else hiddenFaces.delete(key)
      applyFaceVisibility()
      api.onFaceToggle?.()
    },
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
