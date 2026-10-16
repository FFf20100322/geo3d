import { arcPoints, planeNormal, projectOnPlane } from './angle.ts'
import { toDisplayName } from './scene.ts'
import { parseExpr, verifySymbolic } from './symbolic.ts'
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
/**
 * 把度数写成弧度制（π/3 这种）。
 *
 * 先试能不能写成 π 的简单有理倍：60° = π/3、45° = π/4、72° = 2π/5。
 * 试不出来才退回小数 —— 硬凑成「0.33π」不如直接给数。
 */
export function radianText(degrees: number): string {
  const r = (degrees * Math.PI) / 180
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16]) {
    const p = (r / Math.PI) * n
    const k = Math.round(p)
    if (k > 0 && Math.abs(p - k) < 1e-9) {
      if (n === 1) return k === 1 ? 'π' : `${k}π`
      return `${k === 1 ? '' : k}π/${n}`
    }
  }
  return r.toFixed(3)
}

/** 角度按哪种单位显示。默认角度制 —— 课本、考卷、题目给的度数都是角度制 */
export type AngleDisplay = 'degrees' | 'radians'

/** 把算出来的度数写成要显示的那段文字 */
export function degreeText(degrees: number, display: AngleDisplay): string {
  if (display === 'radians') return radianText(degrees)
  return Math.abs(degrees - Math.round(degrees)) < 0.005 ? `${Math.round(degrees)}°` : `${degrees.toFixed(2)}°`
}

export function formatAngle(
  spec: AngleSpec,
  degrees: number,
  display: AngleDisplay = 'degrees',
): { text: string; verified?: boolean; mismatch?: string } {
  const label = spec.label?.trim() ?? ''
  // 直角只画小方块、不写度数 —— 这是课本的规矩，也是让图不糊成一团的关键：
  // 正方体上有二十几个直角，每个都挂一行「90°」的话什么都看不见了。
  if (isRightAngle(degrees)) {
    const bad = checkValue(spec, degrees)
    return bad.verified === false ? { text: '', ...bad } : { text: '' }
  }
  const degText = degreeText(degrees, display)
  const fallback = label ? `${label} = ${degText}` : degText
  if (!spec.value) return { text: fallback }
  const checked = checkValue(spec, degrees)
  if (checked.verified) {
    // 模型给的写法只在「与当前显示单位一致」时采用：
    // 切成弧度制之后还挂着「60°」就前后矛盾了
    const sameUnit = (spec.of ?? 'degrees') === 'degrees'
    if (display === 'radians' && sameUnit) return { text: fallback }
    return { text: label ? `${label} = ${spec.value}` : (spec.value ?? ''), verified: true }
  }

  // 一位小数的度数写法（35.3 与 35.26）算通过，单独放行
  if ((spec.of ?? 'degrees') === 'degrees' && checked.verified === false) {
    let ok = false
    try {
      ok = Math.abs(parseExpr(spec.value!) - degrees) <= 0.06
    } catch {
      ok = false
    }
    if (ok && display === 'degrees') return { text: label ? `${label} = ${spec.value}` : (spec.value ?? ''), verified: true }
  }
  return { text: fallback, verified: false, mismatch: checked.mismatch }
}

/** 只做「模型报的值对不对」这一件事 */
function checkValue(spec: AngleSpec, degrees: number): { verified?: boolean; mismatch?: string } {
  if (!spec.value) return {}
  const of: AngleUnit = spec.of ?? 'degrees'
  const want =
    of === 'cos' ? Math.cos((degrees * Math.PI) / 180) : of === 'sin' ? Math.sin((degrees * Math.PI) / 180) : degrees
  const tol = of === 'degrees' ? 0.06 : 5e-4
  let got: number
  try {
    got = parseExpr(spec.value)
  } catch (e) {
    return { verified: false, mismatch: `看不出「${spec.value}」是什么：${e instanceof Error ? e.message : e}` }
  }
  if (Math.abs(got - want) <= tol) return { verified: true }
  return {
    verified: false,
    mismatch: `模型写 ${spec.value}，本地按${of === 'cos' ? '余弦' : of === 'sin' ? '正弦' : '度数'}算是 ${want.toFixed(4)}`,
  }
}

export function buildAnnotation(
  spec: AngleSpec,
  at: (name: string) => Vec3 | undefined,
  radius: number,
  display: AngleDisplay = 'degrees',
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
    const fmt = formatAngle(spec, degrees, display)
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
    const fmt = formatAngle(spec, degrees, display)
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
  const fmt = formatAngle(spec, degrees, display)
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

/** 直角判定容差：算出来的度数跟 90 差这么点以内，就当成直角 */
const RIGHT_ANGLE_TOL = 0.5

/** 这个角是不是直角 —— 直角不画弧，画一个小方块（课本上的规矩） */
export function isRightAngle(degrees: number): boolean {
  return Math.abs(degrees - 90) <= RIGHT_ANGLE_TOL
}

/**
 * 把算好的角变成可以直接画的一串几何量。
 *
 * 直角特殊处理：画成「从顶点出发沿一个方向走、拐一下、再沿另一个方向回来」的三点折线，
 * 也就是课本上那个小方块。它比四分之一圆弧省地方，在一堆直角里也不会糊成一片。
 */
export function arcShape(a: Annotation, radius: number): AnnotationShape {
  const from = add(a.vertex, mul(a.dirFrom, radius))
  const to = add(a.vertex, mul(a.dirTo, radius))
  if (isRightAngle(a.degrees)) {
    return {
      arc: [from, add(from, mul(a.dirTo, radius)), to],
      extras: a.extraEdges,
      labelAt: a.labelAt,
      text: a.text,
    }
  }
  return { arc: arcPoints(a.vertex, from, to, radius), extras: a.extraEdges, labelAt: a.labelAt, text: a.text }
}

/**
 * 本地枚举「图上值得标注的角」。
 *
 * 为什么要本地枚举而不是全让模型列：模型列角既要多花时间，又会漏。
 * 图上的点、棱、面本地都有，枚举出来是瞬间的事，而且一个都不会漏。
 * 模型仍然可以指出「哪几个角是本题关键」，那作为第一档；这里枚举出来的算第二档。
 *
 * 枚举范围刻意收窄到「图上有意义的那几类」，否则组合会爆炸：
 * - 线线角：共用一个顶点的两条线段（同向的不算，那是 0°）
 * - 二面角：共一条棱的两个面
 * - 线面角：一条线段与一个平面，要求线段不在平面内、且恰有一个公共顶点
 */
export function enumerateAngles(edges: [string, string][], faces: string[][]): AngleSpec[] {
  const out: AngleSpec[] = []

  // 共顶点的线段两两成角
  const byVertex = new Map<string, Set<string>>()
  for (const [a, b] of edges) {
    if (!byVertex.has(a)) byVertex.set(a, new Set())
    if (!byVertex.has(b)) byVertex.set(b, new Set())
    byVertex.get(a)?.add(b)
    byVertex.get(b)?.add(a)
  }
  const seenLine = new Set<string>()
  for (const [v, others] of byVertex) {
    const list = [...others].sort()
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = [v, list[i], list[j]].sort().join('|')
        if (seenLine.has(key)) continue
        seenLine.add(key)
        out.push({ kind: 'lineLine', p: [v, list[i]], q: [v, list[j]] })
      }
    }
  }

  // 共棱的两个面组成二面角
  const faceOfEdge = new Map<string, string[][]>()
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i]
      const b = face[(i + 1) % face.length]
      const key = [a, b].sort().join('|')
      if (!faceOfEdge.has(key)) faceOfEdge.set(key, [])
      faceOfEdge.get(key)?.push(face)
    }
  }
  for (const [key, pair] of faceOfEdge) {
    if (pair.length !== 2) continue // 只共一条棱、正好两个面
    const [a, b] = key.split('|')
    const [f1, f2] = pair
    const inA = f1.find((p) => p !== a && p !== b)
    const inB = f2.find((p) => p !== a && p !== b)
    if (inA && inB) out.push({ kind: 'dihedral', edge: [a, b], inA, inB })
  }

  // 线段与平面：不在面内、且恰有一个公共顶点
  for (const [a, b] of edges) {
    for (const face of faces) {
      const set = new Set(face)
      const na = set.has(a)
      const nb = set.has(b)
      if (na && nb) continue // 线段落在面内 → 0°，没意义
      if (!na && !nb) continue // 与这个面不相接，多半是 0° 或需要求交点，先不枚举
      // 有一个端点在面上：这才是课本上会去求的斜线面角
      const vertex = na ? a : b
      const other = na ? b : a
      const others = face.filter((p) => p !== vertex)
      if (others.length < 2) continue
      // 平面名用完整的那个面，别用「去掉顶点之后剩下的点」——
      // 三角形面去掉顶点只剩两个点，拼出来会是「BCB」这种不存在的面。
      const plane: [string, string, string] =
        face.length >= 3 ? [face[0], face[1], face[2]] : [face[0], face[1] ?? face[0], face[0]]
      out.push({ kind: 'linePlane', line: [vertex, other], plane })
    }
  }

  // 枚举出来的角也要有名字，否则「全部」档下就是一堆没有归属的数字。
  // 记号按课本：线线角写 ∠ABC；线面角写 ∠(PA, 平面ABC)；二面角写 二面角 P-AB-C。
  for (const a of out) {
    if (a.kind === 'lineLine') {
      const [v, x] = a.p
      a.label = `∠${x}${v}${a.q[1]}`
    } else if (a.kind === 'dihedral') {
      a.label = `二面角 ${a.inA}-${a.edge[0]}${a.edge[1]}-${a.inB}`
    } else {
      a.label = `∠(${a.line[0]}${a.line[1]}, 平面${a.plane.join('')})`
    }
  }

  return out
}

/** 长度标注：只说「哪两个点之间」，数值一律本地算 */
export interface LengthSpec {
  /** 线段的两端 */
  p: [string, string]
  /** 想显示的名字，例如 AB。不给就用两端点名拼 */
  label?: string
  /** 模型声称的长度，例如 "2"、"2√3"、"4/3"。给了就必须过反验 */
  value?: string
}

/**
 * 造一条长度标注。
 *
 * 规矩与角度完全一致：**数值永远由本地算**，模型给的写法只是排版；
 * 对得上就用它的排版，对不上就退回本地算出来的数，绝不让可能错的数字上屏。
 *
 * 标签摆在「线段中点再往外挪一点」的位置：直接摆在中点上会压住线段本身，
 * 往外挪的方向取「背离图形中心」，这样标签总是落在图形外侧、不往里面挤。
 */
export function buildLength(
  spec: LengthSpec,
  at: (name: string) => Vec3 | undefined,
  offset: number,
): { shape: AnnotationShape; verified?: boolean; mismatch?: string; value: number } | null {
  const A = at(spec.p[0])
  const B = at(spec.p[1])
  if (!A || !B) return null
  const value = len(sub(B, A))
  if (value < 1e-9) return null

  const label = spec.label?.trim() || `${spec.p[0]}${spec.p[1]}`
  const local = value.toFixed(3).replace(/\.?0+$/, '')
  let text = `${label} = ${local}`
  let verified: boolean | undefined
  let mismatch: string | undefined

  if (spec.value) {
    const checked = verifySymbolic(spec.value, value)
    if (checked.ok) {
      text = `${label} = ${spec.value}`
      verified = true
    } else {
      verified = false
      mismatch = checked.reason
    }
  }

  const mid = mul(add(A, B), 0.5)
  const away = unit(sub(mid, centroid)) ?? [0, 0, 0]
  const labelAt = add(mid, mul(away, offset))

  return { shape: { arc: [], extras: [], labelAt, text }, verified, mismatch, value }
}

/** 算标签该往哪个方向躲开图形中心时用；调用方每次传同一份点集 */
let centroid: Vec3 = [0, 0, 0]
export function setCentroid(points: Vec3[]): void {
  if (!points.length) {
    centroid = [0, 0, 0]
    return
  }
  let x = 0
  let y = 0
  let z = 0
  for (const p of points) {
    x += p[0]
    y += p[1]
    z += p[2]
  }
  centroid = [x / points.length, y / points.length, z / points.length]
}

/**
 * 造一条比例标注（中点、分点）。
 *
 * 与长度、角度都不同：**比例完全不需要模型**，它由点的定义直接推出来 ——
 * 一个点是中点，那它天然把线段分成 1:1；是分点 t，就分成 t:(1-t)。
 * 所以这类标注值得自动带上，漏了反而是丢信息。
 *
 * 只有依赖某条线段的点才有比例可标（midpoint / ratio）；
 * 面内动点、自由点、垂足这些没有「把线段分成几比几」的说法，一律不标。
 */
export function buildRatio(
  def: { name: string; kind: string; of?: string[]; t?: number },
  at: (name: string) => Vec3 | undefined,
  offset: number,
): AnnotationShape | null {
  if (def.kind !== 'midpoint' && def.kind !== 'ratio') return null
  const of = def.of
  if (!of || of.length !== 2) return null
  const [A, B] = of
  const M = at(def.name)
  if (!M || !at(A) || !at(B)) return null

  // 名字一律转成显示形式（A1 → A₁）再拼进文字里。
  // 不转的话，哪一层漏了规范化，标签上就会出现「AA1 = A1B」这种半成品。
  const m = toDisplayName(def.name)
  const a = toDisplayName(A)
  const b = toDisplayName(B)
  const text =
    def.kind === 'midpoint'
      ? `${a}${m} = ${m}${b}`
      : `${a}${m} : ${m}${b} = ${ratioText(def.t ?? 0.5)}`

  const away = unit(sub(M, centroid)) ?? [0, 0, 0]
  return { arc: [], extras: [], labelAt: add(M, mul(away, offset)), text }
}

/** 把 0~1 的比例写成「1 : 2」这种整数比；实在写不成就退回小数 */
function ratioText(t: number): string {
  for (let q = 2; q <= 12; q++) {
    const p = t * q
    if (Math.abs(p - Math.round(p)) < 1e-6 && Math.round(p) > 0) {
      const rest = q - Math.round(p)
      if (rest <= 0) break
      return `${Math.round(p)} : ${rest}`
    }
  }
  return `${t.toFixed(2)} : ${(1 - t).toFixed(2)}`
}

/** 一个角涉及哪些点，用来判断它跟题面有没有关系 */
export function pointNamesOf(spec: AngleSpec): string[] {
  if (spec.kind === 'lineLine') return [spec.p[0], spec.p[1], spec.q[1]]
  if (spec.kind === 'linePlane') return [...spec.line, ...spec.plane]
  return [spec.edge[0], spec.edge[1], spec.inA, spec.inB]
}

/**
 * 题面里有没有点到这个角。
 *
 * 一开始我用的是「点名都在题面里出现过」这种判据，结果**几乎每个角都算命中了** ——
 * 因为题面里到处是 A、B、C、P 这些字母，`includes('A')` 谁都能中。
 * 改成认**完整写法**：二面角找「P-CD-A」，线线角找「∠APB」，线面角找「PA」加「平面/底面」。
 */
export function angleMentionedInText(spec: AngleSpec, text: string): boolean {
  const t = text.replace(/\s/g, '')
  if (spec.kind === 'lineLine') {
    const [v, x] = spec.p
    const y = spec.q[1]
    return t.includes(`∠${x}${v}${y}`) || t.includes(`∠${y}${v}${x}`)
  }
  if (spec.kind === 'dihedral') {
    const [a, b] = spec.edge
    const forms = [`${spec.inA}-${a}${b}-${spec.inB}`, `${spec.inA}-${b}${a}-${spec.inB}`]
    return forms.some((f) => t.includes(f))
  }
  // 线面角：题面得**明确说的是这条线与某个平面所成的角**。
  // 一开始只要求「出现了这条斜线 + 出现了平面/底面」，结果 PA、PB、PC、PD 四条全算点名 ——
  // 面上有四条侧棱，题面提到「底面」是必然的，那等于没筛。
  // 现在要求线名紧挨着「与…所成角」或「与…成角」这种说法。
  const line = spec.line.join('')
  const rev = [...spec.line].reverse().join('')
  const near = new RegExp(`(${line}|${rev})\\s*(与|和)?\\s*[^，。；]{0,8}(所成角|成角|夹角)`)
  return near.test(t) && /平面|底面/.test(t)
}

/**
 * 给一个角打「重要性」分，用来决定「重要」档该显示哪几个。
 *
 * 为什么要打分：本地枚举能把图上所有角都找出来（这道正四棱锥就有 46 个），
 * 但全铺出来满屏都是字、反而什么都看不清；而模型报的「关键角」又不一定给得全。
 * 所以退一步：**本地自己判断哪些角值得看**，判据只用算得出来的事实。
 *
 * 四条判据，从强到弱：
 * - **题面里点过名的角**（像「二面角 P-CD-A」「PA 与底面所成角」）—— 最强，题目问的一定是重点。
 * - **直角**：课本上遇到直角都会特意画个方块，它通常就是解题的突破口。
 * - **特殊角**：30 / 45 / 60 / 120 这类，是题目结果的常见长相。
 * - **整数度数**：比 54.74° 更像「答案」，而 54.74° 往往只是顺带能算出来的角。
 */
export function angleImportance(spec: AngleSpec, degrees: number, problemText: string): number {
  let score = angleMentionedInText(spec, problemText) ? 40 : 0

  if (isRightAngle(degrees)) score += 30

  const nice = [30, 45, 60, 120, 135, 150]
  if (nice.some((v) => Math.abs(degrees - v) < 0.01)) score += 22

  // 整数度数（直角已经在上面给过分，不重复给）
  if (!isRightAngle(degrees) && Math.abs(degrees - Math.round(degrees)) < 0.005) score += 10

  return score
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
