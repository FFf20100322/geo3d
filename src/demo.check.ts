import { DEMO_PROBLEM, DEMO_SCENE, DEMO_SOLUTION } from './demo.ts'
import { checkFacesPlanar, faceKey, parseScene, toRenderable } from './scene.ts'
import { mergeSolution, parseElementName, parseSolution } from './solution.ts'
import { isMoving, reevaluate, solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：把内置测试题（正四面体 + 三个面内动点）从头到尾跑一遍。
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
const sub = (a: Vec3, b: Vec3): Vec3 => [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

console.log('【测试题：正四面体，三个面上的动点】')
ok('题面不是空的', DEMO_PROBLEM.trim().length > 0)

console.log('\n【场景：解析 → 求解 → 验算】')
const scene = parseScene(DEMO_SCENE)
ok('解析成功', scene.points.length === 7, `${scene.points.length} 个点`)
ok('四个三角形面 + 一个动点张成的面', scene.faces.length === 5)
ok('四个侧面都是三角形', scene.faces.slice(0, 4).every((f) => f.length === 3))
ok('识别出三个动点（没有别的）', scene.points.filter(isMoving).length === 3)
ok(
  '三个动点各在一个侧面里',
  ['E', 'F', 'M'].every((n) => scene.points.some((p) => p.name === n && p.kind === 'inFace')),
)

const solved = solve(scene.points, scene.constraints)
ok('求解成功', solved.ok, `最大残差 ${solved.maxError.toExponential(2)}`)
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
)
ok('五个面都真的共面（三个点当然共面，四个三角形面也要验）', checkFacesPlanar(toRenderable(scene, solved.points)).length === 0)

console.log('\n【三个面内动点：各自只在自己那个面里】')
{
  const at = (name: string, u: number, v: number) => {
    const def = scene.points.find((p) => p.name === name)
    if (def?.kind !== 'inFace') throw new Error(`${name} 不是面内动点`)
    def.u = u
    def.v = v
    return reevaluate(scene.points, solved.points)
  }
  /** 点到某个面的距离（面由三个点定） */
  const distToPlane = (x: Vec3, a: Vec3, b: Vec3, c: Vec3) => {
    const n = cross(sub(a, b), sub(a, c))
    const l = Math.hypot(...n)
    const w = sub(a, x)
    return Math.abs((w[0] * n[0] + w[1] * n[1] + w[2] * n[2]) / l)
  }

  const p = at('E', 0.5, 0.2)
  ok('E 落在面 PAB 内', distToPlane(p['E'], p['P'], p['A'], p['B']) < 1e-9)
  ok('F 落在面 PBC 内', distToPlane(p['F'], p['P'], p['B'], p['C']) < 1e-9)
  ok('M 落在面 PCA 内', distToPlane(p['M'], p['P'], p['C'], p['A']) < 1e-9)

  // 三个动点互相独立：动 E 不该带动 F 与 M
  const q = at('E', 0.9, 0.05)
  ok('动 E 不影响 F', near(d3(q['F'], p['F']), 0))
  ok('动 E 不影响 M', near(d3(q['M'], p['M']), 0))
  const r = at('F', 0.1, 0.8)
  ok('动 F 不影响 E', near(d3(r['E'], q['E']), 0))
  ok('动 F 不影响 M', near(d3(r['M'], q['M']), 0))
  const s = at('M', 0.7, 0.25)
  ok('动 M 不影响 E 与 F', near(d3(s['E'], r['E']), 0) && near(d3(s['F'], r['F']), 0))
}

console.log('\n【点驱动面：三个动点张成的那个面】')
{
  const at = (vals: Partial<Record<'E' | 'F' | 'M', [number, number]>>) => {
    for (const [name, uv] of Object.entries(vals)) {
      const def = scene.points.find((x) => x.name === name)
      if (def?.kind !== 'inFace') throw new Error(`${name} 不是面内动点`)
      def.u = uv[0]
      def.v = uv[1]
    }
    return reevaluate(scene.points, solved.points)
  }
  /** 三个点张成的平面：算出单位法向量，法向量变了就是面变了 */
  const normalOf = (p: Record<string, Vec3>) => {
    const n = cross(sub(p['E'], p['F']), sub(p['E'], p['M']))
    const l = Math.hypot(...n)
    return n.map((x) => x / l) as Vec3
  }
  const shifted = (a: Vec3 | undefined, b: Vec3 | undefined) => {
    if (!a || !b) return 0
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  }

  const base = at({ E: [0.4, 0.3], F: [0.4, 0.3], M: [0.4, 0.3] })
  const n0 = normalOf(base)
  ok('三个点不共线（面是真的存在的）', Math.hypot(...cross(sub(base['E'], base['F']), sub(base['E'], base['M']))) > 1e-6)

  // 每次只动一个点，另外两个写回原值 —— at() 会累积上次设的参数，不写清就分不出是谁的影响
  const keep = { E: [0.4, 0.3] as [number, number], F: [0.4, 0.3] as [number, number], M: [0.4, 0.3] as [number, number] }
  const onlyE = at({ ...keep, E: [0.9, 0.05] })
  const onlyF = at({ ...keep, F: [0.85, 0.1] })
  const onlyM = at({ ...keep, M: [0.15, 0.8] })

  ok('动 E 之后这个面的朝向变了', shifted(n0, normalOf(onlyE)) > 1e-3, `法向量变化 ${shifted(n0, normalOf(onlyE)).toFixed(4)}`)
  ok('动 F 之后面的朝向也变了', shifted(n0, normalOf(onlyF)) > 1e-3, `法向量变化 ${shifted(n0, normalOf(onlyF)).toFixed(4)}`)
  ok('动 M 之后面的朝向也变了', shifted(n0, normalOf(onlyM)) > 1e-3, `法向量变化 ${shifted(n0, normalOf(onlyM)).toFixed(4)}`)

  // 只动一个点时，另外两个必须原地不动 —— 这才是「三个动点互相独立」
  ok('只动 E 时 F、M 没动', near(d3(onlyE['F'], base['F']), 0) && near(d3(onlyE['M'], base['M']), 0))
  ok('只动 F 时 E、M 没动', near(d3(onlyF['E'], base['E']), 0) && near(d3(onlyF['M'], base['M']), 0))
  ok('只动 M 时 E、F 没动', near(d3(onlyM['E'], base['E']), 0) && near(d3(onlyM['F'], base['F']), 0))

  // 三个点张成的面永远是一个真正的平面（三点定面，不会扭）
  const render = toRenderable(scene, base)
  const efm = render.faces.find((f) => f.key === faceKey(['E', 'F', 'M']))
  ok('渲染结构里能找到 EFM 这个面', !!efm)
  ok('EFM 这个面带着顶点名（渲染层要靠它知道该跟谁重算）', JSON.stringify(efm?.names) === JSON.stringify(['E', 'F', 'M']))
  ok('三个点的面不可能扭，共面检查通过', checkFacesPlanar({ ...render, faces: efm ? [efm] : [] }).length === 0)
}

console.log('\n【解题过程】')
{
  const sol = parseSolution(DEMO_SOLUTION, scene)
  ok('四步', sol.steps.length === 4, `实际 ${sol.steps.length}`)
  ok('第四步高亮了 EFM 这个面', sol.steps[3].uses.faces.some((f) => faceKey(f) === faceKey(['E', 'F', 'M'])))
  const merged = mergeSolution(scene, sol)
  ok('这几步不产生新点', merged.points.length === scene.points.length)
  const again = solve(merged.points, merged.constraints)
  ok('合并后依然解得出', again.ok, `最大残差 ${again.maxError.toExponential(2)}`)
}

console.log('\n【元素名解析】')
{
  const known = new Set(scene.points.map((p) => p.name))
  ok('单个点', parseElementName('E', known, scene.faces)?.point === 'E')
  ok('一条棱', parseElementName('PA', known, scene.faces)?.edge?.[0] === 'P')
  ok('三角形面', !!parseElementName('PAB', known, scene.faces)?.face)
  ok('不存在的元素要被拒绝', parseElementName('XYZ', known, scene.faces) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
