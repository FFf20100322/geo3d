import { buildAnnotation, suggestRadius } from './annotation.ts'
import type { Vec3 } from './solver.ts'

/**
 * 可运行的校验：把「要标哪个角」翻译成「图上画什么」。
 * 仍然拿棱长 2 的正方体当靶子 —— 它的角度都有标准答案，能拿真答案比。
 * 跑 `pnpm annotationcheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol
const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

// 棱长 2 的正方体，底面 ABCD 在 y=0 平面内
const P: Record<string, Vec3> = {
  A: [0, 0, 0],
  B: [2, 0, 0],
  C: [2, 0, 2],
  D: [0, 0, 2],
  A1: [0, 2, 0],
  B1: [2, 2, 0],
  C1: [2, 2, 2],
  D1: [0, 2, 2],
}
const at = (n: string) => P[n]
const R = suggestRadius(Object.values(P))

console.log(`【半径建议】共 ${Object.keys(P).length} 个点，算出半径 ${R.toFixed(3)}`)
ok('半径是个合理的小正数', R > 0.15 && R < 1)

console.log('\n【线线角：两条线共点】')
{
  const a = buildAnnotation({ kind: 'lineLine', p: ['A', 'B'], q: ['A', 'D'], value: '∠BAD = 90°' }, at, R)
  ok('画得出来', a !== null)
  ok('顶点取在公共点 A', a !== null && d3(a.vertex, P['A']) < 1e-9)
  ok('度数是 90', a !== null && near(a.degrees, 90))
  ok('两个方向都是单位向量', a !== null && near(Math.hypot(...a.dirFrom), 1) && near(Math.hypot(...a.dirTo), 1))
  ok('不需要补辅助线', a !== null && a.extraEdges.length === 0)
  ok('标签摆在离顶点约 1.45 倍半径处', a !== null && near(d3(a.labelAt, a.vertex), R * 1.45, 1e-6))
}

console.log('\n【线线角：异面直线要平移】')
{
  const a = buildAnnotation({ kind: 'lineLine', p: ['A', 'B'], q: ['D1', 'C1'], value: 'AB 与 D₁C₁ 平行' }, at, R)
  // D₁C₁ 平移之后和 AB 同向，夹角应当算成 0
  ok('不共点时也画得出来', a !== null)
  ok('顶点取在第一条线的第一个端点 A', a !== null && d3(a.vertex, P['A']) < 1e-9)
  ok('夹角算出来是 0（两者平行）', a !== null && near(a.degrees, 0))

  const b = buildAnnotation({ kind: 'lineLine', p: ['A', 'B'], q: ['A1', 'C1'], value: 'AB 与 A₁C₁' }, at, R)
  ok('异面/不共点的另一例：45°', b !== null && near(b.degrees, 45), `实际 ${b?.degrees.toFixed(4)}`)
}

console.log('\n【线面角：必须补出射影线】')
{
  // A₁C 与底面：顶点是 C（在底面上），A₁ 在底面的射影是 A
  const a = buildAnnotation({ kind: 'linePlane', line: ['A1', 'C'], plane: ['A', 'B', 'D'], value: 'θ ≈ 35.26°' }, at, R)
  ok('画得出来', a !== null)
  ok('顶点取在直线与底面的交点 C', a !== null && d3(a.vertex, P['C']) < 1e-9)
  ok('补出了一条射影线', a !== null && a.extraEdges.length === 1)
  ok('射影线的另一头是 A（A₁ 在底面的射影）', a !== null && d3(a.extraEdges[0][1], P['A']) < 1e-9)
  ok('度数约 35.2644', a !== null && near(a.degrees, 35.264389682754654, 1e-6), `实际 ${a?.degrees.toFixed(6)}`)

  // 直线落在平面内时没有角可画
  const flat = buildAnnotation({ kind: 'linePlane', line: ['A', 'B'], plane: ['A', 'B', 'D'], value: 'x' }, at, R)
  ok('直线落在平面内时不画弧', flat === null)

  // 垂直于平面：90 度
  const perp = buildAnnotation({ kind: 'linePlane', line: ['A', 'A1'], plane: ['A', 'B', 'D'], value: '90°' }, at, R)
  ok('垂直平面时是 90°', perp !== null && near(perp.degrees, 90))
  ok('垂直时顶点取在交点 A', perp !== null && d3(perp.vertex, P['A']) < 1e-9)
}

console.log('\n【二面角：必须补出平面角的两条边】')
{
  const a = buildAnnotation({ kind: 'dihedral', edge: ['B', 'D'], inA: 'A1', inB: 'A', value: 'cos = 1/√3' }, at, R)
  ok('画得出来', a !== null)
  ok('顶点取在棱上的 B', a !== null && d3(a.vertex, P['B']) < 1e-9)
  ok('补出了两条边（平面角）', a !== null && a.extraEdges.length === 2)
  ok('两条边都从棱上同一点出发', a !== null && d3(a.extraEdges[0][0], a.extraEdges[1][0]) < 1e-9)
  ok('两条边的长度都是半径', a !== null && near(d3(a.extraEdges[0][0], a.extraEdges[0][1]), R, 1e-9))

  // 平面角的两条边必须垂直于棱 —— 这是二面角画法的要点，不垂直就画错了
  const e = [P['D'][0] - P['B'][0], P['D'][1] - P['B'][1], P['D'][2] - P['B'][2]]
  const el = Math.hypot(...e)
  const perpendicular = (a: { extraEdges: [Vec3, Vec3][] } | null) => {
    if (!a) return false
    return a.extraEdges.every(([from, to]) => {
      const v = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
      const d = (v[0] * e[0] + v[1] * e[1] + v[2] * e[2]) / el
      return Math.abs(d) < 1e-9
    })
  }
  ok('两条边都垂直于棱', perpendicular(a))

  // 标准答案：正方体中二面角 A₁-BD-A 的余弦为 1/√3
  const want = Math.acos(1 / Math.sqrt(3)) * (180 / Math.PI)
  ok('度数与标准答案一致', a !== null && near(a.degrees, want), `实际 ${a?.degrees.toFixed(4)}° 期望 ${want.toFixed(4)}°`)

  // 平角：A 与 C 在 BD 两侧，两个半平面拼成 180
  const flat = buildAnnotation({ kind: 'dihedral', edge: ['B', 'D'], inA: 'A', inB: 'C', value: '180°' }, at, R)
  ok('平角能算成 180°', flat !== null && near(flat.degrees, 180, 1e-6))
}

console.log('\n【该拒绝的要拒绝】')
ok('点不存在时返回 null', buildAnnotation({ kind: 'lineLine', p: ['A', 'Z'], q: ['A', 'B'], value: 'x' }, at, R) === null)
ok(
  '二面角的参考点落在棱上时返回 null',
  buildAnnotation({ kind: 'dihedral', edge: ['B', 'D'], inA: 'B', inB: 'A', value: 'x' }, at, R) === null,
)
ok(
  '退化成点时返回 null',
  buildAnnotation({ kind: 'lineLine', p: ['A', 'A'], q: ['A', 'B'], value: 'x' }, at, R) === null,
)

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
