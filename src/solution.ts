import type { PointDef } from './solver'
// 带 .ts 后缀：这个模块要被 node 直接导入跑自检，值导入不给后缀会解析不到（类型导入会被剥离，所以那些可以不写）
import { edgeKey, toDisplayName, type Scene } from './scene.ts'
import { normalizeSubscripts } from './text.ts'

/**
 * 解题过程层。
 *
 * 关键约束：**辅助点只能是「算得出来」的点**（中点、分点、平移派生、垂足、射影），
 * 不允许模型在解题步骤里凭空插一个自由点。
 * 因为自由点需要新的约束才能定位，而那是「改题目图形」，不是「画辅助线」——
 * 一旦允许，模型给的辅助线就可能把原图形拽歪，而你还看不出来。
 */

export type AuxPointKind = 'midpoint' | 'ratio' | 'offset' | 'perpFoot' | 'projLine'

export interface Uses {
  points: string[]
  edges: [string, string][]
  faces: string[][]
}

export interface Step {
  title: string
  text: string
  /** 用到的定理或依据，一句话 */
  why: string
  /** 这一步新画出来的辅助点与线段 */
  addPoints: PointDef[]
  addEdges: [string, string][]
  /** 这一步主要用到的已有元素，用来在 3D 里高亮 */
  uses: Uses
}

export interface Solution {
  steps: Step[]
  answers: { label: string; value: string }[]
}

/** 把一串字母切成若干个已知点名，返回所有切法（限制数量，避免病态输入炸开） */
function splitPoints(s: string, known: Set<string>): string[][] {
  const out: string[][] = []
  const walk = (i: number, acc: string[]) => {
    if (out.length > 64) return
    if (i === s.length) {
      out.push([...acc])
      return
    }
    for (let j = i + 1; j <= s.length; j++) {
      const piece = s.slice(i, j)
      if (!known.has(piece)) continue
      acc.push(piece)
      walk(j, acc)
      acc.pop()
    }
  }
  walk(0, [])
  return out
}

export interface ParsedElement {
  point: string | null
  edge: [string, string] | null
  face: string[] | null
}

/**
 * 把 uses 里的一项解析成「一个点」「一条棱」或「一个面」。
 * 模型三种写法都会用：点写 "A"，棱写 "BC" 或 "B1C1"，面写 "ABCD" 或 "ABB1A1"。
 * 点名可能自带下标，所以不能按固定长度切，得把所有切分位置都试一遍。
 */
export function parseElementName(raw: string, known: Set<string>, faces: string[][] = []): ParsedElement | null {
  const s = normalizeSubscripts(raw.trim())
  if (!s) return null
  if (known.has(s)) return { point: s, edge: null, face: null }
  for (let i = 1; i < s.length; i++) {
    const a = s.slice(0, i)
    const b = s.slice(i)
    if (known.has(a) && known.has(b)) return { point: null, edge: [a, b], face: null }
  }
  // 面：切成三个以上点名后，看是否和场景里某个面的顶点集合一致
  for (const combo of splitPoints(s, known)) {
    if (combo.length < 3) continue
    const set = new Set(combo)
    const hit = faces.find((f) => f.length === set.size && f.every((k) => set.has(k)))
    if (hit) return { point: null, edge: null, face: hit }
  }
  return null
}

class SolutionError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const str = (x: unknown, what: string): string => {
  if (typeof x !== 'string' || !x.trim()) throw new SolutionError(`${what} 应该是一个字符串`)
  return x.trim()
}
const arr = (x: unknown, what: string): unknown[] => {
  if (!Array.isArray(x)) throw new SolutionError(`${what} 应该是一个数组`)
  return x
}

/** 辅助点允许的类型 —— 全都是「拿到已知点就能直接算出来」的，不需要再解一次方程 */
const AUX_KINDS: Record<AuxPointKind, number> = {
  midpoint: 2,
  ratio: 2,
  offset: 3,
  perpFoot: 4,
  projLine: 3,
}

const DENY = '辅助线只能画中点、分点、平移、垂足、射影这几种，这一步用了别的画法，我还不会处理。'

export function parseSolution(raw: unknown, scene: Scene): Solution {
  if (!isObj(raw)) throw new SolutionError('解题过程不是一个对象')
  const rawSteps = arr(raw.steps, 'steps')
  if (!rawSteps.length) throw new SolutionError('解题过程是空的')

  const known = new Set(scene.points.map((p) => p.name))
  const steps: Step[] = []

  for (const [i, s] of rawSteps.entries()) {
    if (!isObj(s)) throw new SolutionError(`第 ${i + 1} 步不是一个对象`)
    const title = str(s.title, `第 ${i + 1} 步的 title`)
    const text = str(s.text, `第 ${i + 1} 步的 text`)
    const why = typeof s.why === 'string' ? s.why.trim() : ''

    const addPoints: PointDef[] = []
    for (const raw of arr(s.addPoints ?? [], `第 ${i + 1} 步的辅助点`)) {
      if (!isObj(raw)) throw new SolutionError(`第 ${i + 1} 步的辅助点写错了`)
      // 模型写 A1，场景里存的是 A₁，两边必须先统一成同一种写法
      const name = toDisplayName(str(raw.name, '辅助点的 name'))
      if (known.has(name)) continue // 已经有的点不算新增
      const kind = str(raw.kind, `辅助点 ${name} 的 kind`) as AuxPointKind
      const need = AUX_KINDS[kind]
      if (!need) throw new SolutionError(DENY)
      const of = arr(raw.of, `辅助点 ${name} 的 of`).map((x) => toDisplayName(str(x, '辅助点引用的点')))
      if (of.length !== need) throw new SolutionError(`辅助点 ${name} 的 of 应该有 ${need} 个点`)
      for (const k of of) if (!known.has(k)) throw new SolutionError(`辅助点 ${name} 引用了还不存在的点 ${k}`)
      if (kind === 'midpoint') addPoints.push({ name, kind, of: of as [string, string] })
      else if (kind === 'projLine') addPoints.push({ name, kind, of: of as [string, string, string] })
      else if (kind === 'perpFoot') addPoints.push({ name, kind, of: of as [string, string, string, string] })
      else if (kind === 'offset') addPoints.push({ name, kind, of: of as [string, string, string] })
      else addPoints.push({ name, kind: 'ratio', of: of as [string, string], t: typeof raw.t === 'number' ? raw.t : 0.5 })
      known.add(name)
    }

    const addEdges: [string, string][] = arr(s.addEdges ?? [], `第 ${i + 1} 步的辅助线`).map((e) => {
      const pair = arr(e, `第 ${i + 1} 步的辅助线`).map((x) => toDisplayName(str(x, '线段端点')))
      if (pair.length !== 2) throw new SolutionError(`第 ${i + 1} 步的辅助线需要两个端点`)
      for (const k of pair) if (!known.has(k)) throw new SolutionError(`第 ${i + 1} 步的辅助线引用了不存在的点 ${k}`)
      return pair as [string, string]
    })

    const uses: Uses = { points: [], edges: [], faces: [] }
    for (const raw of arr(s.uses ?? [], `第 ${i + 1} 步的 uses`)) {
      const parsed = parseElementName(str(raw, 'uses 里的元素'), known, scene.faces)
      if (!parsed) throw new SolutionError(`第 ${i + 1} 步用到还不存在的元素 ${String(raw)}`)
      if (parsed.point) uses.points.push(parsed.point)
      if (parsed.edge) uses.edges.push(parsed.edge)
      if (parsed.face) uses.faces.push(parsed.face)
    }

    steps.push({ title, text, why, addPoints, addEdges, uses })
  }

  const answers = arr(raw.answers ?? [], 'answers').map((a, i) => {
    if (!isObj(a)) throw new SolutionError(`第 ${i + 1} 个答案写错了`)
    return { label: str(a.label, '答案的 label'), value: str(a.value, '答案的 value') }
  })

  return { steps, answers }
}

/** 把解题过程里逐步新增的辅助元素并进场景，得到「带辅助线的完整图形」 */
export function mergeSolution(scene: Scene, solution: Solution): Scene {
  const points = [...scene.points]
  const edges = [...scene.edges]
  const seen = new Set(points.map((p) => p.name))
  for (const step of solution.steps) {
    for (const p of step.addPoints) {
      if (seen.has(p.name)) continue
      points.push(p)
      seen.add(p.name)
    }
    for (const e of step.addEdges) if (!edges.some((x) => x[0] === e[0] && x[1] === e[1])) edges.push(e)
  }
  return { points, edges, faces: scene.faces, constraints: scene.constraints }
}

export interface StepPositions {
  /** 每一步执行完之后，场景里已经有哪些点与线段 */
  afterStep: { points: Set<string>; edges: Set<string> }[]
}

/** 算出「走到第 k 步时已经画出了什么」，供动画逐条显示辅助线用 */
export function stepTimeline(scene: Scene, solution: Solution): StepPositions {
  const points = new Set(scene.points.map((p) => p.name))
  const edges = new Set(scene.edges.map(([a, b]) => edgeKey(a, b)))
  const afterStep: StepPositions['afterStep'] = []
  for (const step of solution.steps) {
    for (const p of step.addPoints) points.add(p.name)
    for (const e of step.addEdges) edges.add(edgeKey(e[0], e[1]))
    afterStep.push({ points: new Set(points), edges: new Set(edges) })
  }
  return { afterStep }
}
