import {
  checkFacesPlanar,
  parseScene,
  gridLines,
  sceneForQuestion,
  toDisplayName,
  toRenderable,
  type Renderable,
} from './scene.ts'
import { solve, type Vec3 } from './solver.ts'

/**
 * 可运行的校验：场景解析 + 全链路。
 * 用模型真实会返回的那种 json 走一遍「解析 → 求解 → 转渲染结构 → 验面共面」。
 * 跑 `node src/scene.check.ts`。
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
const face = (pts: Vec3[]): Renderable => ({
  vertices: [],
  edges: [],
  faces: [{ key: 'k', pts, names: pts.map((_, i) => `p${i}`), color: 1 }],
})
ok('真的共面时不误报', checkFacesPlanar(face([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]])).length === 0)
ok(
  '四点不共面时被揪出来',
  checkFacesPlanar(face([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 1]])).length > 0,
)

console.log('\n【某一问独有的条件（「若」那一类）不能串问】')
{
  // 真机上常见的写法：「点 E 是棱 PB 上的动点。（1）…（2）若 E 是 PB 的中点，求…」。
  // 第（2）问的「若」只对第（2）问成立。要是把它并进主场景，
  // 第（1）问的图就悄悄错了 —— 而错的样子和对的样子**长得一模一样**，最难发现。
  const sc = parseScene({
    points: [
      { name: 'A', kind: 'free', at: [0, 0, 0] },
      { name: 'B', kind: 'free', at: [2, 0, 0] },
      { name: 'C', kind: 'free', at: [0, 0, 2] },
      { name: 'P', kind: 'free', at: [0, 2, 0] },
      { name: 'E', kind: 'onSegment', of: ['P', 'B'], t: 0.5 },
    ],
    constraints: [
      { kind: 'distance', a: 'A', b: 'B', value: 2 },
      { kind: 'distance', a: 'A', b: 'C', value: 2 },
      { kind: 'distance', a: 'A', b: 'P', value: 2 },
      { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'C'] },
      { kind: 'perpLinePlane', line: ['A', 'P'], plane: ['A', 'B', 'C'] },
    ],
    edges: [['A', 'B'], ['A', 'C'], ['P', 'B']],
    faces: [['A', 'B', 'C']],
    variants: [
      {
        q: '2',
        // 第（2）问里 E 改成中点 —— 与主场景里那个动点 E 同名，要能替换掉
        points: [{ name: 'E', kind: 'midpoint', of: ['P', 'B'] }],
        // |PB| = √(2²+2²) = 2√2，所以中点到 P 是 √2。
        // （一开始写成 1，测试当场就报「第（2）问解不出来」，残差 0.169 —— 抓得对。）
        constraints: [{ kind: 'distance', a: 'P', b: 'E', value: Math.SQRT2 }],
      },
    ],
  })
  ok('带 variants 的场景能解析', (sc.variants?.length ?? 0) === 1, `${sc.variants?.length ?? 0} 组`)

  const one = sceneForQuestion(sc, '1')
  const two = sceneForQuestion(sc, '2')
  const eKind = (s: { points: { name: string; kind: string }[] }) => s.points.find((p) => p.name === 'E')?.kind
  ok('看第（1）问时 E 还是动点', eKind(one) === 'onSegment', String(eKind(one)))
  ok('看第（2）问时 E 变成中点', eKind(two) === 'midpoint', String(eKind(two)))
  ok(
    '第（2）问的专属约束不会跑到第（1）问',
    one.constraints.length === sc.constraints.length && two.constraints.length === sc.constraints.length + 1,
    `第(1)问 ${one.constraints.length} 条 / 第(2)问 ${two.constraints.length} 条`,
  )
  const s1 = solve(one.points, one.constraints)
  const s2 = solve(two.points, two.constraints)
  ok('第（1）问的图形能解出来', s1.ok, s1.ok ? '' : `残差 ${s1.maxError.toExponential(2)}`)
  ok('第（2）问的图形也能解出来', s2.ok, s2.ok ? '' : `残差 ${s2.maxError.toExponential(2)}`)
  if (s2.ok) {
    const P = s2.points
    const PE = Math.hypot(P['E'][0] - P['P'][0], P['E'][1] - P['P'][1], P['E'][2] - P['P'][2])
    ok('第（2）问里 E 确实在中点上', Math.abs(PE - Math.SQRT2) < 1e-6, `PE = ${PE.toFixed(6)}`)
  }
}

console.log('\n【坐标平面上的网格】')
{
  // 用户要求：三个坐标平面各铺一层网格，格子 1 个单位，范围与坐标轴一样长，轴到头就停。
  // 取一组好算的：原点在原点，三条方向就是三个坐标轴。
  const axes: [Vec3, Vec3, Vec3] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  const segs = gridLines([0, 0, 0], axes, 2)
  ok('三个平面都有线', segs.length > 0, `${segs.length} 条`)

  // 每一条的两端都必须在轴长之内 —— 这就是「轴到头就不再显示」
  let outside = 0
  for (const [a, b] of segs) {
    for (const p of [a, b]) if (p.some((x) => x < -1e-6 || x > 2 + 1e-6)) outside++
  }
  ok('所有格线都落在轴长之内（轴到头就停）', outside === 0, outside ? `${outside} 个端点越界` : '')

  // 整数格线：3 个平面 × 两个方向 × 3 条（0、1、2）
  ok('整数格线的条数够（至少 18 条）', segs.length >= 18, `${segs.length}`)

  // 轴长不是整数时（真实情况是 1.25 个单位），最外圈要封口，而且**封到轴的长度上**
  const partial = gridLines([0, 0, 0], axes, 1.25)
  const reach = partial.filter(([a, b]) => [a, b].some((p) => p.some((x) => Math.abs(x - 1.25) < 1e-9)))
  ok('轴长不是整数时，外圈封到了轴的长度上', reach.length > 0, `${reach.length} 条到 1.25 的线`)

  // 原点挪了，网格要跟着挪
  const moved = gridLines([10, 20, 30], axes, 1)
  ok(
    '原点挪了，网格跟着挪',
    moved.some(([a, b]) => (a[0] === 10 && a[1] === 20 && a[2] === 30) || (b[0] === 10 && b[1] === 20 && b[2] === 30)),
  )

  // 退化：轴长为 0 或负数时不能崩，也不该画出一堆线
  ok('轴长为 0 时什么都不画', gridLines([0, 0, 0], axes, 0).length === 0)
  ok('轴长为负时什么都不画', gridLines([0, 0, 0], axes, -3).length === 0)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
