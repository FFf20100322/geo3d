import { Matrix4, Quaternion, Vector3 } from 'three'
import type { Renderable } from './scene.ts'
import type { Vec3 } from './solver.ts'

/**
 * 曲面立体的**摆放数学**，单独一个模块。
 *
 * 为什么单独拆出来：这段逻辑最容易错（圆锥的中心不在几何体中心、椭球的半轴不在坐标轴上），
 * 而它**完全不需要浏览器** —— three 的 Vector3/Matrix4/Quaternion 在 node 里就能跑。
 * 拆出来之后，`solids.check.ts` 可以在电脑上逐条验「放完之后端点在不在该在的地方」，
 * 不必等手机、也不必用眼睛看。
 *
 * 约定：three 自带的几何体都是**沿 y 轴、以原点为中心**的。
 * - CylinderGeometry：两端在 (0, ±h/2, 0)
 * - ConeGeometry：底面在 (0, −h/2, 0)、顶点在 (0, +h/2, 0)
 * - SphereGeometry(1)：三条半轴端点分别是 (±1,0,0)、(0,±1,0)、(0,0,±1)
 */

export type SolidSpec = NonNullable<Renderable['solids']>[number]

/** 一个曲面的几何体参数 + 把它摆到位的变换矩阵 */
export interface SolidPlacement {
  /** 用哪一种 three 几何体 */
  geometry: 'sphere' | 'cylinder' | 'cone'
  /** 几何体参数（半径、高度等） */
  params: { radius?: number; radiusTop?: number; radiusBottom?: number; height?: number }
  /** 变换矩阵：把几何体从「贴 y 轴、以原点为中心」摆到图上该在的位置 */
  matrix: Matrix4
}

const v3 = (p: Vec3) => new Vector3(p[0], p[1], p[2])

/**
 * 把「沿 y 轴、高 h、以原点为中心」的几何体摆成「从 a 到 b」。
 *
 * **注意上下：** three 的几何体里，局部 +y 那一端是「上面」。旋转把 +y 转到 a→b 的方向，
 * 所以**局部上面落到的其实是 b、下面是 a**。因此 radiusAtA 要接到 radiusBottom 上 ——
 * 一开始接反了，圆柱因为两端半径相同看不出来，是**圆台**才把它暴露出来的。
 */
function placeAlong(a: Vec3, b: Vec3, radiusAtA: number, radiusAtB: number): SolidPlacement | null {
  const va = v3(a)
  const vb = v3(b)
  const axis = new Vector3().subVectors(vb, va)
  const h = axis.length()
  if (h < 1e-9) return null
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axis.clone().normalize())
  const mid = new Vector3().addVectors(va, vb).multiplyScalar(0.5)
  return {
    geometry: 'cylinder',
    // 局部 +y 那一端落在 b，所以 top 对应的是 B 端的半径
    params: { radiusTop: radiusAtB, radiusBottom: radiusAtA, height: h },
    matrix: new Matrix4().compose(mid, q, new Vector3(1, 1, 1)),
  }
}

/**
 * 算出一个曲面立体该怎么摆。
 * 返回 null 表示这个曲面**退化**了（比如轴的两个端点重合），画不出来 —— 不报错，直接跳过。
 */
export function solidPlacement(s: SolidSpec): SolidPlacement | null {
  if (s.kind === 'sphere') {
    if (!s.center || !s.radius) return null
    return {
      geometry: 'sphere',
      params: { radius: s.radius },
      matrix: new Matrix4().makeTranslation(s.center[0], s.center[1], s.center[2]),
    }
  }

  if (s.kind === 'ellipsoid') {
    // 三条半轴一般**不在坐标轴上**，所以按它们现搭一个基。
    // 它们也不一定两两垂直（模型给的初始估计可能歪），所以先施密特正交化 ——
    // 画出来仍是那个椭球的形状，只是取了一个干净的坐标架。
    if (!s.center || !s.ax || !s.ay || !s.az) return null
    const c = v3(s.center)
    const u = new Vector3().subVectors(v3(s.ax), c)
    const v = new Vector3().subVectors(v3(s.ay), c)
    const w = new Vector3().subVectors(v3(s.az), c)
    const ru = u.length()
    const rv = v.length()
    const rw = w.length()
    if (ru < 1e-9 || rv < 1e-9 || rw < 1e-9) return null
    u.normalize()
    // 正交化时先把 v 里与 u 同向的部分减掉；若 v 恰好与 u 共线，这一步会得到零向量
    v.addScaledVector(u, -v.dot(u))
    if (v.length() < 1e-9) return null
    v.normalize()
    w.addScaledVector(u, -w.dot(u)).addScaledVector(v, -w.dot(v))
    if (w.length() < 1e-9) return null
    w.normalize()
    const m = new Matrix4().makeBasis(u, v, w)
    m.setPosition(c)
    m.multiply(new Matrix4().makeScale(ru, rv, rw))
    return { geometry: 'sphere', params: { radius: 1 }, matrix: m }
  }

  if (s.kind === 'cylinder') {
    if (!s.a || !s.b || !s.radius) return null
    return placeAlong(s.a, s.b, s.radius, s.radius)
  }

  if (s.kind === 'frustum') {
    if (!s.a || !s.b || !s.radiusA || !s.radiusB) return null
    return placeAlong(s.a, s.b, s.radiusA, s.radiusB)
  }

  // 圆锥：**坑在这里** —— 自带几何体的底面在 −h/2、顶点在 +h/2，
  // 也就是说它的「中心」是顶点与底面圆心的**中点**，不是底面圆心。
  // 直接把中心放在底面圆心会把整个圆锥抬高一倍高度，看上去就是飘着的。
  if (!s.apex || !s.center || !s.radius) return null
  const apex = v3(s.apex)
  const base = v3(s.center)
  const up = new Vector3().subVectors(apex, base)
  const h = up.length()
  if (h < 1e-9) return null
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), up.clone().normalize())
  const mid = new Vector3().addVectors(apex, base).multiplyScalar(0.5)
  return {
    geometry: 'cone',
    params: { radius: s.radius, height: h },
    matrix: new Matrix4().compose(mid, q, new Vector3(1, 1, 1)),
  }
}

/**
 * 一个曲面**用到的那些点**在几何体自己的坐标系里对应的位置。
 * 校验脚本靠它反推：把矩阵作用上去，看落点对不对。
 */
export function localAnchors(s: SolidSpec): Vec3[] {
  if (s.kind === 'sphere') return [[s.radius ?? 0, 0, 0]]
  if (s.kind === 'ellipsoid') {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
  }
  if (s.kind === 'cylinder' || s.kind === 'frustum') {
    const h = s.a && s.b ? new Vector3(...s.a).distanceTo(new Vector3(...s.b)) : 0
    return [
      [0, -h / 2, 0],
      [0, h / 2, 0],
    ]
  }
  if (s.kind === 'cone') {
    const h = s.apex && s.center ? new Vector3(...s.apex).distanceTo(new Vector3(...s.center)) : 0
    return [
      [0, -h / 2, 0],
      [0, h / 2, 0],
    ]
  }
  return []
}

/** 图上那个曲面**应该落到的地方**（与 localAnchors 一一对应） */
export function worldAnchors(s: SolidSpec): Vec3[] {
  if (s.kind === 'sphere') return []
  if (s.kind === 'ellipsoid') return [s.ax, s.ay, s.az].filter((x): x is Vec3 => !!x)
  if (s.kind === 'cylinder' || s.kind === 'frustum') return [s.a, s.b].filter((x): x is Vec3 => !!x)
  if (s.kind === 'cone') return [s.center, s.apex].filter((x): x is Vec3 => !!x)
  return []
}
