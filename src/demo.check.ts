import { DEMO_PROBLEM, DEMO_SCENE, DEMO_SOLUTION } from './demo.ts'
import { checkFacesPlanar, parseScene, toRenderable } from './scene.ts'
import { mergeSolution, parseElementName, parseSolution } from './solution.ts'
import { isMoving, reevaluate, solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：把内置示例题从头到尾跑一遍，重点验两个动点真的互不干扰。
 * 这是回归自检的种子 —— 以后任何一次改动把这条例题弄坏了，这里会当场失败。
 * 跑 `pnpm democheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

console.log('【示例题】')
ok('题面不是空的', DEMO_PROBLEM.trim().length > 0)

console.log('\n【场景：解析 → 求解 → 验算】')
const scene = parseScene(DEMO_SCENE)
ok('解析成功', scene.points.length === 10, `${scene.points.length} 个点`)
ok('识别出两个动点', scene.points.filter(isMoving).length === 2)
ok('E 是线段上的动点', scene.points.some((p) => p.name === 'E' && p.kind === 'onSegment'))
ok('F 是面内的动点', scene.points.some((p) => p.name === 'F' && p.kind === 'inFace'))

const solved = solve(scene.points, scene.constraints)
ok('求解成功', solved.ok, `最大残差 ${solved.maxError.toExponential(2)}`)
ok('棱长确实是 2', near(d3(solved.points['A'], solved.points['B']), 2))
ok('六个面都真的共面', checkFacesPlanar(toRenderable(scene, solved.points)).length === 0)

console.log('\n【动点一：E 在线段 BC 上】')
{
  const at = (t: number) => {
    const def = scene.points.find((p) => p.name === 'E')
    if (def?.kind !== 'onSegment') throw new Error('E 不是线段动点')
    def.t = t
    return reevaluate(scene.points, solved.points)
  }
  const mid = at(0.5)
  ok('t=0.5 时 E 落在 BC 中点', near(d3(mid['E'], mid['B']), 1) && near(d3(mid['E'], mid['C']), 1))
  const start = at(0)
  ok('t=0 时 E 回到 B', near(d3(start['E'], start['B']), 0))
  const end = at(1)
  ok('t=1 时 E 到达 C', near(d3(end['E'], end['C']), 0))
  const quarter = at(0.25)
  ok('t=0.25 时 BE = 0.5', near(d3(quarter['E'], quarter['B']), 0.5))
  ok('E 始终在 BC 上（BE + EC = 2）', near(d3(quarter['E'], quarter['B']) + d3(quarter['E'], quarter['C']), 2))
  ok('E 移动不影响 F', near(d3(quarter['F'], mid['F']), 0))
  ok('E 移动不影响正方体的棱长', near(d3(quarter['A'], quarter['B']), 2))
}

console.log('\n【动点二：F 在侧面 ABB₁A₁ 内】')
{
  const at = (u: number, v: number) => {
    const def = scene.points.find((p) => p.name === 'F')
    if (def?.kind !== 'inFace') throw new Error('F 不是面内动点')
    def.u = u
    def.v = v
    return reevaluate(scene.points, solved.points)
  }
  const center = at(0.5, 0.5)
  ok(
    'u=v=0.5 时 F 落在面的正中间（到四个顶点等距）',
    near(d3(center['F'], center['A']), d3(center['F'], center['B'])) &&
      near(d3(center['F'], center['B']), d3(center['F'], center['B₁'])),
  )
  const corner = at(0, 0)
  ok('u=v=0 时 F 回到 A', near(d3(corner['F'], corner['A']), 0))
  const opposite = at(1, 1)
  ok('u=v=1 时 F 到达 B₁', near(d3(opposite['F'], opposite['B₁']), 0))

  // F 必须始终待在 ABB₁A₁ 所在的平面里：这个平面的 z 恒为 0
  const samples = [at(0.2, 0.7), at(0.9, 0.1), at(0.33, 0.66)]
  ok('无论怎么移，F 都待在这个面所在的平面内', samples.every((s) => near(s['F'][2], center['F'][2], 1e-9)))
  ok('F 移动不影响 E', near(d3(samples[2]['E'], center['E']), 0))
  ok('两个动点都动过之后，棱长还是 2', near(d3(samples[0]['A'], samples[0]['B']), 2))
  ok('两个动点都动过之后，|BC| 还是 2', near(d3(samples[0]['B'], samples[0]['C']), 2))
}

console.log('\n【解题过程：高亮要能覆盖线、面】')
{
  const sol = parseSolution(DEMO_SOLUTION, scene)
  ok('两步', sol.steps.length === 2, `实际 ${sol.steps.length}`)
  ok('第一步高亮了棱 BC', sol.steps[0].uses.edges.some(([a, b]) => a === 'B' && b === 'C'))
  ok('第一步也高亮了点 E', sol.steps[0].uses.points.includes('E'))
  ok('第二步高亮了面 ABB₁A₁', sol.steps[1].uses.faces.length === 1)

  // 高亮用的面必须是场景里真实存在的那个（同一个数组），否则渲染时按面名查不到、点不亮
  {
    const f = sol.steps[1].uses.faces[0] ?? []
    ok('高亮的面就是侧面 ABB₁A₁', f.length === 4 && ['A', 'B', 'B₁', 'A₁'].every((k) => f.includes(k)), f.join(''))
    ok('这个面确实是场景里的一个面', scene.faces.some((x) => x === f))
  }
  ok('第二步也高亮了点 F', sol.steps[1].uses.points.includes('F'))

  const merged = mergeSolution(scene, sol)
  ok('合并后点数不变（这两步不产生新点）', merged.points.length === scene.points.length)
  const again = solve(merged.points, merged.constraints)
  ok('合并后依然解得出', again.ok, `最大残差 ${again.maxError.toExponential(2)}`)
}

console.log('\n【元素名解析：点、棱、面都要认得】')
{
  const known = new Set(scene.points.map((p) => p.name))
  const p1 = parseElementName('E', known, scene.faces)
  ok('单个点', p1?.point === 'E')
  const p2 = parseElementName('B1C1', known, scene.faces)
  ok('两边带下标的棱', p2?.edge?.[0] === 'B₁' && p2?.edge?.[1] === 'C₁')
  const p3 = parseElementName('ABB1A1', known, scene.faces)
  ok('四个点组成的面', !!p3?.face, p3?.face?.join('') ?? '没认出来')
  ok('不存在的元素要被拒绝', parseElementName('XYZ', known, scene.faces) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
