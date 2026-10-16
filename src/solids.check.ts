import { Vector3 } from 'three'
import { localAnchors, solidPlacement, worldAnchors, type SolidSpec } from './solids.ts'

/**
 * 曲面立体的**摆放自检**。
 *
 * 这个文件存在的意义：曲面立体的位置对不对，本来只能靠眼睛看（而且很容易看漏 ——
 * 圆锥飘在半空中那种错，扫一眼未必发现）。但把摆放抽成纯函数之后，
 * **可以在电脑上算出来**：把变换矩阵作用到几何体自己的端点上，
 * 看落点是不是正好在图上的该在的地方。
 *
 * 这样手机拔了也能验。
 */

let failed = 0
const ok = (label: string, pass: boolean, extra = '') => {
  console.log(`${pass ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
  if (!pass) failed++
}

/** 把矩阵作用到一个局部点上 */
const apply = (spec: SolidSpec, local: [number, number, number]): Vector3 | null => {
  const p = solidPlacement(spec)
  if (!p) return null
  return new Vector3(...local).applyMatrix4(p.matrix)
}

/** 两个点离得多近（容差用得到） */
const dist = (a: Vector3, b: number[] | undefined): number =>
  b ? a.distanceTo(new Vector3(b[0], b[1], b[2])) : NaN

console.log('【曲面立体：摆完之后端点落在该在的地方吗】')

// ---- 球：几何体上的 (r,0,0) 应该正好落在球面那个点上 ----
{
  const spec: SolidSpec = { kind: 'sphere', center: [1, 2, 3], radius: 1.5 }
  const hit = apply(spec, [1.5, 0, 0])
  // 球心 (1,2,3) 沿 x 走一个半径 1.5，落在 (2.5, 2, 3)。
  // （一开始我把期望写成 (3,2,3) —— 是**我算错了**，1 + 1.5 = 2.5。）
  ok('球面上的点落在球心往 x 走一个半径的地方', !!hit && dist(hit, [2.5, 2, 3]) < 1e-9, hit ? `${hit.x},${hit.y},${hit.z}` : '算不出来')
}

// ---- 椭球：三条半轴的长度与方向都要对上 ----
{
  // 故意让半轴**不沿坐标轴**：u 沿 (1,0,0)，v 沿 (0,1,0) 的某个斜方向，w 再斜一点。
  // 这正是椭球最容易画错的地方。
  const spec: SolidSpec = {
    kind: 'ellipsoid',
    center: [0, 0, 0],
    ax: [2, 0, 0],
    ay: [1, 1, 0],
    az: [0, 0, 0.5],
  }
  const a = apply(spec, [1, 0, 0])
  const b = apply(spec, [0, 1, 0])
  const c = apply(spec, [0, 0, 1])
  ok('半轴 a 落对了', !!a && dist(a, [2, 0, 0]) < 1e-6, a ? `${a.x.toFixed(3)},${a.y.toFixed(3)},${a.z.toFixed(3)}` : '')
  // v 给的是 (1,1,0)，施密特正交化之后方向会垂直于 u —— 所以**落点不等于给定的那个点**，
  // 但**长度必须等于 1.414**（原向量长度），这是「画出来还是那个椭球」的意思
  ok('半轴 b 的长度对上了', !!b && Math.abs(b.length() - Math.SQRT2) < 1e-6, b ? b.length().toFixed(6) : '')
  ok('半轴 c 的长度对上了', !!c && Math.abs(c.length() - 0.5) < 1e-6, c ? c.length().toFixed(6) : '')
  ok('三条半轴两两垂直', !!a && !!b && !!c && Math.abs(a.dot(b)) < 1e-6 && Math.abs(a.dot(c)) < 1e-6 && Math.abs(b.dot(c)) < 1e-6)
}

// ---- 圆柱：几何体的上下两端应该落到给定的两个端点上 ----
{
  const spec: SolidSpec = { kind: 'cylinder', a: [-1, 0, 2], b: [3, 4, -1], radius: 0.8 }
  const [bot, top] = [apply(spec, localAnchors(spec)[0]), apply(spec, localAnchors(spec)[1])]
  // 圆柱没有「哪端是哪端」之分，所以两端各就近匹配一次
  const endA = dist(bot!, spec.a!) + dist(top!, spec.b!)
  const endB = dist(bot!, spec.b!) + dist(top!, spec.a!)
  ok('两端正好落在给定的两个点上', Math.min(endA, endB) < 1e-6, `误差 ${Math.min(endA, endB).toExponential(2)}`)
}

// ---- 圆台：同圆柱，另外两个半径不能弄反 ----
{
  const spec: SolidSpec = { kind: 'frustum', a: [0, 0, 0], b: [0, 2, 0], radiusA: 0.4, radiusB: 1.3 }
  const p = solidPlacement(spec)
  // a=(0,0,0) 端半径 0.4、b=(0,2,0) 端半径 1.3。
  // 局部 +y 那一端落在 b，所以 **top 必须是 radiusB=1.3**。
  // 一开始代码把 radiusA 接到 top 上，圆柱因为两端一样看不出来，是这里把它揪出来的。
  ok('圆台的上下半径没有装反（top 对应 b 端）', p?.params.radiusTop === 1.3 && p?.params.radiusBottom === 0.4, JSON.stringify(p?.params))
}

// ---- 圆锥：**这里是最容易错的地方** ----
{
  // 顶点在 (0,3,0)、底面圆心在 (0,1,0)，高 2。
  // three 的圆锥底面在 −h/2、顶点在 +h/2，所以中心必须落在 (0,2,0)（两端的中点）。
  // 要是错把中心放在底面圆心 (0,1,0)，整个圆锥会**抬高一个高**，看上去就是飘着的。
  const spec: SolidSpec = { kind: 'cone', apex: [0, 3, 0], center: [0, 1, 0], radius: 1 }
  const [bot, top] = [apply(spec, localAnchors(spec)[0]), apply(spec, localAnchors(spec)[1])]
  ok('圆锥的底面圆心落对了', !!bot && dist(bot, [0, 1, 0]) < 1e-9, bot ? `${bot.x},${bot.y},${bot.z}` : '')
  ok('圆锥的顶点落对了', !!top && dist(top, [0, 3, 0]) < 1e-9, top ? `${top.x},${top.y},${top.z}` : '')
}

// ---- 斜着的圆锥（轴不沿 y）：转完之后顶点仍要落在顶点 ----
{
  const spec: SolidSpec = { kind: 'cone', apex: [3, 1, 0], center: [0, 0, 0], radius: 1 }
  const [bot, top] = [apply(spec, localAnchors(spec)[0]), apply(spec, localAnchors(spec)[1])]
  ok('斜圆锥的顶点也落对', !!top && dist(top, [3, 1, 0]) < 1e-9, top ? `${top.x.toFixed(4)},${top.y.toFixed(4)},${top.z.toFixed(4)}` : '')
  ok('斜圆锥的底面圆心也落对', !!bot && dist(bot, [0, 0, 0]) < 1e-9)
}

// ---- 退化的情况：不能崩，也不能画出一个错的 ----
{
  ok('轴两端重合的圆柱不画（返回空）', solidPlacement({ kind: 'cylinder', a: [1, 1, 1], b: [1, 1, 1], radius: 1 }) === null)
  ok('顶点与底面圆心重合的圆锥不画', solidPlacement({ kind: 'cone', apex: [0, 0, 0], center: [0, 0, 0], radius: 1 }) === null)
  ok(
    '半轴与另一条共线的椭球不画（正交化会退化成零向量）',
    solidPlacement({ kind: 'ellipsoid', center: [0, 0, 0], ax: [1, 0, 0], ay: [2, 0, 0], az: [0, 0, 1] }) === null,
  )
}

// ---- localAnchors 与 worldAnchors 必须一一对应 ----
{
  const cases: SolidSpec[] = [
    { kind: 'sphere', center: [0, 0, 0], radius: 1 },
    { kind: 'ellipsoid', center: [0, 0, 0], ax: [1, 0, 0], ay: [0, 1, 0], az: [0, 0, 1] },
    { kind: 'cylinder', a: [0, 0, 0], b: [0, 1, 0], radius: 1 },
    { kind: 'cone', apex: [0, 1, 0], center: [0, 0, 0], radius: 1 },
    { kind: 'frustum', a: [0, 0, 0], b: [0, 1, 0], radiusA: 1, radiusB: 0.5 },
  ]
  const bad = cases.filter((c) => c.kind !== 'sphere' && localAnchors(c).length !== worldAnchors(c).length)
  ok('每个曲面的「局部锚点」与「图上锚点」数量一致', bad.length === 0, bad.map((c) => c.kind).join(','))
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
