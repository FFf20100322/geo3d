import type { Vec3 } from './solver.ts'

/**
 * 三类角的计算，以及把角画出来要用的圆弧采样。
 *
 * 全部是纯函数，能在 node 里直接验。角度一律用「度」，与项目里其他地方一致。
 */

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
const unit = (a: Vec3): Vec3 | null => {
  const l = len(a)
  if (l < 1e-12) return null
  return [a[0] / l, a[1] / l, a[2] / l]
}
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
const DEG = 180 / Math.PI

/**
 * 两条直线的夹角，取锐角（0 到 90 度）。
 * 异面直线同样适用 —— 高中定义里异面直线所成角就是平移后两条相交直线的锐角。
 * 有任何一条退化成点时返回 null。
 */
export function lineLineAngle(a1: Vec3, a2: Vec3, b1: Vec3, b2: Vec3): number | null {
  const u = unit(sub(a2, a1))
  const v = unit(sub(b2, b1))
  if (!u || !v) return null
  return Math.acos(clamp(Math.abs(dot(u, v)), 0, 1)) * DEG
}

/** 直线的方向向量 */
export function lineDirection(a: Vec3, b: Vec3): Vec3 | null {
  return unit(sub(b, a))
}

/** 平面的单位法向量；三点共线时返回 null */
export function planeNormal(p0: Vec3, p1: Vec3, p2: Vec3): Vec3 | null {
  return unit(cross(sub(p1, p0), sub(p2, p0)))
}

/**
 * 直线与平面的夹角（0 到 90 度）。
 * 做法：线面角的正弦 = 方向向量与法向量夹角的余弦的绝对值。
 * 直线落在平面内时结果是 0，直线垂直平面时是 90。
 */
export function linePlaneAngle(l1: Vec3, l2: Vec3, p0: Vec3, p1: Vec3, p2: Vec3): number | null {
  const d = lineDirection(l1, l2)
  const n = planeNormal(p0, p1, p2)
  if (!d || !n) return null
  return Math.asin(clamp(Math.abs(dot(d, n)), 0, 1)) * DEG
}

/**
 * 二面角（0 到 180 度）。棱是 AB，C 在一个半平面内、D 在另一个半平面内，两者都不在棱上。
 *
 * 做法：把 C、D 各自减去沿棱方向的分量，得到垂直于棱的两个方向，取它们的夹角。
 * 用这个算法而不是「两个法向量的夹角」，是因为法向量夹角给不出 0 到 180 的定向信息。
 */
export function dihedralAngle(a: Vec3, b: Vec3, c: Vec3, d: Vec3): number | null {
  const e = unit(sub(b, a))
  if (!e) return null
  const perp = (p: Vec3): Vec3 | null => {
    const v = sub(p, a)
    const along = dot(v, e)
    return unit([v[0] - along * e[0], v[1] - along * e[1], v[2] - along * e[2]])
  }
  const u = perp(c)
  const v = perp(d)
  if (!u || !v) return null // 有一个点落在棱上，这个二面角就没法定向
  return Math.acos(clamp(dot(u, v), -1, 1)) * DEG
}

/** 点在平面上的射影 */
export function projectOnPlane(p: Vec3, p0: Vec3, p1: Vec3, p2: Vec3): Vec3 | null {
  const n = planeNormal(p0, p1, p2)
  if (!n) return null
  const t = dot(sub(p, p0), n)
  return [p[0] - t * n[0], p[1] - t * n[1], p[2] - t * n[2]]
}

/** 点在直线上的射影 */
export function projectOnLine(p: Vec3, a: Vec3, b: Vec3): Vec3 | null {
  const e = unit(sub(b, a))
  if (!e) return null
  const t = dot(sub(p, a), e)
  return [a[0] + t * e[0], a[1] + t * e[1], a[2] + t * e[2]]
}

/**
 * 把从顶点出发、夹在两个方向之间的圆弧采样成一串点。
 *
 * 这是三类角共用的画弧方式：线线角直接用两条线的方向；
 * 线面角要先算出直线在平面上的射影，用「直线方向」和「射影方向」；
 * 二面角要先在棱上取一点、往两个面内各作一条垂直于棱的线，用那两个方向。
 * 也就是说：怎么找这两个方向由调用方决定，这里只负责把弧画出来。
 */
export function arcPoints(vertex: Vec3, from: Vec3, to: Vec3, radius: number, segments = 24): Vec3[] {
  const u = unit(sub(from, vertex))
  const w = unit(sub(to, vertex))
  if (!u || !w) return []

  // 两个方向几乎重合时没有弧可言，给它一个确定的退化结果
  if (len(sub(u, w)) < 1e-9) return [[vertex[0] + radius * u[0], vertex[1] + radius * u[1], vertex[2] + radius * u[2]]]

  const axis = unit(cross(u, w))
  if (!axis) return []

  const angle = Math.acos(clamp(dot(u, w), -1, 1))
  const out: Vec3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * angle
    // 罗德里格斯旋转：把 u 绕 axis 转 t
    const c = Math.cos(t)
    const s = Math.sin(t)
    const k = dot(axis, u) * (1 - c)
    out.push([
      vertex[0] + radius * (u[0] * c + (axis[1] * u[2] - axis[2] * u[1]) * s + axis[0] * k),
      vertex[1] + radius * (u[1] * c + (axis[2] * u[0] - axis[0] * u[2]) * s + axis[1] * k),
      vertex[2] + radius * (u[2] * c + (axis[0] * u[1] - axis[1] * u[0]) * s + axis[2] * k),
    ])
  }
  return out
}

/** 弧的中点方向，用来把度数标签摆在弧的外侧 */
export function arcMidpoint(vertex: Vec3, from: Vec3, to: Vec3, radius: number): Vec3 | null {
  const pts = arcPoints(vertex, from, to, radius, 2)
  return pts.length >= 2 ? pts[1] : null
}
