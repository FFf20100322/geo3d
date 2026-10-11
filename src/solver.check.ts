import { type Constraint, type PointDef, type Vec3, solve } from './solver.ts'

/**
 * 可运行的校验：用三道真实题目检验求解器。
 * 模型给的初值再歪，只要约束写对了，这里就必须算出正确的图形；算不出来就该失败。
 * 跑 `node src/solver.check.ts`。
 */

let failed = 0
const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6

function run(title: string, defs: PointDef[], cs: Constraint[], verify: (p: Record<string, Vec3>) => [string, boolean][]) {
  console.log(`\n【${title}】`)
  const t0 = Date.now()
  const r = solve(defs, cs)
  const ms = Date.now() - t0
  console.log(`  求解${r.ok ? '通过' : '失败'}，最大残差 ${r.maxError.toExponential(2)}，用时 ${ms}ms`)
  for (const res of r.residuals) console.log(`    · ${res.desc} → 实际 ${res.actual}｜误差 ${res.error.toExponential(2)}`)

  const lines: [string, boolean][] = [
    ['约束全部满足（残差 < 1e-4）', r.ok],
    ...verify(r.points),
  ]
  for (const [label, ok] of lines) {
    console.log(`${ok ? '  ✓' : '  ✗'} ${label}`)
    if (!ok) failed++
  }
}

// ---- 用例一：棱长 2 的正方体。初值故意给得歪歪扭扭，考求解器能不能自己拉正 ----
run(
  '棱长 2 的正方体 ABCD-A₁B₁C₁D₁',
  [
    { name: 'A', kind: 'free', at: [0, 0.3, 0] },
    { name: 'B', kind: 'free', at: [2.4, -0.2, 0.1] },
    { name: 'D', kind: 'free', at: [0.2, 0, 1.7] },
    { name: 'A1', kind: 'free', at: [0.3, 1.6, -0.4] },
    { name: 'C', kind: 'offset', of: ['B', 'D', 'A'] },
    { name: 'B1', kind: 'offset', of: ['B', 'A1', 'A'] },
    { name: 'C1', kind: 'offset', of: ['C', 'A1', 'A'] },
    { name: 'D1', kind: 'offset', of: ['D', 'A1', 'A'] },
  ],
  [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'A', b: 'D', value: 2 },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'D'] },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'A1'] },
    { kind: 'perpendicular', p: ['A', 'D'], q: ['A', 'A1'] },
    { kind: 'parallel', p: ['A', 'B'], q: ['D1', 'C1'] },
    { kind: 'coplanar', pts: ['A', 'B', 'C', 'D'] },
  ],
  (p) => [
    ['体对角线 |AC₁| = 2√3', near(d3(p['A'], p['C1']), 2 * Math.sqrt(3))],
    ['体对角线 |A₁C| = 2√3', near(d3(p['A1'], p['C']), 2 * Math.sqrt(3))],
    ['面对角线 |A₁B| = 2√2', near(d3(p['A1'], p['B']), 2 * Math.SQRT2)],
    ['|D₁B| = 2√3', near(d3(p['D1'], p['B']), 2 * Math.sqrt(3))],
  ],
)

// ---- 用例二：四棱锥 P-ABCD，底面正方形边长 2，PA ⊥ 底面，PA = 3。这一条专门考线面垂直 ----
run(
  '四棱锥 P-ABCD（底面正方形边长 2，PA ⊥ 底面，PA = 3）',
  [
    { name: 'A', kind: 'free', at: [0, 0.4, 0] },
    { name: 'B', kind: 'free', at: [2.2, 0, 0.2] },
    { name: 'D', kind: 'free', at: [0.1, 0.1, 1.8] },
    { name: 'P', kind: 'free', at: [0.4, 2.6, -0.3] },
    { name: 'C', kind: 'offset', of: ['B', 'D', 'A'] },
  ],
  [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'A', b: 'D', value: 2 },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'D'] },
    { kind: 'perpLinePlane', line: ['A', 'P'], plane: ['A', 'B', 'D'] },
    { kind: 'distance', a: 'A', b: 'P', value: 3 },
  ],
  (p) => [
    ['|PC| = √17', near(d3(p['P'], p['C']), Math.sqrt(17))],
    ['|PB| = √13', near(d3(p['P'], p['B']), Math.sqrt(13))],
    ['底面是正方形，|BC| = 2', near(d3(p['B'], p['C']), 2)],
  ],
)

// ---- 用例三：斜三棱柱 ABC-A₁B₁C₁，所有棱长 2，∠A₁AB = ∠A₁AC = 60°。这是用户刚拍的那道真题 ----
run(
  '斜三棱柱 ABC-A₁B₁C₁（所有棱长 2，∠A₁AB = ∠A₁AC = 60°）',
  [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [1.9, 0.2, 0] },
    { name: 'C', kind: 'free', at: [0.8, -0.1, 1.6] },
    { name: 'A1', kind: 'free', at: [0.9, 1.4, 0.5] },
    { name: 'B1', kind: 'offset', of: ['B', 'A1', 'A'] },
    { name: 'C1', kind: 'offset', of: ['C', 'A1', 'A'] },
    { name: 'G', kind: 'midpoint', of: ['B', 'C'] },
    { name: 'H', kind: 'midpoint', of: ['A1', 'C1'] },
  ],
  [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'B', b: 'C', value: 2 },
    { kind: 'distance', a: 'C', b: 'A', value: 2 },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    { kind: 'angle', at: 'A', from: 'A1', to: 'B', value: 60 },
    { kind: 'angle', at: 'A', from: 'A1', to: 'C', value: 60 },
  ],
  (p) => {
    // 四边形 BCC₁B₁ 的面积 = |BC × BB₁|
    const a: Vec3 = [p['C'][0] - p['B'][0], p['C'][1] - p['B'][1], p['C'][2] - p['B'][2]]
    const b: Vec3 = [p['B1'][0] - p['B'][0], p['B1'][1] - p['B'][1], p['B1'][2] - p['B'][2]]
    const area = Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
    return [
      ['G 是 BC 中点', near(d3(p['G'], p['B']), 1) && near(d3(p['G'], p['C']), 1)],
      ['H 是 A₁C₁ 中点', near(d3(p['H'], p['A1']), 1) && near(d3(p['H'], p['C1']), 1)],
      ['四边形 BCC₁B₁ 面积 = 4（第(1)问的答案）', near(area, 4)],
      ['A₁ 到底面三顶点等距，|A₁B| = 2', near(d3(p['A1'], p['B']), 2)],
    ]
  },
)

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
