import {
  arcMidpoint,
  arcPoints,
  dihedralAngle,
  lineLineAngle,
  linePlaneAngle,
  planeNormal,
  projectOnLine,
  projectOnPlane,
} from './angle.ts'
import type { Vec3 } from './solver.ts'

/**
 * 可运行的校验：三类角的计算与画弧。
 *
 * 用棱长 2 的正方体当靶子 —— 它的所有角度都有初中就学过的标准答案，
 * 所以这里能拿真答案去比，而不是「算出来是什么就信什么」。
 * 跑 `node src/angle.check.ts`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
function near(a: number | null, b: number, tol = 1e-9) {
  return a !== null && Math.abs(a - b) < tol
}

// 棱长 2 的正方体：底面 ABCD 在 y=0 平面内，A₁ 在 A 正上方
const A: Vec3 = [0, 0, 0]
const B: Vec3 = [2, 0, 0]
const C: Vec3 = [2, 0, 2]
const D: Vec3 = [0, 0, 2]
const A1: Vec3 = [0, 2, 0]
const C1: Vec3 = [2, 2, 2]
const D1: Vec3 = [0, 2, 2]

console.log('【线线角】')
ok('相邻的棱互相垂直（AB 与 AD）', near(lineLineAngle(A, B, A, D), 90))
ok('异面直线取锐角（AB 与 A₁C₁ 应为 45°）', near(lineLineAngle(A, B, A1, C1), 45), `实际 ${lineLineAngle(A, B, A1, C1)?.toFixed(4)}`)
ok('平行直线夹角为 0（AB 与 D₁C₁）', near(lineLineAngle(A, B, D1, C1), 0))
ok('体对角线与棱（AC₁ 与 AB，应为 arccos(1/√3)）', near(lineLineAngle(A, C1, A, B), Math.acos(1 / Math.sqrt(3)) * (180 / Math.PI)))
ok('方向反过来不影响结果（BA 与 DA 仍是 90°）', near(lineLineAngle(B, A, D, A), 90))
ok('退化成点的时候返回 null', lineLineAngle(A, A, A, B) === null)

console.log('\n【线面角】')
ok('直线落在平面内（AB 与底面 ABCD 应为 0°）', near(linePlaneAngle(A, B, A, B, D), 0))
ok('直线垂直平面（AA₁ 与底面应为 90°）', near(linePlaneAngle(A, A1, A, B, D), 90))
ok('面对角线与底面（AC 与底面应为 0°）', near(linePlaneAngle(A, C, A, B, D), 0))
// A₁C 与底面：A₁ 高 2，C 在底面上，投影是 AC，长 2√2，所以 tan = 2/(2√2) = 1/√2
{
  const want = Math.atan(2 / (2 * Math.SQRT2)) * (180 / Math.PI)
  ok('斜线与底面所成角（A₁C）', near(linePlaneAngle(A1, C, A, B, D), want), `实际 ${linePlaneAngle(A1, C, A, B, D)?.toFixed(4)}° 期望 ${want.toFixed(4)}°`)
}
ok('三点共线时平面无意义、返回 null', linePlaneAngle(A, A1, A, B, [2, 0, 0]) === null)

console.log('\n【二面角】')
// 正方形里 A 与 C 在对角线 BD 的两侧，两个半平面正好拼成平角
ok('正方形中 A-BD-C 是平角 180°', near(dihedralAngle(B, D, A, C), 180, 1e-6), `实际 ${dihedralAngle(B, D, A, C)?.toFixed(4)}`)
// 正方体中 A₁-BD-A：标准答案 cos = 1/√3（也就是 tan = √2）
{
  const want = Math.acos(1 / Math.sqrt(3)) * (180 / Math.PI)
  const got = dihedralAngle(B, D, A1, A)
  ok('正方体中 A₁-BD-A 的余弦为 1/√3', near(got, want, 1e-6), `实际 ${got?.toFixed(4)}° 期望 ${want.toFixed(4)}°`)
  ok('换一个方向（A-BD-A₁）结果一样', near(dihedralAngle(D, B, A, A1), want, 1e-6))
}
ok('半个平面上的点落在棱上时返回 null', dihedralAngle(B, D, A, B) === null)

console.log('\n【画弧：三类角共用的那一步】')
{
  // 直角：从 x 轴方向转到 z 轴方向，半径 1
  const pts = arcPoints(A, B, D, 1, 8)
  ok('采样点数是段数加一', pts.length === 9, `实际 ${pts.length}`)
  ok('起点落在第一个方向上', Math.hypot(pts[0][0] - 1, pts[0][1], pts[0][2]) < 1e-9)
  ok('终点落在第二个方向上', Math.hypot(pts[8][0], pts[8][1], pts[8][2] - 1) < 1e-9)
  ok('每个点到顶点的距离都等于半径', pts.every((p) => Math.abs(Math.hypot(p[0], p[1], p[2]) - 1) < 1e-9))
  ok('中间点确实在转过去（x 与 z 都为正）', pts[4][0] > 0.1 && pts[4][2] > 0.1, `中点 (${pts[4].map((n) => n.toFixed(3)).join(', ')})`)

  const mid = arcMidpoint(A, B, D, 1)
  ok('弧中点能算出来', mid !== null && Math.abs(Math.hypot(mid[0], mid[1], mid[2]) - 1) < 1e-9)
  ok('两个方向重合时不画弧', arcPoints(A, B, B, 1).length === 1)
  ok('退化成点时返回空', arcPoints(A, A, B, 1).length === 0)
}

console.log('\n【画线面角要用到的投影】')
{
  const foot = projectOnPlane(A1, A, B, D)
  ok('A₁ 在底面上的射影是 A', foot !== null && Math.hypot(foot[0] - A[0], foot[1] - A[1], foot[2] - A[2]) < 1e-9)
  const onLine = projectOnLine(C, A, B)
  ok('C 在直线 AB 上的射影是 B', onLine !== null && Math.hypot(onLine[0] - B[0], onLine[1] - B[1], onLine[2] - B[2]) < 1e-9)
  ok('共线三点的平面法向为 null', planeNormal(A, B, [4, 0, 0]) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
