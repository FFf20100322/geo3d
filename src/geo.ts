import { Vector3 } from 'three'

/**
 * 场景数据层：只描述「点、棱、共面」，不含任何渲染代码。
 * 拆出来的目的是让自检可以在 node 里直接跑（`pnpm selfcheck`），不必开浏览器。
 */

const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
export const sub = (n: number) => String(n).split('').map((d) => SUB[+d]).join('')

export const A1 = 'A' + sub(1)
export const B1 = 'B' + sub(1)
export const C1 = 'C' + sub(1)
export const D1 = 'D' + sub(1)

/** 棱长为 1 的正方体，底面 ABCD，顶面 A₁B₁C₁D₁ */
export const VERTICES: Record<string, [number, number, number]> = {
  A: [0, 0, 0], B: [1, 0, 0], C: [1, 0, 1], D: [0, 0, 1],
  [A1]: [0, 1, 0], [B1]: [1, 1, 0], [C1]: [1, 1, 1], [D1]: [0, 1, 1],
}

export const EDGES: [string, string][] = [
  ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
  [A1, B1], [B1, C1], [C1, D1], [D1, A1],
  ['A', A1], ['B', B1], ['C', C1], ['D', D1],
]

export interface Face {
  name: string
  pts: string[]
  color: number
}

/** 每一个共面一个独立颜色 */
export const FACES: Face[] = [
  { name: 'ABCD', pts: ['A', 'B', 'C', 'D'], color: 0x4f8cff },
  { name: `${A1}${B1}${C1}${D1}`, pts: [A1, B1, C1, D1], color: 0xff9f43 },
  { name: `AB${B1}${A1}`, pts: ['A', 'B', B1, A1], color: 0x2ecc71 },
  { name: `BC${C1}${B1}`, pts: ['B', 'C', C1, B1], color: 0xe74c3c },
  { name: `CD${D1}${C1}`, pts: ['C', 'D', D1, C1], color: 0x9b59b6 },
  { name: `DA${A1}${D1}`, pts: ['D', 'A', A1, D1], color: 0xf1c40f },
]

export const center = (): Vector3 => {
  const keys = Object.keys(VERTICES)
  const c = new Vector3()
  for (const k of keys) c.add(new Vector3(...VERTICES[k]))
  return c.divideScalar(keys.length)
}

/**
 * 自检：面必须共面、每条棱必须恰好属于两个面。
 * 场景数据写错时应当当场失败，而不是渲染出一个看着正常、其实歪掉的图。
 */
export function selfCheck(): void {
  const c = center()
  for (const f of FACES) {
    if (f.pts.length < 3) throw new Error(`面 ${f.name} 少于三个点`)
    for (const k of f.pts) {
      if (!(k in VERTICES)) throw new Error(`面 ${f.name} 引用了不存在的点 ${k}`)
    }
    const p = f.pts.map((k) => new Vector3(...VERTICES[k]).sub(c))
    const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0])).normalize()
    for (let i = 3; i < p.length; i++) {
      const d = Math.abs(new Vector3().subVectors(p[i], p[0]).dot(n))
      if (d > 1e-9) throw new Error(`面 ${f.name} 不共面，偏差 ${d}`)
    }
  }

  const key = (a: string, b: string) => [a, b].sort().join('-')
  const used = new Map<string, number>()
  for (const f of FACES) {
    for (let i = 0; i < f.pts.length; i++) {
      const k = key(f.pts[i], f.pts[(i + 1) % f.pts.length])
      used.set(k, (used.get(k) ?? 0) + 1)
    }
  }
  for (const [a, b] of EDGES) {
    if (!(a in VERTICES) || !(b in VERTICES)) throw new Error(`棱 ${a}${b} 引用了不存在的点`)
    const n = used.get(key(a, b)) ?? 0
    if (n !== 2) throw new Error(`棱 ${a}${b} 应属于两个面，实际 ${n} 个`)
  }
  for (const [k, n] of used) {
    if (n !== 2) throw new Error(`面与面接缝 ${k} 被 ${n} 个面共用，应为 2 个`)
  }
}
