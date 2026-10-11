import { arcPoints, planeNormal, projectOnPlane } from './angle.ts'
import { parseExpr } from './symbolic.ts'
import type { Vec3 } from './solver.ts'

/**
 * 把「要标哪个角」翻译成「图上该画什么」。
 *
 * 三类角画法不同，差别就在这里处理：
 * - 线线角：两条线共点就直接画；异面就把第二条平移到顶点处再画（课本上的做法）。
 * - 线面角：先找斜线与平面的交点作顶点，再算出另一个端点在平面上的射影，补一条射影线，
 *   弧画在「斜线」与「射影」之间。
 * - 二面角：在棱上取一点，往两个面内各作一条垂直于棱的射线（这就是平面角），弧画在这两条之间。
 *
 * 纯计算，能在 node 里验。
 */

export type AngleSpec =
  /** 直线 p 与直线 q 的夹角 */
  | { kind: 'lineLine'; p: [string, string]; q: [string, string]; label?: string; value?: string; of?: AngleUnit }
  /** 直线与平面的夹角 */
  | { kind: 'linePlane'; line: [string, string]; plane: [string, string, string]; label?: string; value?: string; of?: AngleUnit }
  /** 二面角：棱为 edge，inA 与 inB 分别是两个半平面内（不在棱上）的点 */
  | { kind: 'dihedral'; edge: [string, string]; inA: string; inB: string; label?: string; value?: string; of?: AngleUnit }

/** value 这个数是什么意思：度数，还是角的余弦、正弦 */
export type AngleUnit = 'degrees' | 'cos' | 'sin'

export interface Annotation {
  /** 弧心 */
  vertex: Vec3
  /** 弧的两个方向（单位向量） */
  dirFrom: Vec3
  dirTo: Vec3
  /** 为了把角画对而必须补出来的辅助线（射影线、平面角的两条边） */
  extraEdges: [Vec3, Vec3][]
  /** 度数标签摆在哪 */
  labelAt: Vec3
  /** 要显示的文字 */
  text: string
  /** 本地算出来的度数 */
  degrees: number
  /** 模型给的写法有没有过反验；模型没给 value 时是 undefined */
  verified?: boolean
  /** 反验没过的原因 */
  mismatch?: string
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
const unit = (a: Vec3): Vec3 | null => {
  const l = len(a)
  if (l < 1e-12) return null
  return [a[0] / l, a[1] / l, a[2] / l]
}
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
const DEG = 180 / Math.PI

/**
 * 决定这个角在图上显示成什么文字。
 *
 * 原则：**度数永远由本地算**，模型给的写法只是「更好看的排版」。
 * 模型报得出、且与本地算出来的一致，就用它的写法（例如 cos θ = √3/6）；
 * 报不出或者对不上，就退回本地算出的度数 —— 宁可难看，也不能显示一个可能错的数。
 */
export function formatAngle(spec: AngleSpec, degrees: number): { text: string; verified?: boolean; mismatch?: string } {
  const label = spec.label?.trim() ?? ''
  const degText = `${degrees.toFixed(2)}°`
  const fallback = label ? `${label} = ${degText}` : degText
  if (!spec.value) return { text: fallback }

  const of: AngleUnit = spec.of ?? 'degrees'
  const want =
    of === 'cos' ? Math.cos((degrees * Math.PI) / 180) : of === 'sin' ? Math.sin((degrees * Math.PI) / 180) : degrees
  // 度数容许一位小数的写法（35.26 与 35.2644 算一致）；余弦正弦按绝对误差比
  const tol = of === 'degrees' ? 0.06 : 5e-4

  let got: number
  try {
    got = parseExpr(spec.value)
  } catch (e) {
    return { text: fallback, verified: false, mismatch: `看不出「${spec.value}」是什么：${e instanceof Error ? e.message : e}` }
  }
  if (Math.abs(got - want) <= tol) return { text: label ? `${label} = ${spec.value}` : spec.value, verified: true }
  return {
    text: fallback,
    verified: false,
    mismatch: `模型写 ${spec.value}，本地按${of === 'cos' ? '余弦' : of === 'sin' ? '正弦' : '度数'}算是 ${want.toFixed(4)}`,
  }
}

export function buildAnnotation(
  spec: AngleSpec,
  at: (name: string) => Vec3 | undefined,
  radius: number,
): Annotation | null {
  const need = (name: string): Vec3 | null => at(name) ?? null
  /** 标签摆在两个方向的角平分线上、弧的外侧 */
  const place = (vertex: Vec3, from: Vec3, to: Vec3) => {
    const mid = unit(add(from, to))
    return mid ? add(vertex, mul(mid, radius * 1.45)) : add(vertex, mul(from, radius * 1.45))
  }

  if (spec.kind === 'lineLine') {
    const [a, b] = spec.p
    const [c, d] = spec.q
    const P = need(a)
    const Q = need(b)
    const R = need(c)
    const S = need(d)
    if (!P || !Q || !R || !S) return null

    const shared = [a, b].find((n) => n === c || n === d)
    let vertex: Vec3
    let from: Vec3 | null
    let to: Vec3 | null
    const extraEdges: [Vec3, Vec3][] = []

    if (shared) {
      vertex = [P, Q, R, S][[a, b].indexOf(shared)]
      const other1 = shared === a ? Q : P
      const other2 = shared === c ? S : R
      from = unit(sub(other1, vertex))
      to = unit(sub(other2, vertex))
    } else {
      // 异面：把第二条平移到顶点处，并把平移后的那条线段画出来（课本上就是这么作的）
      vertex = P
      from = unit(sub(Q, P))
      to = unit(sub(S, R))
      if (to) extraEdges.push([vertex, add(vertex, mul(to, len(sub(S, R))))])
    }
    if (!from || !to) return null

    const degrees = Math.acos(clamp(Math.abs(dot(from, to)), 0, 1)) * DEG
    const fmt = formatAngle(spec, degrees)
    return {
      vertex,
      dirFrom: from,
      dirTo: to,
      extraEdges,
      labelAt: place(vertex, from, to),
      text: fmt.text,
      verified: fmt.verified,
      mismatch: fmt.mismatch,
      degrees,
    }
  }

  if (spec.kind === 'linePlane') {
    const [a, b] = spec.line
    const A = need(a)
    const B = need(b)
    const p0 = need(spec.plane[0])
    const p1 = need(spec.plane[1])
    const p2 = need(spec.plane[2])
    if (!A || !B || !p0 || !p1 || !p2) return null
    const n = planeNormal(p0, p1, p2)
    if (!n) return null

    const d = sub(B, A)
    const denom = dot(d, n)
    // 直线落在平面内时线面角是 0，没有弧可画
    if (Math.abs(denom) < 1e-12) return null
    const t = dot(sub(p0, A), n) / denom
    const vertex = add(A, mul(d, t))

    // 离顶点较远的那个端点，就是斜线的另一头
    const far = len(sub(A, vertex)) > len(sub(B, vertex)) ? A : B
    const from = unit(sub(far, vertex))
    if (!from) return null
    const foot = projectOnPlane(far, p0, p1, p2)
    if (!foot) return null

    const extraEdges: [Vec3, Vec3][] = []
    let to: Vec3 | null = null
    if (len(sub(foot, vertex)) < 1e-9) {
      // 直线垂直于平面时射影缩成一个点，没有射影线可画；
      // 这时平面内任取一个方向，夹角都是 90°。
      const toward = unit(sub(p1, vertex)) ?? unit(sub(p2, vertex))
      if (!toward) return null
      const along = dot(toward, n)
      to = unit([toward[0] - along * n[0], toward[1] - along * n[1], toward[2] - along * n[2]])
    } else {
      to = unit(sub(foot, vertex))
      // 射影线：没有它这个角在图上根本看不出来
      extraEdges.push([vertex, foot])
    }
    if (!to) return null

    const degrees = Math.asin(clamp(Math.abs(dot(from, n)), 0, 1)) * DEG
    const fmt = formatAngle(spec, degrees)
    return {
      vertex,
      dirFrom: from,
      dirTo: to,
      extraEdges,
      labelAt: place(vertex, from, to),
      text: fmt.text,
      verified: fmt.verified,
      mismatch: fmt.mismatch,
      degrees,
    }
  }

  // 二面角
  const P = need(spec.edge[0])
  const Q = need(spec.edge[1])
  const X = need(spec.inA)
  const Y = need(spec.inB)
  if (!P || !Q || !X || !Y) return null
  const e = unit(sub(Q, P))
  if (!e) return null

  /** 去掉沿棱方向的分量，得到「垂直于棱」的方向 */
  const perpTo = (point: Vec3): Vec3 | null => {
    const v = sub(point, P)
    const along = dot(v, e)
    return unit([v[0] - along * e[0], v[1] - along * e[1], v[2] - along * e[2]])
  }
  const dirA = perpTo(X)
  const dirB = perpTo(Y)
  if (!dirA || !dirB) return null

  const degrees = Math.acos(clamp(dot(dirA, dirB), -1, 1)) * DEG
  const fmt = formatAngle(spec, degrees)
  return {
    vertex: P,
    dirFrom: dirA,
    dirTo: dirB,
    // 平面角的两条边，缺了它二面角在图上就是一个悬空的弧
    extraEdges: [
      [P, add(P, mul(dirA, radius))],
      [P, add(P, mul(dirB, radius))],
    ],
    labelAt: place(P, dirA, dirB),
    text: fmt.text,
      verified: fmt.verified,
      mismatch: fmt.mismatch,
    degrees,
  }
}

/** 画一条标注所需要的全部几何量 */
export interface AnnotationShape {
  /** 弧上的点列 */
  arc: Vec3[]
  /** 必须补出来的辅助线（射影线、平面角的两条边） */
  extras: [Vec3, Vec3][]
  labelAt: Vec3
  text: string
}

/** 把算好的角变成可以直接画的一串几何量 */
export function arcShape(a: Annotation, radius: number): AnnotationShape {
  const from = add(a.vertex, mul(a.dirFrom, radius))
  const to = add(a.vertex, mul(a.dirTo, radius))
  return { arc: arcPoints(a.vertex, from, to, radius), extras: a.extraEdges, labelAt: a.labelAt, text: a.text }
}

/** 从场景与坐标里算出半径该取多大 —— 太小看不见，太大压到别的元素 */
export function suggestRadius(points: Vec3[]): number {
  if (!points.length) return 0.5
  let lo = Infinity
  let hi = -Infinity
  for (const p of points) {
    lo = Math.min(lo, p[0], p[1], p[2])
    hi = Math.max(hi, p[0], p[1], p[2])
  }
  return Math.max(0.15, (hi - lo) * 0.12)
}
