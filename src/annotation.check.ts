import {
  arcShape,
  buildAnnotation,
  enumerateAngles,
  isRightAngle,
  suggestRadius,
  type AngleSpec,
} from './annotation.ts'
import type { Vec3 } from './solver.ts'

/** 给枚举结果做去重键，用来验证「没有重复」 */
function angleKeyOf(spec: AngleSpec): string {
  const s = (list: string[]) => [...list].sort().join('|')
  if (spec.kind === 'lineLine') return `ll:${s(spec.p)}:${s(spec.q)}`
  if (spec.kind === 'linePlane') return `lp:${s(spec.line)}:${s(spec.plane)}`
  return `dh:${s(spec.edge)}:${spec.inA}:${spec.inB}`
}

/**
 * 可运行的校验：把「要标哪个角」翻译成「图上画什么」。
 * 仍然拿棱长 2 的正方体当靶子 —— 它的角度都有标准答案，能拿真答案比。
 * 跑 `node src/annotation.check.ts`。
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

console.log('\n【显示文字：度数永远由本地算，模型给的写法必须过反验】')
{
  // 用一个 45° 的角当例子：直角现在不写度数（只画小方块），拿它测文字就测不出东西
  const oblique: AngleSpec = { kind: 'lineLine', p: ['A', 'B'], q: ['A1', 'C1'], label: 'AB 与 A₁C₁' }
  const a = buildAnnotation(oblique, at, R)
  ok('模型没给 value 时，显示本地算出的度数', a?.text === 'AB 与 A₁C₁ = 45°', a?.text ?? '(空)')
  ok('整度数不写小数点（45° 而不是 45.00°）', (a?.text ?? '').includes('45°'))
  ok('没给 value 就不算「未通过」', a?.verified === undefined)

  // 直角：只画符号，不写度数
  const rightSpec: AngleSpec = { kind: 'lineLine', p: ['A', 'B'], q: ['A', 'D'], label: '∠BAD' }
  const right = buildAnnotation(rightSpec, at, R)
  ok('直角不写度数（只留小方块）', right?.text === '', `实际「${right?.text}」`)
  // 但直角报错了值仍然要能被发现
  const rightBad = buildAnnotation({ ...rightSpec, value: '60°', of: 'degrees' }, at, R)
  ok('直角报错了值也会被记下存疑', rightBad?.text === '' && rightBad?.verified === false, rightBad?.mismatch ?? '')

  // 模型报对了：直接用它的排版
  const good = buildAnnotation({ ...oblique, value: '45°', of: 'degrees' }, at, R)
  ok('模型报对了就用它的写法', good?.text === 'AB 与 A₁C₁ = 45°' && good?.verified === true, good?.text ?? '')

  // 模型报错了：不能显示错的，退回本地算的度数
  const bad = buildAnnotation({ ...oblique, value: '60°', of: 'degrees' }, at, R)
  ok('模型报错了就退回本地度数', bad?.text === 'AB 与 A₁C₁ = 45°' && bad?.verified === false, bad?.text ?? '')
  ok('并且说明哪里对不上', !!bad?.mismatch, bad?.mismatch ?? '')

  // 余弦写法：A₁C 与底面所成角的余弦是 √6/3
  const lp: AngleSpec = { kind: 'linePlane', line: ['A1', 'C'], plane: ['A', 'B', 'D'], label: '线面角' }
  const cosOk = buildAnnotation({ ...lp, value: '√6/3', of: 'cos' }, at, R)
  ok('余弦形式的正确答案能通过', cosOk?.text === '线面角 = √6/3' && cosOk?.verified === true, cosOk?.text ?? '')

  const cosBad = buildAnnotation({ ...lp, value: '√3/3', of: 'cos' }, at, R)
  ok('把余弦写错会被拦下（√3/3 是另一个角的值）', cosBad?.verified === false, cosBad?.mismatch ?? '')

  // 一位小数的度数写法应当算通过
  const rounded = buildAnnotation({ ...lp, value: '35.3', of: 'degrees' }, at, R)
  ok('一位小数的度数写法算通过', rounded?.verified === true, rounded?.mismatch ?? '')

  // 完全看不懂的写法
  const junk = buildAnnotation({ ...oblique, value: '四十五度' }, at, R)
  ok('看不懂的写法退回本地度数并说明', junk?.text === 'AB 与 A₁C₁ = 45°' && !!junk?.mismatch, junk?.mismatch ?? '')

  // 二面角的标准答案：余弦为 √3/3
  const dh = buildAnnotation(
    { kind: 'dihedral', edge: ['B', 'D'], inA: 'A1', inB: 'A', label: '二面角 A₁-BD-A', value: '√3/3', of: 'cos' },
    at,
    R,
  )
  ok('二面角的余弦写法也能通过', dh?.verified === true, dh?.text ?? '')
}

console.log('\n【直角画成小方块，不画圆弧】')
{
  const right = buildAnnotation({ kind: 'lineLine', p: ['A', 'B'], q: ['A', 'D'], label: '∠BAD' }, at, R)
  ok('直角本身算得出来', right !== null && Math.abs(right.degrees - 90) < 1e-9)
  const shape = right ? arcShape(right, R) : null
  ok('直角只画三个点（折线，不是弧）', shape?.arc.length === 3, `实际 ${shape?.arc.length}`)
  ok('折线起点落在第一个方向上', shape ? d3(shape.arc[0], right!.vertex) - R < 1e-9 : false)
  ok('折线拐角处到顶点距离是半径的根号二倍', (() => {
    if (!shape || !right) return false
    return near(d3(shape.arc[1], right.vertex), R * Math.SQRT2, 1e-9)
  })())

  // 非直角仍然画弧，而且是很多点
  const oblique = buildAnnotation({ kind: 'lineLine', p: ['A', 'B'], q: ['A1', 'C1'], label: 'x' }, at, R)
  const obliqueShape = oblique ? arcShape(oblique, R) : null
  ok('不是直角就照旧画弧（点数多于 3）', (obliqueShape?.arc.length ?? 0) > 3, `实际 ${obliqueShape?.arc.length}`)

  ok('直角判定：90 度是，89 不是', isRightAngle(90) && !isRightAngle(89))
}

console.log('\n【本地枚举图上所有角】')
{
  const edges: [string, string][] = [
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
    ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
    ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1'],
  ]
  const faces = [
    ['A', 'B', 'C', 'D'],
    ['A1', 'B1', 'C1', 'D1'],
    ['A', 'B', 'B1', 'A1'],
    ['B', 'C', 'C1', 'B1'],
    ['C', 'D', 'D1', 'C1'],
    ['D', 'A', 'A1', 'D1'],
  ]
  const found = enumerateAngles(edges, faces)
  const count = (k: string) => found.filter((f) => f.kind === k).length
  // 正方体是可以手算的：8 个顶点每个 3 条棱 → 每顶点 3 对角 → 24
  ok('线线角枚举出 24 个', count('lineLine') === 24, `实际 ${count('lineLine')}`)
  // 12 条棱，每条棱正好属于 2 个面 → 12 个二面角
  ok('二面角枚举出 12 个', count('dihedral') === 12, `实际 ${count('dihedral')}`)
  // 每条棱与「只含它一个端点的面」组成线面角，每条棱 2 个 → 24
  ok('线面角枚举出 24 个', count('linePlane') === 24, `实际 ${count('linePlane')}`)
  ok('没有重复', new Set(found.map((f) => angleKeyOf(f))).size === found.length)

  // 抽一个来验：棱 AB 与面 BCC₁B₁（AB 的端点 B 在该面内）
  const sample = found.find(
    (f): f is Extract<AngleSpec, { kind: 'linePlane' }> =>
      f.kind === 'linePlane' && f.line[1] === 'B' && f.plane.includes('C1'),
  )
  ok('能抽出「AB 与面 BCC₁B₁」这样的线面角', !!sample)
  if (sample) {
    const a = buildAnnotation(sample, at, R)
    // AB ⊥ 面 BCC₁B₁，所以这个线面角是 90°
    ok('抽出来的这个角算出来是 90°（AB 垂直于该面）', a !== null && Math.abs(a.degrees - 90) < 1e-6, `${a?.degrees.toFixed(4)}`)
  }

  // 共棱的两个面才能组成二面角
  const dh = found.find((f): f is Extract<AngleSpec, { kind: 'dihedral' }> => f.kind === 'dihedral')
  ok('枚举出的二面角参考点都不在棱上', (() => {
    if (!dh) return false
    return dh.inA !== dh.edge[0] && dh.inA !== dh.edge[1] && dh.inB !== dh.edge[0] && dh.inB !== dh.edge[1]
  })())
}
