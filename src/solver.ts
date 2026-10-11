import { Vector3 } from 'three'

/**
 * 立体几何约束求解器。
 *
 * 设计要点：模型只负责说「有哪些点」和「这些点满足什么关系」，不负责给坐标。
 * 坐标由这里算出来，并且算完要逐条回验 —— 因为模型直接给坐标时会算错，而且错得看不出来。
 *
 * 求解用 Levenberg–Marquardt：图形本身有 6 个刚体自由度（平移三个、旋转三个），
 * 残差在这个零空间里恒为 0，阻尼项会让迭代不会在那个方向上乱跑，所以不需要另外固定基准点。
 */

export type Vec3 = [number, number, number]

export type PointDef =
  /** 自由点，at 是模型给的粗略初值，用来帮迭代落在正确的那个解上 */
  | { name: string; kind: 'free'; at?: Vec3 }
  /** 中点 */
  | { name: string; kind: 'midpoint'; of: [string, string] }
  /** AB 上按比例取点：P = A + t(B - A) */
  | { name: string; kind: 'ratio'; of: [string, string]; t: number }
  /** 平移派生：P = A + B - C，用来表达棱柱的顶面顶点 */
  | { name: string; kind: 'offset'; of: [string, string, string] }
  /** 从一点向一个平面作垂线的垂足：of = [起点, 平面上的三个点]。解析可算，不需要迭代 */
  | { name: string; kind: 'perpFoot'; of: [string, string, string, string] }
  /** 一点在一条直线上的射影：of = [起点, 直线上的两个点] */
  | { name: string; kind: 'projLine'; of: [string, string, string] }
  /** 动点：在线段 AB 上滑动，t 是从 A 出发的比例。位置由外部拖动决定，不参与求解 */
  | { name: string; kind: 'onSegment'; of: [string, string]; t: number }
  /** 动点：在一个面内滑动。三角形用重心坐标，四边形用双线性插值 */
  | { name: string; kind: 'inFace'; face: string[]; u: number; v: number }

/** 动点：位置由拖动决定，不是解出来的 */
export const isMoving = (d: PointDef): boolean => d.kind === 'onSegment' || d.kind === 'inFace'

export type Constraint =
  /** |AB| = value */
  | { kind: 'distance'; a: string; b: string; value: number }
  /** |AB| = |CD| */
  | { kind: 'equalDistance'; ab: [string, string]; cd: [string, string] }
  /** ∠from-at-to = value 度 */
  | { kind: 'angle'; at: string; from: string; to: string; value: number }
  /** 直线 AB 与 CD 的夹角 = value 度，异面直线同样适用 */
  | { kind: 'lineAngle'; p: [string, string]; q: [string, string]; value: number }
  /** 直线 AB ⊥ 直线 CD */
  | { kind: 'perpendicular'; p: [string, string]; q: [string, string] }
  /** 直线 AB ∥ 直线 CD */
  | { kind: 'parallel'; p: [string, string]; q: [string, string] }
  /** 直线 AB ⊥ 平面 PQR */
  | { kind: 'perpLinePlane'; line: [string, string]; plane: [string, string, string] }
  /** 四点共面 */
  | { kind: 'coplanar'; pts: [string, string, string, string] }

export interface Residual {
  desc: string
  /** 残差本身：长度类已经按特征长度归一化，角度类是弧度 */
  error: number
  /** 给人看的实际值，例如「实际 2.001 / 应为 2」 */
  actual: string
}

export interface SolveResult {
  ok: boolean
  points: Record<string, Vec3>
  residuals: Residual[]
  /** 最大残差（归一化后） */
  maxError: number
}

const DEG = Math.PI / 180
const EPS = 1e-9

const v = (p: Record<string, Vector3>, k: string): Vector3 => {
  const q = p[k]
  if (!q) throw new Error(`约束里引用了不存在的点 ${k}`)
  return q
}
const dist = (a: Vector3, b: Vector3) => a.distanceTo(b)
const unit = (a: Vector3) => (a.length() < EPS ? new Vector3(EPS, 0, 0) : a.clone().normalize())
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** 按依赖关系把派生点算出来。定义顺序由模型给出，这里按数组顺序执行。 */
function buildPoints(defs: PointDef[], free: Vector3[]): Record<string, Vector3> {
  const out: Record<string, Vector3> = {}
  let i = 0
  for (const d of defs) {
    switch (d.kind) {
      case 'free':
        out[d.name] = free[i++].clone()
        break
      case 'midpoint':
        out[d.name] = new Vector3().addVectors(v(out, d.of[0]), v(out, d.of[1])).multiplyScalar(0.5)
        break
      case 'ratio':
        out[d.name] = new Vector3().lerpVectors(v(out, d.of[0]), v(out, d.of[1]), clamp(d.t, 0, 1))
        break
      case 'offset':
        out[d.name] = new Vector3().addVectors(v(out, d.of[0]), v(out, d.of[1])).sub(v(out, d.of[2]))
        break
      case 'perpFoot': {
        // 垂足 = 起点沿平面法向走到平面上，解析可算，不需要迭代参与
        const from = v(out, d.of[0])
        const a = v(out, d.of[1])
        const b = v(out, d.of[2])
        const c = v(out, d.of[3])
        const n = new Vector3().crossVectors(new Vector3().subVectors(b, a), new Vector3().subVectors(c, a))
        if (n.length() < EPS) {
          out[d.name] = from.clone()
          break
        }
        n.normalize()
        out[d.name] = from.clone().addScaledVector(n, -new Vector3().subVectors(from, a).dot(n))
        break
      }
      case 'projLine': {
        // 点在直线上的射影
        const p = v(out, d.of[0])
        const a = v(out, d.of[1])
        const b = v(out, d.of[2])
        const ab = new Vector3().subVectors(b, a)
        const len2 = ab.lengthSq()
        if (len2 < EPS) {
          out[d.name] = a.clone()
          break
        }
        out[d.name] = a.clone().addScaledVector(ab, new Vector3().subVectors(p, a).dot(ab) / len2)
        break
      }
      case 'onSegment': {
        // 动点：在线段上按比例滑动
        out[d.name] = new Vector3().lerpVectors(v(out, d.of[0]), v(out, d.of[1]), clamp(d.t, 0, 1))
        break
      }
      case 'inFace': {
        // 动点：在面内滑动。三角形用重心坐标，四边形用双线性插值
        const vs = d.face.map((k) => v(out, k))
        if (vs.length < 3) {
          out[d.name] = vs[0]?.clone() ?? new Vector3()
          break
        }
        const u = clamp(d.u, 0, 1)
        const w = clamp(d.v, 0, 1)
        if (vs.length === 3) {
          const s = Math.min(u, 1 - w) // 保证落在三角形内部
          out[d.name] = vs[0]
            .clone()
            .addScaledVector(new Vector3().subVectors(vs[1], vs[0]), s)
            .addScaledVector(new Vector3().subVectors(vs[2], vs[0]), w)
        } else {
          out[d.name] = new Vector3()
            .addScaledVector(vs[0], (1 - u) * (1 - w))
            .addScaledVector(vs[1], u * (1 - w))
            .addScaledVector(vs[2], u * w)
            .addScaledVector(vs[3], (1 - u) * w)
        }
        break
      }
    }
  }
  return out
}

function residualsOf(
  defs: PointDef[],
  free: Vector3[],
  cs: Constraint[],
  unitLen: number,
): { raw: number[]; info: Residual[] } {
  const P = buildPoints(defs, free)
  const raw: number[] = []
  const info: Residual[] = []

  for (const c of cs) {
    switch (c.kind) {
      case 'distance': {
        const d = dist(v(P, c.a), v(P, c.b))
        const e = (d - c.value) / unitLen
        raw.push(e)
        info.push({ desc: `|${c.a}${c.b}| = ${c.value}`, error: Math.abs(e), actual: d.toFixed(4) })
        break
      }
      case 'equalDistance': {
        const d1 = dist(v(P, c.ab[0]), v(P, c.ab[1]))
        const d2 = dist(v(P, c.cd[0]), v(P, c.cd[1]))
        const e = (d1 - d2) / unitLen
        raw.push(e)
        info.push({ desc: `|${c.ab[0]}${c.ab[1]}| = |${c.cd[0]}${c.cd[1]}|`, error: Math.abs(e), actual: `${d1.toFixed(4)} vs ${d2.toFixed(4)}` })
        break
      }
      case 'angle': {
        const u = new Vector3().subVectors(v(P, c.from), v(P, c.at))
        const w = new Vector3().subVectors(v(P, c.to), v(P, c.at))
        const cos = clamp(u.dot(w) / (Math.max(u.length(), EPS) * Math.max(w.length(), EPS)), -1 + 1e-9, 1 - 1e-9)
        const got = Math.acos(cos) / DEG
        const e = (got - c.value) * DEG
        raw.push(e)
        info.push({ desc: `∠${c.from}${c.at}${c.to} = ${c.value}°`, error: Math.abs(e), actual: `${got.toFixed(3)}°` })
        break
      }
      case 'lineAngle': {
        const u = unit(new Vector3().subVectors(v(P, c.p[1]), v(P, c.p[0])))
        const w = unit(new Vector3().subVectors(v(P, c.q[1]), v(P, c.q[0])))
        // 取锐角，与高中定义一致
        const cos = clamp(Math.abs(u.dot(w)), 1e-9, 1)
        const got = Math.acos(cos) / DEG
        const e = (got - c.value) * DEG
        raw.push(e)
        info.push({ desc: `${c.p.join('')} 与 ${c.q.join('')} 夹角 = ${c.value}°`, error: Math.abs(e), actual: `${got.toFixed(3)}°` })
        break
      }
      case 'perpendicular': {
        const u = unit(new Vector3().subVectors(v(P, c.p[1]), v(P, c.p[0])))
        const w = unit(new Vector3().subVectors(v(P, c.q[1]), v(P, c.q[0])))
        const dot = u.dot(w)
        raw.push(dot)
        info.push({ desc: `${c.p.join('')} ⊥ ${c.q.join('')}`, error: Math.abs(dot), actual: `cos = ${dot.toFixed(4)}` })
        break
      }
      case 'parallel': {
        const u = unit(new Vector3().subVectors(v(P, c.p[1]), v(P, c.p[0])))
        const w = unit(new Vector3().subVectors(v(P, c.q[1]), v(P, c.q[0])))
        const cross = new Vector3().crossVectors(u, w).length()
        raw.push(cross)
        info.push({ desc: `${c.p.join('')} ∥ ${c.q.join('')}`, error: Math.abs(cross), actual: `sin = ${cross.toFixed(4)}` })
        break
      }
      case 'perpLinePlane': {
        const u = unit(new Vector3().subVectors(v(P, c.line[1]), v(P, c.line[0])))
        const n = unit(
          new Vector3()
            .crossVectors(
              new Vector3().subVectors(v(P, c.plane[1]), v(P, c.plane[0])),
              new Vector3().subVectors(v(P, c.plane[2]), v(P, c.plane[0])),
            ),
        )
        const cross = new Vector3().crossVectors(u, n).length()
        raw.push(cross, 0)
        info.push({ desc: `${c.line.join('')} ⊥ 平面${c.plane.join('')}`, error: Math.abs(cross), actual: `sin = ${cross.toFixed(4)}` })
        break
      }
      case 'coplanar': {
        const [a, b, c2, d] = c.pts
        const ab = new Vector3().subVectors(v(P, b), v(P, a))
        const ac = new Vector3().subVectors(v(P, c2), v(P, a))
        const ad = new Vector3().subVectors(v(P, d), v(P, a))
        const scale = Math.max(ab.length() * ac.length() * ad.length(), EPS)
        const det = Math.abs(ab.dot(new Vector3().crossVectors(ac, ad))) / scale
        raw.push(det)
        info.push({ desc: `${c.pts.join('')} 四点共面`, error: Math.abs(det), actual: `偏离 = ${det.toFixed(5)}` })
        break
      }
    }
  }
  return { raw, info }
}

/** 高斯消元解 A x = b，A 是 n×n */
function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    if (Math.abs(M[piv][col]) < 1e-14) return null
    ;[M[col], M[piv]] = [M[piv], M[col]]
    const p = M[col][col]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col] / p
      if (f === 0) continue
      for (let cc = col; cc <= n; cc++) M[r][cc] -= f * M[col][cc]
    }
  }
  // 消元后是（分块）对角阵，解就是 M[i][n] / M[i][i]
  return M.map((row, i) => row[n] / row[i])
}

/**
 * 只重算派生点与动点，自由点沿用已经解出来的坐标。
 * 拖动动点时用它，不必把整道题重新解一遍。
 */
export function reevaluate(defs: PointDef[], solved: Record<string, Vec3>): Record<string, Vec3> {
  const free: Vector3[] = []
  for (const d of defs) {
    if (d.kind !== 'free') continue
    const p = solved[d.name]
    if (!p) throw new Error(`求解结果里缺少自由点 ${d.name}`)
    free.push(new Vector3(...p))
  }
  const out = buildPoints(defs, free)
  const result: Record<string, Vec3> = {}
  for (const [k, p] of Object.entries(out)) result[k] = [p.x, p.y, p.z]
  return result
}

export function solve(defs: PointDef[], constraints: Constraint[], log?: (s: string) => void): SolveResult {
  const freeDefs = defs.filter((d) => d.kind === 'free')
  const n = freeDefs.length * 3
  const unitLen =
    constraints.reduce((s, c) => (c.kind === 'distance' ? s + c.value : s), 0) /
      Math.max(1, constraints.filter((c) => c.kind === 'distance').length) || 1

  // 初值：模型给的坐标，没给就摆成一个不共线的缺省位置
  const x: number[] = []
  freeDefs.forEach((d, i) => {
    const at = (d as { at?: Vec3 }).at ?? [i, 0, 0]
    x.push(at[0], at[1], at[2])
  })

  const asVectors = (flat: number[]) => {
    const out: Vector3[] = []
    for (let i = 0; i < flat.length; i += 3) out.push(new Vector3(flat[i], flat[i + 1], flat[i + 2]))
    return out
  }
  const costOf = (flat: number[]) => {
    const { raw } = residualsOf(defs, asVectors(flat), constraints, unitLen)
    return raw.reduce((s, r) => s + r * r, 0)
  }

  let lambda = 1e-3
  let best = costOf(x)

  for (let iter = 0; iter < 300; iter++) {
    const { raw } = residualsOf(defs, asVectors(x), constraints, unitLen)
    const m = raw.length
    if (m === 0) break
    const maxAbs = Math.max(...raw.map(Math.abs))
    if (maxAbs < 1e-9) break

    // 数值雅可比
    const J: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))
    for (let j = 0; j < n; j++) {
      const step = 1e-6
      const probe = [...x]
      probe[j] += step
      const { raw: rp } = residualsOf(defs, asVectors(probe), constraints, unitLen)
      for (let i = 0; i < m; i++) J[i][j] = (rp[i] - raw[i]) / step
    }

    // (JᵀJ + λI) dx = -Jᵀr
    const JtJ: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    const Jtr: number[] = new Array(n).fill(0)
    for (let j = 0; j < n; j++) {
      for (let k = j; k < n; k++) {
        let s = 0
        for (let i = 0; i < m; i++) s += J[i][j] * J[i][k]
        JtJ[j][k] = s
        JtJ[k][j] = s
      }
      let s = 0
      for (let i = 0; i < m; i++) s += J[i][j] * raw[i]
      Jtr[j] = s
    }
    for (let j = 0; j < n; j++) JtJ[j][j] += lambda * (1 + JtJ[j][j])

    const dx = solveLinear(
      JtJ,
      Jtr.map((s) => -s),
    )
    if (!dx) {
      log?.(`iter ${iter} 线性方程无解，放大 λ`)
      lambda *= 10
      if (lambda > 1e12) break
      continue
    }

    const trial = x.map((xi, i) => xi + dx[i])
    const trialCost = costOf(trial)
    log?.(`iter ${iter} cost=${best.toExponential(3)} trial=${trialCost.toExponential(3)} λ=${lambda.toExponential(1)} |dx|=${Math.hypot(...dx).toExponential(2)}`)
    if (Number.isFinite(trialCost) && trialCost < best) {
      x.splice(0, x.length, ...trial)
      best = trialCost
      lambda = Math.max(lambda / 3, 1e-12)
    } else {
      lambda *= 5
      if (lambda > 1e12) break
    }
  }

  const { info } = residualsOf(defs, asVectors(x), constraints, unitLen)
  const P = buildPoints(defs, asVectors(x))
  const points: Record<string, Vec3> = {}
  for (const [k, p] of Object.entries(P)) points[k] = [p.x, p.y, p.z]

  const maxError = info.reduce((s, r) => Math.max(s, r.error), 0)
  // 容差 1e-4：距离类按特征长度归一化，角度类按弧度，都换算到同一个尺度上比较
  return { ok: maxError < 1e-4, points, residuals: info, maxError }
}
