import type { Vec3 } from './solver'

/**
 * 拖点用的几何计算。全部是纯函数，能在 node 里直接验，不依赖浏览器。
 *
 * 拖动本身分两步：先用屏幕距离判断「手指是不是按在动点上」，
 * 再用这里的函数把射线换算成动点的参数。
 */

export interface Ray {
  origin: Vec3
  dir: Vec3
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const EPS = 1e-12

/**
 * 手指发出的射线，离线段 AB 最近的那一点对应的参数 t（已夹在 0 到 1 之间）。
 * 两线接近平行时无解，这时返回 null，调用方就保持原样不动。
 */
export function closestParamOnSegment(a: Vec3, b: Vec3, ray: Ray): number | null {
  const u = sub(b, a)
  const v = ray.dir
  const w0 = sub(a, ray.origin)
  const A = dot(u, u)
  const B = dot(u, v)
  const C = dot(v, v)
  const D = dot(u, w0)
  const E = dot(v, w0)
  const denom = A * C - B * B
  if (Math.abs(denom) < EPS || A < EPS) return null
  return clamp01((B * E - D * C) / denom)
}

/** 射线与平面的交点。平面由三个点确定；射线与平面平行、或在相机背后时返回 null。 */
export function rayPlaneHit(ray: Ray, v0: Vec3, v1: Vec3, v2: Vec3): Vec3 | null {
  const n = cross(sub(v1, v0), sub(v2, v0))
  const nl = len(n)
  if (nl < EPS) return null
  const unit = [n[0] / nl, n[1] / nl, n[2] / nl] as Vec3
  const denom = dot(ray.dir, unit)
  if (Math.abs(denom) < EPS) return null
  const t = dot(sub(v0, ray.origin), unit) / denom
  if (t < 0) return null
  return [ray.origin[0] + t * ray.dir[0], ray.origin[1] + t * ray.dir[1], ray.origin[2] + t * ray.dir[2]]
}

/**
 * 把面内参数反解出来：给定面的顶点和一个落在该面上的点，求 (u, v)。
 *
 * 采用仿射解：P = V0 + u·(V1−V0) + v·(V3−V0)（三角形时用 V2−V0）。
 * 对平行四边形（正方体、棱柱的各个面）是精确的；对一般四边形是近似 ——
 * ponytail: 一般四边形要精确就得解双线性方程组，现在的图形都是平行四边形，等真遇到斜四边形再说。
 */
export function faceParams(face: Vec3[], p: Vec3): { u: number; v: number } | null {
  if (face.length < 3) return null
  const v0 = face[0]
  const e1 = sub(face[1], v0)
  const e2 = sub(face[face.length === 3 ? 2 : 3], v0)
  const w = sub(p, v0)
  const A = dot(e1, e1)
  const B = dot(e1, e2)
  const C = dot(e2, e2)
  const D = dot(e1, w)
  const E = dot(e2, w)
  const det = A * C - B * B
  if (Math.abs(det) < EPS) return null
  const u = (C * D - B * E) / det
  const v = (A * E - B * D) / det
  // 三角形要让 u + v 不超过 1，四边形各自夹到 0..1
  if (face.length === 3) {
    const vv = clamp01(v)
    return { u: clamp01(Math.min(u, 1 - vv)), v: vv }
  }
  return { u: clamp01(u), v: clamp01(v) }
}
