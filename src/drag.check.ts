import { closestParamOnSegment, faceParams, rayPlaneHit, type Ray } from './drag.ts'
import type { Vec3 } from './solver.ts'

/**
 * 可运行的校验：拖点用到的几何计算。
 * 这些函数决定「手指按在哪、拖到哪里」，错了会表现为「拖不动」或「拖飞了」，
 * 而这两种现象在真机上很难判断是哪里错的，所以先在这里钉死。
 * 跑 `pnpm dragcheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
const near = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol
const vNear = (a: Vec3, b: Vec3, tol = 1e-9) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < tol

// 一条沿 x 轴的线段：从 A(0,0,0) 到 B(2,0,0)
const A: Vec3 = [0, 0, 0]
const B: Vec3 = [2, 0, 0]

console.log('【射线与线段：算出手指对应的位置】')
{
  // 从正上方 (1, 5, 0) 朝下打，最近点是线段中点 → t = 0.5
  const down: Ray = { origin: [1, 5, 0], dir: [0, -1, 0] }
  ok('从正上方打下来落在 t=0.5', near(closestParamOnSegment(A, B, down) ?? -1, 0.5))

  // 从 (0.4, 3, 0) 打下来 → t = 0.2
  ok('偏一点就对到 t=0.2', near(closestParamOnSegment(A, B, { origin: [0.4, 3, 0], dir: [0, -1, 0] }) ?? -1, 0.2))

  // 打到线段外 → 夹到端点
  ok('打在线段左边就夹到 t=0', near(closestParamOnSegment(A, B, { origin: [-3, 2, 0], dir: [0, -1, 0] }) ?? -1, 0))
  ok('打在线段右边就夹到 t=1', near(closestParamOnSegment(A, B, { origin: [7, 2, 0], dir: [0, -1, 0] }) ?? -1, 1))

  // 斜着打：射线方向 (1,-1,0)，起点 (-2,2,0)。这条线正好过原点 → t=0
  ok('斜射也能算对', near(closestParamOnSegment(A, B, { origin: [-2, 2, 0], dir: [1, -1, 0] }) ?? -1, 0))

  // 射线与线段平行 → 无解，保持不动
  ok('射线与线段平行时返回 null', closestParamOnSegment(A, B, { origin: [0, 1, 0], dir: [1, 0, 0] }) === null)
}

console.log('\n【射线与平面：面内动点要落在面上】')
{
  // 平面 z = 0，由 A(0,0,0) B(2,0,0) D(0,0,2) 确定 —— 注意这里用的是 xy 平面更直观
  const P0: Vec3 = [0, 0, 0]
  const P1: Vec3 = [2, 0, 0]
  const P2: Vec3 = [0, 2, 0]
  const hit = rayPlaneHit({ origin: [1, 1, 5], dir: [0, 0, -1] }, P0, P1, P2)
  ok('垂直射入能命中', hit !== null && vNear(hit, [1, 1, 0]))

  const skew = rayPlaneHit({ origin: [1, 1, 5], dir: [0, -1, -1] }, P0, P1, P2)
  ok('斜射也能命中', skew !== null && vNear(skew, [1, -4, 0]))

  ok('与平面平行时返回 null', rayPlaneHit({ origin: [1, 1, 5], dir: [1, 0, 0] }, P0, P1, P2) === null)
  ok('平面在相机背后时返回 null', rayPlaneHit({ origin: [1, 1, 5], dir: [0, 0, 1] }, P0, P1, P2) === null)
}

console.log('\n【反解面内参数：手指的位置换算成 (u,v)】')
{
  // 正方形面：A(0,0,0) B(2,0,0) B1(2,2,0) A1(0,2,0)
  const face: Vec3[] = [
    [0, 0, 0],
    [2, 0, 0],
    [2, 2, 0],
    [0, 2, 0],
  ]
  const center = faceParams(face, [1, 1, 0])
  ok('正中心 → u=v=0.5', center !== null && near(center.u, 0.5) && near(center.v, 0.5))
  const corner = faceParams(face, [0, 0, 0])
  ok('原点 → u=v=0', corner !== null && near(corner.u, 0) && near(corner.v, 0))
  const opposite = faceParams(face, [2, 2, 0])
  ok('对角 → u=v=1', opposite !== null && near(opposite.u, 1) && near(opposite.v, 1))
  const half = faceParams(face, [0.5, 1.5, 0])
  ok('任意点也能反解', half !== null && near(half.u, 0.25) && near(half.v, 0.75))

  // 往返一致：解出 (u,v) 再按双线性算回坐标，应该回到同一个点
  const roundTrip = (p: Vec3) => {
    const uv = faceParams(face, p)
    if (!uv) return null
    const { u, v } = uv
    return [
      (1 - u) * (1 - v) * 0 + u * (1 - v) * 2 + u * v * 2 + (1 - u) * v * 0,
      (1 - u) * (1 - v) * 0 + u * (1 - v) * 0 + u * v * 2 + (1 - u) * v * 2,
      0,
    ] as Vec3
  }
  ok('反解再正算能回到原点（正中心）', (() => {
    const back = roundTrip([1, 1, 0])
    return back !== null && vNear(back, [1, 1, 0], 1e-9)
  })())
  ok('反解再正算能回到原点（任意点）', (() => {
    const back = roundTrip([0.6, 1.4, 0])
    return back !== null && vNear(back, [0.6, 1.4, 0], 1e-9)
  })())

  // 拖到面外要夹住，不能跑出去
  const outside = faceParams(face, [3, -1, 0])
  ok('拖出面外会被夹回 0..1', outside !== null && outside.u === 1 && outside.v === 0)
}

console.log('\n【三角形面：u + v 不能超过 1】')
{
  const tri: Vec3[] = [
    [0, 0, 0],
    [2, 0, 0],
    [0, 2, 0],
  ]
  const inside = faceParams(tri, [0.5, 0.5, 0])
  ok('三角形内部能反解', inside !== null && near(inside.u, 0.25) && near(inside.v, 0.25))
  const outside = faceParams(tri, [2, 2, 0])
  ok('拖到三角形外面会被拉回边上', outside !== null && outside.u + outside.v <= 1 + 1e-12, `u+v=${(outside?.u ?? 0) + (outside?.v ?? 0)}`)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
