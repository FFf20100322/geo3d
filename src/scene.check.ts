import { checkFacesPlanar, parseScene, toDisplayName, toRenderable, type Renderable } from './scene.ts'
import { solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：场景解析 + 全链路。
 * 用模型真实会返回的那种 json 走一遍「解析 → 求解 → 转渲染结构 → 验面共面」。
 * 跑 `pnpm scenecheck`。
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

console.log('【名称规范化】')
ok('A1 → A₁', toDisplayName('A1') === 'A₁')
ok('B_1 → B₁', toDisplayName('B_1') === 'B₁')
ok('G 不变', toDisplayName('G') === 'G')

console.log('\n【模型返回的场景，走完整链路】')
// 模拟模型对「斜三棱柱 ABC-A₁B₁C₁，所有棱长 2，∠A₁AB=∠A₁AC=60°，G/H 是中点」的输出
const raw = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [1.9, 0.2, 0.1] },
    { name: 'C', kind: 'free', at: [0.9, -0.1, 1.7] },
    { name: 'A1', kind: 'free', at: [0.8, 1.5, 0.4] },
    { name: 'B1', kind: 'offset', of: ['B', 'A1', 'A'] },
    { name: 'C1', kind: 'offset', of: ['C', 'A1', 'A'] },
    { name: 'G', kind: 'midpoint', of: ['B', 'C'] },
    { name: 'H', kind: 'midpoint', of: ['A1', 'C1'] },
  ],
  edges: [
    ['A', 'B'], ['B', 'C'], ['C', 'A'],
    ['A1', 'B1'], ['B1', 'C1'], ['C1', 'A1'],
    ['A', 'A1'], ['B', 'B1'], ['C', 'C1'],
    ['G', 'H'],
  ],
  faces: [
    ['A', 'B', 'C'],
    ['A1', 'B1', 'C1'],
    ['B', 'C', 'C1', 'B1'],
  ],
  constraints: [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'B', b: 'C', value: 2 },
    { kind: 'distance', a: 'C', b: 'A', value: 2 },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    { kind: 'angle', at: 'A', from: 'A1', to: 'B', value: 60 },
    { kind: 'angle', at: 'A', from: 'A1', to: 'C', value: 60 },
  ],
}

const scene = parseScene(raw)
ok('解析成功，点名称已转成下标写法', scene.points.some((p) => p.name === 'A₁'))
ok('棱数正确（含 GH）', scene.edges.length === 10, `实际 ${scene.edges.length}`)
ok('面数正确', scene.faces.length === 3)

const r = solve(scene.points, scene.constraints)
ok('求解通过', r.ok, `最大残差 ${r.maxError.toExponential(2)}`)

const render = toRenderable(scene, r.points)
ok('渲染结构里的点都用下标名', render.vertices.some((v) => v.name === 'A₁'))
ok('三个面都有颜色', render.faces.length === 3 && render.faces.every((f) => typeof f.color === 'number'))
const planar = checkFacesPlanar(render)
ok('所有面都真的共面', planar.length === 0, planar.join('；'))

console.log('\n【该拒绝的时候要拒绝】')
throws('不认识的约束类型', () => parseScene({ ...raw, constraints: [{ kind: 'sphere', at: 'A', value: 1 }] }), '我还不会处理的条件')
throws('约束引用了不存在的点', () => parseScene({ ...raw, constraints: [{ kind: 'distance', a: 'A', b: 'Z', value: 2 }] }), '不存在的点')
throws('点的类型不认识', () => parseScene({ ...raw, points: [{ name: 'A', kind: 'free' }, { name: 'B', kind: 'free' }, { name: 'C', kind: 'center' }] }), '我还不会处理')
throws('点重复定义', () => parseScene({ ...raw, points: [{ name: 'A', kind: 'free' }, { name: 'A1', kind: 'free' }, { name: 'A1', kind: 'free' }, { name: 'B', kind: 'free' }] }), '重复定义')
throws('派生点引用了还没定义的点', () => parseScene({ ...raw, points: [{ name: 'A', kind: 'free' }, { name: 'B', kind: 'free' }, { name: 'G', kind: 'midpoint', of: ['B', 'Q'] }] }), '还没定义')
throws('一条约束都没有', () => parseScene({ ...raw, constraints: [] }), '一条约束都没有')

console.log('\n【扭掉的面要能被发现】')
const face = (pts: Vec3[]): Renderable => ({ vertices: [], edges: [], faces: [{ key: 'k', pts, color: 1 }] })
ok('真的共面时不误报', checkFacesPlanar(face([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]])).length === 0)
ok(
  '四点不共面时被揪出来',
  checkFacesPlanar(face([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 1]])).length > 0,
)

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
