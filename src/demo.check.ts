import {
  DEMO_PROBLEM,
  DEMO_SCENE,
  DEMO_SOLUTION,
  FULL_EXPECT,
  FULL_SCENE,
  FULL_SOLUTION,
  FOLD_SCENE,
} from './demo.ts'
import { checkFacesPlanar, faceKey, parseScene, toRenderable } from './scene.ts'
import { mergeSolution, parseElementName, parseSolution } from './solution.ts'
import { isMoving, reevaluate, solve, type Vec3 } from './solver.ts'


/**
 * 可运行的校验：把内置测试题（正四面体 + 三个面内动点）从头到尾跑一遍。
 * 它是回归的种子 —— 以后任何一次改动把这个测试题弄坏了，这里会当场失败。
 * 跑 `node src/demo.check.ts`。
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
ok('解析成功', scene.points.length === 8, `${scene.points.length} 个点`) // A B C P + 动点 E F M + 中点 N
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
  // 长度标注：解析出来之后，引用的点必须都真的在图上
  ok('解析出两条长度标注', sol.lengths.length === 2, `实际 ${sol.lengths.length}`)
  ok(
    '长度引用的点都真实存在',
    (() => {
      const names = new Set([...scene.points.map((p) => p.name), ...sol.steps.flatMap((s) => s.addPoints.map((p) => p.name))])
      return sol.lengths.every((l) => l.p.every((n) => names.has(n)))
    })(),
  )
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

console.log('\n【内置测试题之二：正方体 —— 四个问的答案逐个复核】')
{
  // 这道题存在的意义就是「把功能用满 + 答案手工算准」。
  // 下面这些期望值是**按几何算出来的**，不是从程序里抄的 ——
  // 程序算出来对不上，就说明程序错了（或者我算错了，两种都该当场发现）。
  const parsed = parseScene(FULL_SCENE)
  ok('场景解析通过', true, `${parsed.points.length} 个点 / ${parsed.constraints.length} 条约束`)

  const solved = solve(parsed.points, parsed.constraints)
  ok('正方体能解出来', solved.ok, solved.ok ? '' : `最大残差 ${solved.maxError.toExponential(2)}`)

  if (solved.ok) {
    const base = reevaluate(parsed.points, solved.points)
    // 注意点名：求解结果里用的是**显示名**（A₁ 是下标字符 ₁，不是数字 1）。
    // 源码里为了好写用 A1，取的时候要转一下 —— 转不出来就直接报错
    // （静默返回 undefined 会变成一句莫名其妙的「reading '0'」）。
    const pick = (P: Record<string, Vec3>, n: string): Vec3 => {
      const v = P[n] ?? P[n.replace(/1$/, '₁')]
      if (!v) throw new Error(`求解结果里没有点 ${n}`)
      return v
    }
    const at = (n: string) => pick(base, n)

    // ---- 形状：十二条棱都该是 2（这些点都在场景里，不用等解答） ----
    const cubeEdges: [string, string][] = [
      ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
      ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
      ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1'],
    ]
    const badEdges = cubeEdges.filter(([a, b]) => !near(d3(at(a), at(b)), 2, 1e-6))
    ok('十二条棱长度都是 2', badEdges.length === 0, badEdges.map((e) => e.join('')).join(' '))

    const diags = [['A', 'C1'], ['B', 'D1'], ['C', 'A1'], ['D', 'B1']]
    ok(
      '四条体对角线都是 2√3',
      diags.every(([a, b]) => near(d3(at(a), at(b)), 2 * Math.sqrt(3), 1e-6)),
    )
  }

  // ---- 解答：解析 → 合并辅助点与辅助线 → 重新求解。
  // 四个问要用到的 O、H、M、G、N 都是**解答加出来的**，所以答案要在合并后的图形上验。
  const sol = solved.ok ? parseSolution(FULL_SOLUTION, parsed) : null
  if (sol) {
    ok('解答解析通过', true, `${sol.steps.length} 步 / ${sol.angles.length} 个角 / ${sol.lengths.length} 个长度`)
    const merged = mergeSolution(parsed, sol)
    const re = solve(merged.points, merged.constraints)
    ok('加上辅助线后仍然对得上', re.ok, re.ok ? '' : `最大残差 ${re.maxError.toExponential(2)}`)

    if (re.ok) {
      const P = reevaluate(merged.points, re.points)
      const at2 = (n: string) => {
        const v = P[n] ?? P[n.replace(/1$/, '₁')]
        if (!v) throw new Error(`合并后的图形里没有点 ${n}`)
        return v
      }
      ok('解答确实把辅助点补出来了', ['O', 'H', 'M', 'G', 'N'].every((n) => !!P[n]), Object.keys(P).length + ' 个点')

      // 两条独立来路该落到同一个点：O 是 AC 中点，H 是 A₁ 在 BD 上的射影
      ok(
        '底面中心 O 与 A₁ 到 BD 的射影 H 重合（两条独立定义互相印证）',
        d3(at2('O'), at2('H')) < 1e-6,
        `相距 ${d3(at2('O'), at2('H')).toExponential(2)}`,
      )

      const angleOf = (a: Vec3, b: Vec3) => {
        const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
        const c = Math.max(-1, Math.min(1, dot / (Math.hypot(...a) * Math.hypot(...b))))
        return (Math.acos(c) * 180) / Math.PI
      }
      const deg1 = angleOf(sub(at2('A1'), at2('B')), sub(at2('B1'), at2('C')))
      ok('（1）A₁B 与 B₁C 所成角 = 60°', near(deg1, FULL_EXPECT.skewAngleDegrees, 1e-6), `${deg1.toFixed(6)}°`)

      const u = sub(at2('O'), at2('A'))
      const v = sub(at2('O'), at2('A1'))
      const cos2 =
        (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (Math.hypot(...u) * Math.hypot(...v))
      ok('（2）二面角 A₁-BD-A 的余弦 = √3/3', near(cos2, FULL_EXPECT.dihedralCos, 1e-6), `${cos2.toFixed(6)}`)

      const hG = Math.abs(at2('G')[1] - at2('A')[1])
      const sin3 = hG / d3(at2('A1'), at2('G'))
      ok('（3）A₁G 与底面所成角的正弦 = 1/3', near(sin3, FULL_EXPECT.linePlaneSin, 1e-6), `${sin3.toFixed(6)}`)

      // （4）E 在顶棱上（离底面 2）、F 在底面内（离底面 0），所以 EF ≥ 2，且竖直对齐时能取到。
      // 这里暴力扫一遍参数空间 —— 它是独立于解法的复核，比顺着推导再算一遍可信。
      const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [
        a[0] + t * (b[0] - a[0]),
        a[1] + t * (b[1] - a[1]),
        a[2] + t * (b[2] - a[2]),
      ]
      const onBase = (s: number, w: number): Vec3 => {
        const p1 = lerp(at2('A'), at2('B'), s)
        const p2 = lerp(at2('D'), at2('C'), s)
        return lerp(p1, p2, w)
      }
      let minEF = Infinity
      for (let i = 0; i <= 40; i++)
        for (let j = 0; j <= 40; j++)
          for (let k = 0; k <= 40; k++)
            minEF = Math.min(minEF, d3(lerp(at2('A1'), at2('B1'), i / 40), onBase(j / 40, k / 40)))
      ok('（4）EF 的最小值 = 2', Math.abs(minEF - FULL_EXPECT.minEF) < 2e-2, `扫出来 ${minEF.toFixed(4)}`)

      const dist = d3(at2('A'), at2('N'))
      ok('附带：A 到平面 A₁BD 的距离 = 2√3/3', near(dist, FULL_EXPECT.distAToPlaneA1BD, 1e-6), `${dist.toFixed(6)}`)

      const r = toRenderable(merged, re.points, parsed)
      ok(
        '渲染数据齐备',
        r.vertices.length > 0 && r.edges.length > 0 && r.faces.length > 0,
        `${r.vertices.length} 点 / ${r.edges.length} 棱 / ${r.faces.length} 面`,
      )
      ok('所有面都共面', checkFacesPlanar(r).length === 0, checkFacesPlanar(r).join(' '))
      // 辅助线要真的多出来 —— 这是「播放器有东西可揭示」的前提
      ok('辅助线比场景里的多', r.edges.filter((e) => e.aux).length >= 5, `${r.edges.filter((e) => e.aux).length} 条辅助线`)
    }
  }
}

console.log('\n【翻折题：把角度扫一遍，取值范围必须是算出来的、不是手推的】')
{
  // **这条断言欠了很久。**
  // demo.ts 里那句注释曾经写着「demo.check.ts 里有一条扫角度的断言守着它」——
  // 而那条断言**全仓都不存在**，是一张假保险单。
  // 代价是实打实的：这道题的取值范围我手工推过两次，**两次都错**
  //   · 第一次写「0 到 2√2」
  //   · 第二次按「|AC| ± 半径」改成 [2√2−2, 2√2+2] —— 那个公式只有在 A、C 与圆共面时才成立，
  //     而 A 根本不在 D₂ 转动的那个平面上（那个平面过 C 且垂直于 BC）
  // 正确答案是 [2, 2√5]（D₂ = (2−2cosθ, −2sinθ, 2)，于是 |AD₂|² = 12 − 8cosθ）。
  // 现在让**程序自己扫**：把角度从 −180 扫到 180，记下 |AD₂| 的最小与最大值。
  const parsed = parseScene(FOLD_SCENE)
  const lo = { v: Infinity, d: 0 }
  const hi = { v: -Infinity, d: 0 }
  let solvedCount = 0
  for (let deg = -180; deg <= 180; deg += 1) {
    const pts = parsed.points.map((p) => (p.kind === 'onArc' ? { ...p, angle: deg } : p))
    const r = solve(pts, parsed.constraints)
    if (!r.ok) continue
    solvedCount++
    // 解答里的点名是规范化过的（D2 存成 D₂），所以直接用下标写法当键。
    // 两种写法都试一下 —— 换个命名习惯也不至于让这条断言悄悄空转。
    const A = r.points['A'] ?? r.points['A\u2081']
    const D2 = r.points['D\u2082'] ?? r.points['D2']
    if (!A || !D2) continue
    const d = d3(A, D2)
    if (d < lo.v) {
      lo.v = d
      lo.d = deg
    }
    if (d > hi.v) {
      hi.v = d
      hi.d = deg
    }
  }

  ok('各角度都能解出来', solvedCount > 300, `${solvedCount} 个角度`)
  ok('最小值是 2（即 2√5 那个式子里 cosθ 取 1 的那端）', Math.abs(lo.v - 2) < 1e-3, `${lo.v.toFixed(4)} @ ${lo.d}°`)
  ok('最大值是 2√5 ≈ 4.4721', Math.abs(hi.v - 2 * Math.sqrt(5)) < 1e-3, `${hi.v.toFixed(4)} @ ${hi.d}°`)
  // 顺手把「|AD| 到底是多少」也钉住 —— 注释里曾经写成 2√2，实际是 2（2√2 是 |AC|）
  const flat = solve(
    parsed.points.map((p) => (p.kind === 'onArc' ? { ...p, angle: 0 } : p)),
    parsed.constraints,
  )
  if (flat.ok) {
    const A0 = flat.points['A']
    const D0 = flat.points['D'] ?? flat.points['D\u2082'] ?? flat.points['D2']
    if (A0 && D0) ok('θ=0 时 |AD| 是 2（不是 2√2）', Math.abs(d3(A0, D0) - 2) < 1e-3, d3(A0, D0).toFixed(4))
  }
  // 90° 那条（第（1）问）也要对得上：2√3 ≈ 3.4641
  const right = solve(
    parsed.points.map((p) => (p.kind === 'onArc' ? { ...p, angle: 90 } : p)),
    parsed.constraints,
  )
  if (right.ok) {
    const A9 = right.points['A']
    const D9 = right.points['D\u2082'] ?? right.points['D2']
    if (A9 && D9) ok('90° 时 |AD₂| 是 2√3 ≈ 3.4641', Math.abs(d3(A9, D9) - 2 * Math.sqrt(3)) < 1e-3, d3(A9, D9).toFixed(4))
  }
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
