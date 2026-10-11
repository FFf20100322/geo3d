import { DEMO_PROBLEM, DEMO_SCENE, DEMO_SOLUTION } from './demo.ts'
import { checkFacesPlanar, parseScene, toRenderable } from './scene.ts'
import { mergeSolution, parseElementName, parseSolution } from './solution.ts'
import { isMoving, reevaluate, solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：把内置测试题（正四面体）从头到尾跑一遍。
 * 它是回归的种子 —— 以后任何一次改动把这个测试题弄坏了，这里会当场失败。
 * 跑 `pnpm democheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

console.log('【测试题：正四面体】')
ok('题面不是空的', DEMO_PROBLEM.trim().length > 0)

console.log('\n【场景：解析 → 求解 → 验算】')
const scene = parseScene(DEMO_SCENE)
ok('解析成功', scene.points.length === 8, `${scene.points.length} 个点`)
ok('四个面全是三角形', scene.faces.length === 4 && scene.faces.every((f) => f.length === 3))
ok('识别出两个动点', scene.points.filter(isMoving).length === 2)
ok('E 是棱上的动点', scene.points.some((p) => p.name === 'E' && p.kind === 'onSegment'))
ok('F 是面内的动点', scene.points.some((p) => p.name === 'F' && p.kind === 'inFace'))

const solved = solve(scene.points, scene.constraints)
ok('求解成功', solved.ok, `最大残差 ${solved.maxError.toExponential(2)}`)

// 正四面体：六条棱全都等于 2
const 棱 = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'A'],
  ['P', 'A'],
  ['P', 'B'],
  ['P', 'C'],
] as const
ok(
  '六条棱全部等于 2（这才叫正四面体）',
  棱.every(([a, b]) => near(d3(solved.points[a], solved.points[b]), 2, 1e-6)),
  棱.map(([a, b]) => d3(solved.points[a], solved.points[b]).toFixed(4)).join(' '),
)
ok('四个面都真的共面', checkFacesPlanar(toRenderable(scene, solved.points)).length === 0)

console.log('\n【动点一：E 在棱 AB 上】')
{
  const at = (t: number) => {
    const def = scene.points.find((p) => p.name === 'E')
    if (def?.kind !== 'onSegment') throw new Error('E 不是线段动点')
    def.t = t
    return reevaluate(scene.points, solved.points)
  }
  const mid = at(0.5)
  ok('t=0.5 时 E 落在 AB 中点', near(d3(mid['E'], mid['A']), 1) && near(d3(mid['E'], mid['B']), 1))
  ok('t=0 时 E 回到 A', near(d3(at(0)['E'], at(0)['A']), 0))
  ok('t=1 时 E 到达 B', near(d3(at(1)['E'], at(1)['B']), 0))
  const q = at(0.25)
  ok('AE 始终加上 EB 等于 2', near(d3(q['E'], q['A']) + d3(q['E'], q['B']), 2))
  ok('E 移动不影响 F', near(d3(q['F'], mid['F']), 0))
  ok('E 移动不影响棱长', near(d3(q['P'], q['A']), 2))
}

console.log('\n【动点二：F 在三角形面 PAB 内】')
{
  const at = (u: number, v: number) => {
    const def = scene.points.find((p) => p.name === 'F')
    if (def?.kind !== 'inFace') throw new Error('F 不是面内动点')
    def.u = u
    def.v = v
    return reevaluate(scene.points, solved.points)
  }
  const center = at(1 / 3, 1 / 3)
  // 三角形的重心到三个顶点等距
  ok(
    'u=v=1/3（重心）时到三个顶点等距',
    near(d3(center['F'], center['P']), d3(center['F'], center['A']), 1e-6) &&
      near(d3(center['F'], center['A']), d3(center['F'], center['B']), 1e-6),
  )
  ok('u=v=0 时 F 回到 P', near(d3(at(0, 0)['F'], at(0, 0)['P']), 0))
  ok('u=1,v=0 时 F 到 A', near(d3(at(1, 0)['F'], at(1, 0)['A']), 0))

  // 三角形面用的是重心坐标：u+v 不能超过 1，超了要停在边上
  const clamped = at(0.8, 0.8)
  ok('u+v 超过 1 时被拉回边上（不会跑出三角形）', (() => {
    // 面上的点到三个顶点的距离满足：落在三角形内时，面积和等于整个三角形
    const P0 = clamped['P']
    const A0 = clamped['A']
    const B0 = clamped['B']
    const F0 = clamped['F']
    const area = (x: Vec3, y: Vec3, z: Vec3) =>
      Math.hypot(
        (y[1] - x[1]) * (z[2] - x[2]) - (y[2] - x[2]) * (z[1] - x[1]),
        (y[2] - x[2]) * (z[0] - x[0]) - (y[0] - x[0]) * (z[2] - x[2]),
        (y[0] - x[0]) * (z[1] - x[1]) - (y[1] - x[1]) * (z[0] - x[0]),
      ) / 2
    const total = area(P0, A0, B0)
    const parts = area(F0, A0, B0) + area(P0, F0, B0) + area(P0, A0, F0)
    return Math.abs(parts - total) < 1e-6
  })())

  // F 必须始终待在 PAB 所在的平面里
  const samples = [at(0.2, 0.1), at(0.1, 0.6), at(0.5, 0.25)]
  const planeOf = (p: Record<string, Vec3>) => {
    const n = (() => {
      const u = [p['A'][0] - p['P'][0], p['A'][1] - p['P'][1], p['A'][2] - p['P'][2]]
      const w = [p['B'][0] - p['P'][0], p['B'][1] - p['P'][1], p['B'][2] - p['P'][2]]
      return [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
    })()
    return (x: Vec3) => (x[0] - p['P'][0]) * n[0] + (x[1] - p['P'][1]) * n[1] + (x[2] - p['P'][2]) * n[2]
  }
  ok('无论怎么移，F 都待在这个面所在的平面内', samples.every((s) => Math.abs(planeOf(s)(s['F'])) < 1e-9))
  ok('F 移动不影响 E', near(d3(samples[2]['E'], center['E']), 0))
}

console.log('\n【中位线 MN：两层依赖，与 P、A、B 联动】')
{
  const at = (u: number, v: number) => {
    const def = scene.points.find((p) => p.name === 'F')
    if (def?.kind !== 'inFace') throw new Error('F 不是面内动点')
    def.u = u
    def.v = v
    return reevaluate(scene.points, solved.points)
  }
  const p = at(0.3, 0.3)
  ok('M 是 PA 的中点', near(d3(p['M'], p['P']), d3(p['M'], p['A']), 1e-9))
  ok('N 是 PB 的中点', near(d3(p['N'], p['P']), d3(p['N'], p['B']), 1e-9))
  // 中位线定理：MN 平行于 AB，长度是 AB 的一半
  const mn = [p['N'][0] - p['M'][0], p['N'][1] - p['M'][1], p['N'][2] - p['M'][2]]
  const ab = [p['B'][0] - p['A'][0], p['B'][1] - p['A'][1], p['B'][2] - p['A'][2]]
  const cross = [mn[1] * ab[2] - mn[2] * ab[1], mn[2] * ab[0] - mn[0] * ab[2], mn[0] * ab[1] - mn[1] * ab[0]]
  ok('MN ∥ AB', Math.hypot(...cross) < 1e-9)
  ok('MN 的长度是 AB 的一半', near(Math.hypot(...mn), Math.hypot(...ab) / 2, 1e-9), `${Math.hypot(...mn).toFixed(4)}`)
}

console.log('\n【解题过程：辅助点、高亮与角度】')
{
  const sol = parseSolution(DEMO_SOLUTION, scene)
  ok('四步', sol.steps.length === 4, `实际 ${sol.steps.length}`)

  const merged = mergeSolution(scene, sol)
  ok('最后一步多画出一个点（垂足 O）', merged.points.length === scene.points.length + 1)
  const O = merged.points.find((p) => p.name === 'O')
  ok('O 是垂足类型（不许凭空插自由点）', O?.kind === 'perpFoot')

  const reSolved = solve(merged.points, merged.constraints)
  ok('加上辅助线后依然解得出', reSolved.ok, `最大残差 ${reSolved.maxError.toExponential(2)}`)

  // 垂足的定义：OP 要垂直于底面 ABC
  const pp = reSolved.points
  const v = (a: Vec3, b: Vec3): Vec3 => [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const po = v(pp['O'], pp['P'])
  ok('PO ⊥ AB', near(dot(po, v(pp['A'], pp['B'])), 0, 1e-9))
  ok('PO ⊥ AC', near(dot(po, v(pp['A'], pp['C'])), 0, 1e-9))
  // 正四面体的高：OP = √(4 - 4/3) = √(8/3)
  ok('高 PO 等于 √(8/3)', near(Math.hypot(...po), Math.sqrt(8 / 3), 1e-6), Math.hypot(...po).toFixed(6))
  // O 到三个顶点等距（底面中心）
  ok(
    'O 到底面三个顶点等距',
    near(d3(pp['O'], pp['A']), d3(pp['O'], pp['B']), 1e-6) && near(d3(pp['O'], pp['B']), d3(pp['O'], pp['C']), 1e-6),
  )
}

console.log('\n【元素名解析：点、棱、面都要认得】')
{
  const known = new Set(scene.points.map((p) => p.name))
  ok('单个点', parseElementName('E', known, scene.faces)?.point === 'E')
  ok('一条棱', parseElementName('PA', known, scene.faces)?.edge?.[0] === 'P')
  ok('三角形面', !!parseElementName('PAB', known, scene.faces)?.face)
  ok('不存在的元素要被拒绝', parseElementName('XYZ', known, scene.faces) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
