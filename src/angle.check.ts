import {
  arcMidpoint,
  arcPoints,
  dihedralAngle,
  lineLineAngle,
  linePlaneAngle,
  planeNormal,
  polygonNormal,
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

console.log('\n【多边形面的法向量（Newell）：四边形、歪的、退化的都要对】')
{
  // 为什么不用 planeNormal：它只吃三个点。面有四个以上顶点时，
  // 「挑前三个做叉积」会踩到「前三点接近共线」的坑 —— 那时方向会乱飞，
  // 而图上看起来只是「法向量指歪了」，很难怀疑到算法头上。
  // 下面第二个用例就是专门把「前三点接近共线」造出来验的。

  // 1) 正方形在 xz 平面上，法向应该是 ±y
  const square: Vec3[] = [
    [0, 0, 0],
    [2, 0, 0],
    [2, 0, 2],
    [0, 0, 2],
  ]
  const n1 = polygonNormal(square)
  ok('正方形（xz 平面）的法向沿 y 轴', !!n1 && Math.abs(Math.abs(n1[1]) - 1) < 1e-9, n1 ? n1.map((x) => x.toFixed(3)).join(',') : 'null')

  // 2) **前三点严格共线**的四边形。
  //    这才是换 Newell 的真正理由：planeNormal 只吃前三个点，
  //    前三点一共线它就返回 null —— 可这个面明明是有法向的，
  //    结果就是「法向量该画却画不出来」，而且报不出任何错。
  //    （我一开始造的是「接近共线」，那并没有让 planeNormal 出错 ——
  //     它照样给出正确的 ±y。测试当场把我的断言打了回来，才换成严格共线。
  //     教训：说某个算法在这里会出错之前，先把例子真的跑一遍。）
  const frontThreeCollinear: Vec3[] = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0], // ← 与第 1、2 点严格共线
    [1, 0, -2],
  ]
  const n2 = polygonNormal(frontThreeCollinear)
  const viaThree = planeNormal(frontThreeCollinear[0], frontThreeCollinear[1], frontThreeCollinear[2])
  ok(
    '前三点严格共线的四边形，Newell 仍给出沿 y 的法向',
    !!n2 && Math.abs(Math.abs(n2[1]) - 1) < 1e-9,
    n2 ? n2.map((x) => x.toFixed(3)).join(',') : 'null',
  )
  ok(
    '同一组点用 planeNormal（只吃前三点）会返回 null —— 法向量就画不出来了',
    viaThree === null,
    viaThree ? viaThree.map((x) => x.toFixed(3)).join(',') : 'null',
  )

  // 3) 法向是单位向量
  ok('法向是单位向量', !!n1 && Math.abs(Math.hypot(n1[0], n1[1], n1[2]) - 1) < 1e-12)

  // 4) 顶点顺序反过来，方向应该正好相反（这是 Newell 的固有性质，写下来免得以后被当成 bug）
  const n3 = polygonNormal([...square].reverse())
  ok('顶点顺序反过来，法向反向', !!n1 && !!n3 && n1[0] * n3[0] + n1[1] * n3[1] + n1[2] * n3[2] < -0.999)

  // 5) 退化：点太少、共线、重复
  ok('少于三个点返回 null', polygonNormal([[0, 0, 0], [1, 0, 0]]) === null)
  ok('全部共线返回 null', polygonNormal([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]]) === null)
  ok('所有点重合返回 null', polygonNormal([[1, 1, 1], [1, 1, 1], [1, 1, 1]]) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
