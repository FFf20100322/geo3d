// 审计用临时探针：翻折题的答案与初始角度自验
import { parseScene } from '../src/scene.ts'
import { parseSolution, mergeSolution } from '../src/solution.ts'
import { solve } from '../src/solver.ts'
import { FOLD_SCENE, FOLD_SOLUTION, MOVING_PROBLEM } from '../src/demo.ts'

const s = parseScene(FOLD_SCENE)
const sol = parseSolution(FOLD_SOLUTION, s)
const merged = mergeSolution(s, sol)

const norm = (pts: unknown): Record<string, number[]> => {
  const out: Record<string, number[]> = {}
  if (pts instanceof Map) for (const [k, v] of pts as Map<string, number[]>) out[String(k)] = v
  else for (const [k, v] of Object.entries(pts as Record<string, number[]>)) out[k] = v
  return out
}
const dist = (P: Record<string, number[]>, a: string, b: string) =>
  Math.hypot(...P[a].map((x, i) => x - P[b][i]))

const r0 = solve(merged.points, merged.constraints)
const P = norm(r0.points)
console.log('点：', Object.entries(P).map(([k, v]) => `${k}(${v.map((n) => n.toFixed(3)).join(',')})`).join(' '))
console.log('|AB| =', dist(P, 'A', 'B').toFixed(4), '|BC| =', dist(P, 'B', 'C').toFixed(4))
console.log('D2 初始 angle=100 → |AD2| =', dist(P, 'A', 'D2').toFixed(6))
console.log('题面（1）说 90° 时 |AD2| = 2√3 =', (2 * Math.sqrt(3)).toFixed(6))
console.log('但 90° 时实际是 2√2 =', (2 * Math.SQRT2).toFixed(6))

let lo = Infinity
let hi = -Infinity
for (let a = 0; a <= 180; a += 0.5) {
  const pts = merged.points.map((p) => (p.name === 'D2' ? { ...p, angle: a } : p))
  const rr = solve(pts as never, merged.constraints)
  if (!rr.ok) continue
  const Q = norm(rr.points)
  const dd = dist(Q, 'A', 'D2')
  lo = Math.min(lo, dd)
  hi = Math.max(hi, dd)
}
console.log('扫 0..180 度，|AD2| 实际范围 = [', lo.toFixed(4), ',', hi.toFixed(4), ']')
console.log('解答里写的 = [2√2 − 2, 2√2 + 2] = [', (2 * Math.SQRT2 - 2).toFixed(4), ',', (2 * Math.SQRT2 + 2).toFixed(4), ']')
console.log('\nMOVING_PROBLEM:\n' + MOVING_PROBLEM)
