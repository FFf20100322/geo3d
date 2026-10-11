import { parseScene } from './scene.ts'
import { mergeSolution, parseElementName, parseSolution, stepTimeline } from './solution.ts'
import { solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：解题过程层。
 * 重点考两件事：辅助点必须算得出来（不许凭空插自由点），以及辅助点算出来的坐标真的对。
 * 跑 `pnpm solutioncheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
function throws(label: string, fn: () => unknown, wantFragment: string) {
  try {
    fn()
    failed++
    console.log(`  ✗ ${label}　本该报错却没有`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const good = msg.includes(wantFragment)
    if (!good) failed++
    console.log(`${good ? '  ✓' : '  ✗'} ${label}　→「${msg}」`)
  }
}

const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6

// 棱长 2 的正方体，供后面所有用例复用
const rawScene = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'D', kind: 'free', at: [0, 0, 2] },
    { name: 'A1', kind: 'free', at: [0, 2, 0] },
    { name: 'C', kind: 'offset', of: ['B', 'D', 'A'] },
    { name: 'B1', kind: 'offset', of: ['B', 'A1', 'A'] },
    { name: 'C1', kind: 'offset', of: ['C', 'A1', 'A'] },
    { name: 'D1', kind: 'offset', of: ['D', 'A1', 'A'] },
  ],
  edges: [
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
    ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
    ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1'],
  ],
  faces: [
    ['A', 'B', 'C', 'D'],
    ['A1', 'B1', 'C1', 'D1'],
  ],
  constraints: [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'A', b: 'D', value: 2 },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'D'] },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'A1'] },
    { kind: 'perpendicular', p: ['A', 'D'], q: ['A', 'A1'] },
  ],
}
const scene = parseScene(rawScene)
const base = solve(scene.points, scene.constraints)
ok('基础图形先解出来', base.ok, `残差 ${base.maxError.toExponential(2)}`)

console.log('\n【解析一份正常的解题过程】')
const rawSolution = {
  steps: [
    {
      title: '取 BD 的中点 O',
      text: '连接 BD，取中点 O，再连 AO。',
      why: '正方形的对角线互相平分',
      addPoints: [{ name: 'O', kind: 'midpoint', of: ['B', 'D'] }],
      addEdges: [['B', 'D'], ['A', 'O']],
      uses: ['A', 'B', 'D'],
    },
    {
      title: '作 A₁ 到平面 ABD 的垂足 H',
      text: '因为 A₁A ⊥ 底面，垂足就是 A。',
      why: '线面垂直的定义',
      addPoints: [{ name: 'H', kind: 'perpFoot', of: ['A1', 'A', 'B', 'D'] }],
      addEdges: [['A1', 'H']],
      uses: ['A1'],
    },
  ],
  answers: [{ label: '(1)', value: '4' }],
}

const solution = parseSolution(rawSolution, scene)
ok('步数正确', solution.steps.length === 2)
ok('答案解析出来了', solution.answers[0]?.value === '4')

const merged = mergeSolution(scene, solution)
ok('辅助点并进了场景', merged.points.some((p) => p.name === 'O') && merged.points.some((p) => p.name === 'H'))
ok('辅助线并进了场景', merged.edges.some((e) => e[0] === 'A' && e[1] === 'O'))

const solved2 = solve(merged.points, merged.constraints)
ok('带辅助点的图形依然能解出来', solved2.ok, `残差 ${solved2.maxError.toExponential(2)}`)

const P = solved2.points
ok('O 确实是 BD 的中点', near(d3(P['O'], P['B']), d3(P['O'], P['D'])))
ok('O 到 B 的距离是面对角线的一半', near(d3(P['O'], P['B']), Math.SQRT2))
ok('A₁ 到平面 ABD 的垂足就是 A', near(d3(P['H'], P['A']), 0), `实际距离 ${d3(P['H'], P['A']).toExponential(2)}`)

console.log('\n【射影点】')
{
  const proj = parseSolution(
    {
      steps: [
        {
          title: '作 A 在 BC 上的射影',
          text: '因为 AB ⊥ BC，射影就是 B。',
          why: '线线垂直',
          addPoints: [{ name: 'K', kind: 'projLine', of: ['A', 'B', 'C'] }],
          addEdges: [],
          uses: ['A'],
        },
      ],
      answers: [],
    },
    scene,
  )
  const m = solve(mergeSolution(scene, proj).points, scene.constraints)
  ok('射影 K 落在 B 上（因为 AB ⊥ BC）', near(d3(m.points['K'], m.points['B']), 0))
}

console.log('\n【该拒绝的时候要拒绝】')
throws('解题过程是空的', () => parseSolution({ steps: [], answers: [] }, scene), '解题过程是空的')
throws(
  '辅助点里插自由点（等于偷偷改图形）',
  () =>
    parseSolution(
      { steps: [{ title: 'x', text: 'y', addPoints: [{ name: 'Z', kind: 'free', at: [1, 1, 1] }] }], answers: [] },
      scene,
    ),
  '我还不会处理',
)
throws(
  '辅助点引用了不存在的点',
  () =>
    parseSolution(
      { steps: [{ title: 'x', text: 'y', addPoints: [{ name: 'Z', kind: 'midpoint', of: ['A', 'Q'] }] }], answers: [] },
      scene,
    ),
  '还不存在',
)
throws(
  '辅助线引用了不存在的点',
  () =>
    parseSolution({ steps: [{ title: 'x', text: 'y', addEdges: [['A', 'Q']] }], answers: [] }, scene),
  '不存在',
)
throws('缺 title', () => parseSolution({ steps: [{ text: 'y' }], answers: [] }, scene), 'title')
throws(
  '垂足的 of 数量不对',
  () =>
    parseSolution(
      { steps: [{ title: 'x', text: 'y', addPoints: [{ name: 'Z', kind: 'perpFoot', of: ['A', 'B'] }] }], answers: [] },
      scene,
    ),
  '应该有 4 个点',
)

console.log('\n【逐步时间线（动画要用）】')
{
  const tl = stepTimeline(scene, solution)
  ok('步数对得上', tl.afterStep.length === 2)
  ok('第一步之前没有 O', !scene.points.some((p) => p.name === 'O'))
  ok('第一步之后有 O', tl.afterStep[0].points.has('O'))
  ok('第一步之后有 AO 这条线', tl.afterStep[0].edges.has('A|O'))
  ok('第二步之后有 H', tl.afterStep[1].points.has('H'))
}

console.log('\n【uses 里的元素名要能分清「点」和「棱」】')
{
  const known = new Set(['A', 'B', 'C', 'D', 'A₁', 'B₁', 'C₁', 'D₁', 'O', 'AB'])
  const kind = (s: string) => {
    const r = parseElementName(s, known)
    if (!r) return '解析不了'
    return r.point ? `点 ${r.point}` : `棱 ${r.edge?.join('')}`
  }

  ok('单个点', kind('A') === '点 A', kind('A'))
  ok('带下标的单点', kind('A1') === '点 A₁', kind('A1'))
  ok('两个字母的棱', kind('BC') === '棱 BC', kind('BC'))
  ok('两边都带下标的棱', kind('B1C1') === '棱 B₁C₁', kind('B1C1'))
  ok('点和棱重名时优先当点', kind('AB') === '点 AB', kind('AB'))
  ok('混合：字母加点', kind('A1B') === '棱 A₁B', kind('A1B'))
  ok('不存在的元素要拒绝', parseElementName('XYZ', known) === null)
  ok('半个不存在的元素也要拒绝', parseElementName('QR', known) === null)
}

console.log('\n【uses 结构化以后，高亮数据能直接拿去用】')
{
  const sol2 = parseSolution({ steps: [{ title: 'x', text: 'y', uses: ['A', 'BC'] }], answers: [] }, scene)
  const u = sol2.steps[0].uses
  ok('点归点', u.points.length === 1 && u.points[0] === 'A')
  ok('棱归棱', u.edges.length === 1 && u.edges[0][0] === 'B' && u.edges[0][1] === 'C')
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
