import { Vector3 } from 'three'
// 带 .ts 后缀：这个模块要被 node 直接导入跑自检，值导入不给后缀会解析不到
import { isMoving, type Constraint, type PointDef, type Vec3 } from './solver.ts'

/**
 * 场景层：把模型返回的 json 解析成求解器能吃的结构，再转成渲染能用的结构。
 * 这一层是纯函数，能在 node 里直接跑，所以不靠截图也能验证。
 *
 * 一条硬规矩：遇到不认识的东西就报错，绝不猜。
 * 猜错一个约束 = 给你一张看着正常、其实错的图，那比说「我不会」糟糕得多。
 */

export interface Scene {
  points: PointDef[]
  edges: [string, string][]
  faces: string[][]
  constraints: Constraint[]
}

const SUB_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

/** A1 → A₁。模型按约定输出 ASCII 名称，显示与内部统一用下标写法。 */
export function toDisplayName(name: string): string {
  const m = /^([A-Za-z]+?)_?(\d+)$/.exec(name.trim())
  if (!m) return name.trim()
  return m[1] + [...m[2]].map((d) => SUB_DIGITS[+d]).join('')
}

const POINT_KINDS = [
  'free',
  'midpoint',
  'ratio',
  'offset',
  'perpFoot',
  'projLine',
  'onSegment',
  'inFace',
] as const
const CONSTRAINT_KINDS = [
  'distance',
  'equalDistance',
  'angle',
  'lineAngle',
  'perpendicular',
  'parallel',
  'perpLinePlane',
  'coplanar',
] as const

class SceneError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const str = (x: unknown, what: string): string => {
  if (typeof x !== 'string' || !x.trim()) throw new SceneError(`${what} 应该是一个字符串`)
  return x.trim()
}
const num = (x: unknown, what: string): number => {
  const n = typeof x === 'string' ? Number(x) : x
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new SceneError(`${what} 应该是一个数字`)
  return n
}
const arr = (x: unknown, what: string): unknown[] => {
  if (!Array.isArray(x)) throw new SceneError(`${what} 应该是一个数组`)
  return x
}

/** 解析并校验模型返回的场景。任何不认识的东西都会抛错，由调用方决定是重试还是如实告知失败。 */
export function parseScene(raw: unknown): Scene {
  if (!isObj(raw)) throw new SceneError('场景不是一个对象')

  const rawPoints = arr(raw.points, 'points')
  if (rawPoints.length < 3) throw new SceneError('点太少，构不成一个立体图形')

  const points: PointDef[] = []
  const known = new Set<string>()
  for (const p of rawPoints) {
    if (!isObj(p)) throw new SceneError('points 里有一项不是对象')
    const name = toDisplayName(str(p.name, '点的 name'))
    if (known.has(name)) throw new SceneError(`点 ${name} 重复定义了`)
    known.add(name)
    const kind = str(p.kind, `点 ${name} 的 kind`)
    if (!(POINT_KINDS as readonly string[]).includes(kind)) {
      throw new SceneError(`点 ${name} 的类型「${kind}」我还不会处理`)
    }
    if (kind === 'free') {
      const at = p.at === undefined ? undefined : (arr(p.at, `点 ${name} 的 at`).map((x) => num(x, '坐标')) as Vec3)
      if (at && at.length !== 3) throw new SceneError(`点 ${name} 的坐标应该是三个数`)
      points.push({ name, kind: 'free', at })
    } else if (kind === 'midpoint' || kind === 'ratio' || kind === 'onSegment') {
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== 2) throw new SceneError(`点 ${name} 的 of 应该是两个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      if (kind === 'midpoint') points.push({ name, kind: 'midpoint', of: of as [string, string] })
      else if (kind === 'onSegment')
        points.push({ name, kind: 'onSegment', of: of as [string, string], t: num(p.t ?? 0.5, `点 ${name} 的 t`) })
      else points.push({ name, kind: 'ratio', of: of as [string, string], t: num(p.t ?? 0.5, `点 ${name} 的 t`) })
    } else if (kind === 'inFace') {
      const face = arr(p.face, `点 ${name} 的 face`).map((x) => toDisplayName(str(x, '点名称')))
      if (face.length < 3 || face.length > 4) throw new SceneError(`点 ${name} 所在的面需要三到四个顶点`)
      for (const k of face) if (!known.has(k)) throw new SceneError(`点 ${name} 引用的面里有还没定义的点 ${k}`)
      points.push({
        name,
        kind: 'inFace',
        face,
        u: num(p.u ?? 0.5, `点 ${name} 的 u`),
        v: num(p.v ?? 0.5, `点 ${name} 的 v`),
      })
    } else if (kind === 'perpFoot' || kind === 'projLine') {
      const want = kind === 'perpFoot' ? 4 : 3
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== want) throw new SceneError(`点 ${name} 的 of 应该有 ${want} 个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      if (kind === 'perpFoot')
        points.push({ name, kind: 'perpFoot', of: of as [string, string, string, string] })
      else points.push({ name, kind: 'projLine', of: of as [string, string, string] })
    } else {
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== 3) throw new SceneError(`点 ${name} 的平移派生需要三个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      points.push({ name, kind: 'offset', of: of as [string, string, string] })
    }
  }

  const ref = (x: unknown, what: string): string => {
    const name = toDisplayName(str(x, what))
    if (!known.has(name)) throw new SceneError(`${what} 引用了不存在的点 ${name}`)
    return name
  }

  const edges: [string, string][] = arr(raw.edges ?? [], 'edges').map((e, i) => {
    const pair = arr(e, `第 ${i + 1} 条棱`).map((x) => ref(x, `第 ${i + 1} 条棱`))
    if (pair.length !== 2 || pair[0] === pair[1]) throw new SceneError(`第 ${i + 1} 条棱的端点不对`)
    return pair as [string, string]
  })

  const faces: string[][] = arr(raw.faces ?? [], 'faces').map((f, i) => {
    const ring = arr(f, `第 ${i + 1} 个面`).map((x) => ref(x, `第 ${i + 1} 个面`))
    if (ring.length < 3) throw new SceneError(`第 ${i + 1} 个面少于三个顶点`)
    return ring
  })

  const constraints: Constraint[] = arr(raw.constraints, 'constraints').map((c, i) => {
    if (!isObj(c)) throw new SceneError(`第 ${i + 1} 条约束不是对象`)
    const kind = str(c.kind, `第 ${i + 1} 条约束的 kind`)
    if (!(CONSTRAINT_KINDS as readonly string[]).includes(kind)) {
      throw new SceneError(`这道题用到了我还不会处理的条件「${kind}」`)
    }
    switch (kind) {
      case 'distance':
        return { kind, a: ref(c.a, 'distance'), b: ref(c.b, 'distance'), value: num(c.value, 'distance 的 value') }
      case 'equalDistance': {
        const ab = arr(c.ab, 'equalDistance.ab').map((x) => ref(x, 'equalDistance'))
        const cd = arr(c.cd, 'equalDistance.cd').map((x) => ref(x, 'equalDistance'))
        if (ab.length !== 2 || cd.length !== 2) throw new SceneError('equalDistance 需要两对点')
        return { kind, ab: ab as [string, string], cd: cd as [string, string] }
      }
      case 'angle':
        return {
          kind,
          at: ref(c.at, 'angle'),
          from: ref(c.from, 'angle'),
          to: ref(c.to, 'angle'),
          value: num(c.value, 'angle 的 value'),
        }
      case 'lineAngle': {
        const p = arr(c.p, 'lineAngle.p').map((x) => ref(x, 'lineAngle'))
        const q = arr(c.q, 'lineAngle.q').map((x) => ref(x, 'lineAngle'))
        if (p.length !== 2 || q.length !== 2) throw new SceneError('lineAngle 需要两条直线')
        return { kind, p: p as [string, string], q: q as [string, string], value: num(c.value, 'lineAngle 的 value') }
      }
      case 'perpendicular':
      case 'parallel': {
        const p = arr(c.p, `${kind}.p`).map((x) => ref(x, kind))
        const q = arr(c.q, `${kind}.q`).map((x) => ref(x, kind))
        if (p.length !== 2 || q.length !== 2) throw new SceneError(`${kind} 需要两条直线`)
        return { kind, p: p as [string, string], q: q as [string, string] }
      }
      case 'perpLinePlane': {
        const line = arr(c.line, 'perpLinePlane.line').map((x) => ref(x, 'perpLinePlane'))
        const plane = arr(c.plane, 'perpLinePlane.plane').map((x) => ref(x, 'perpLinePlane'))
        if (line.length !== 2 || plane.length !== 3) throw new SceneError('perpLinePlane 需要一条直线与三个平面点')
        return { kind, line: line as [string, string], plane: plane as [string, string, string] }
      }
      case 'coplanar': {
        const pts = arr(c.pts, 'coplanar.pts').map((x) => ref(x, 'coplanar'))
        if (pts.length !== 4) throw new SceneError('coplanar 需要四个点')
        return { kind, pts: pts as [string, string, string, string] }
      }
    }
    throw new SceneError(`第 ${i + 1} 条约束没法处理`)
  })

  if (constraints.length === 0) throw new SceneError('一条约束都没有，图形没法确定')
  return { points, edges, faces, constraints }
}

/** 棱的唯一标识。动画要按步骤逐条显示，所以每条棱都得能单独认出来。 */
export const edgeKey = (a: string, b: string) => `${a}|${b}`

export interface RVertex {
  name: string
  at: Vec3
  /** 辅助点（解题过程中才画出来的），不是题面原有的 */
  aux: boolean
  /** 动点：位置由拖动决定 */
  moving: boolean
}

export interface REdge {
  key: string
  a: Vec3
  b: Vec3
  aux: boolean
}

export interface RFace {
  /** 面名（顶点按顺序拼起来），用来支持「高亮某个面」 */
  key: string
  pts: Vec3[]
  color: number
}

export interface Renderable {
  vertices: RVertex[]
  edges: REdge[]
  faces: RFace[]
}

/** 每个共面一个颜色，循环取用 */
const PALETTE = [0x4f8cff, 0xff9f43, 0x2ecc71, 0xe74c3c, 0x9b59b6, 0xf1c40f, 0x1abc9c, 0xff7ab8]

/** 面名：顶点按顺序拼起来，是识别「高亮哪个面」的依据 */
export const faceKey = (pts: string[]) => pts.join('')

/**
 * 转成渲染能用的结构。
 * base 传入「不含辅助线的原场景」时，能算出哪些点与棱是辅助元素 —— 动画要靠这个逐条显示。
 */
export function toRenderable(scene: Scene, solved: Record<string, Vec3>, base?: Scene): Renderable {
  const at = (name: string): Vec3 => {
    const p = solved[name]
    if (!p) throw new SceneError(`求解结果里缺少点 ${name}`)
    return p
  }
  const basePoints = new Set((base ?? scene).points.map((p) => p.name))
  const baseEdges = new Set((base ?? scene).edges.map(([a, b]) => edgeKey(a, b)))

  return {
    vertices: scene.points.map((p) => ({
      name: p.name,
      at: at(p.name),
      aux: base ? !basePoints.has(p.name) : false,
      moving: isMoving(p),
    })),
    edges: scene.edges.map(([a, b]) => ({
      key: edgeKey(a, b),
      a: at(a),
      b: at(b),
      aux: base ? !baseEdges.has(edgeKey(a, b)) : false,
    })),
    faces: scene.faces.map((ring, i) => ({ key: faceKey(ring), pts: ring.map(at), color: PALETTE[i % PALETTE.length] })),
  }
}

/**
 * 渲染前把把关：面必须真的共面。
 * 模型就算约束都写对了，也可能把不属于同一个面的点连成一个面 —— 那种面画出来是扭的，
 * 肉眼很难分辨，但一眼看上去就是「怪怪的」。这里直接算出来。
 */
export function checkFacesPlanar(r: Renderable, tol = 1e-3): string[] {
  const bad: string[] = []
  for (const f of r.faces) {
    if (f.pts.length < 3) continue
    const p = f.pts.map((q) => new Vector3(...q))
    const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0]))
    if (n.length() < 1e-9) {
      bad.push('有个面的前三个点共线，构不成平面')
      continue
    }
    n.normalize()
    for (let i = 3; i < p.length; i++) {
      const d = Math.abs(new Vector3().subVectors(p[i], p[0]).dot(n))
      if (d > tol) bad.push(`有个面的第 ${i + 1} 个顶点偏离该平面 ${d.toFixed(4)}，说明这个面是扭的`)
    }
  }
  return bad
}
