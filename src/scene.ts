import { Vector3 } from 'three'
// 带 .ts 后缀：这个模块要被 node 直接导入跑自检，值导入不给后缀会解析不到
import { isMoving, type Constraint, type PointDef, type Vec3 } from './solver.ts'

/**
 * 场景层：把模型返回的 json 解析成求解器能吃的结构，再转成渲染能用的结构。
 * 这一层是纯函数，能在 node 里直接跑，所以不靠截图也能验证。
 *
 * 一条硬规矩：遇到不认识的东西就报错，绝不猜。
 * 猜错一个约束 = 给你一张看着正常、其实错的图，那比说「我不会」糟糕得多。
 */

/**
 * 曲面立体：球、椭球、圆柱、圆锥、圆台。
 *
 * **棱柱、棱锥、棱台不用在这里** —— 它们用「点 + 面」就能完整表达（面是平面多边形），
 * 现有架构本来就支持。这里只补那些**有曲面**的：曲面没法用几个平面多边形拼出来。
 *
 * 每个都以图上的点为依据（圆心、轴上两点、母线端点），所以它们会跟着动点一起变 ——
 * 与整个「模型只给关系、坐标本地算」的路子一致。
 */
export type SolidDef =
  /** 球：球心 + 球面上一个点（半径由这两点定，不直接给数） */
  | { kind: 'sphere'; center: string; through: string }
  /** 椭球：球心 + 三条半轴各一个端点 */
  | { kind: 'ellipsoid'; center: string; a: string; b: string; c: string }
  /** 圆柱：轴的两个端点 + 半径 */
  | { kind: 'cylinder'; a: string; b: string; radius: number }
  /** 圆锥：顶点 + 底面圆心 + 底面圆上一点（半径由后两点定） */
  | { kind: 'cone'; apex: string; center: string; rim: string }
  /** 圆台：轴的两个端点 + 两端半径 */
  | { kind: 'frustum'; a: string; b: string; radiusA: number; radiusB: number }

/** 曲面立体的种类名，解析时用它校验，也用来生成「这个图形里有球」这类说明 */
export const SOLID_KINDS = ['sphere', 'ellipsoid', 'cylinder', 'cone', 'frustum'] as const

export interface Scene {
  points: PointDef[]
  edges: [string, string][]
  faces: string[][]
  constraints: Constraint[]
  /** 曲面立体（球、椭球、圆柱、圆锥、圆台）。棱柱棱锥用点与面表达，不写在这里。 */
  solids?: SolidDef[]
  /**
   * **只用来算、不在图上出现的点**。
   *
   * 翻折题就是典型：D 是「折之前的位置」，`onArc` 要靠它算出折起来之后的 D₂ ——
   * 但它本身不该出现在图上（既不是折完图形的顶点，也没有棱连着它）。
   * 一开始靠「不把它放进 edges/faces」来达到这个效果，可行但不够 ——
   * **点的名字是常驻的**，于是图上会孤零零挂一个 D，看着像少画了什么。
   */
  hiddenPoints?: string[]
  /**
   * **某一问独有的条件**（题面里「若…」那一类）。
   *
   * 为什么需要它：一道题常写成「点 E 是棱 PB 上的动点。（1）…（2）若 E 是 PB 的中点，求…」。
   * 第（2）问的「若」只对第（2）问成立 —— 看第（1）问时 E 还得是动点。
   * 要是把这些条件并进主场景，第（1）问的图就是错的（E 被钉死了），
   * 而且这种错**看起来跟对的图一模一样**，最难发现。
   *
   * 所以按问分开存：这一问生效时，用这里的点定义**替换**同名的、约束**追加**进去。
   * 没选问、或选了别的问时这些一概不生效 —— 从数据上就不可能串问。
   */
  variants?: {
    /** 属于哪一问（'1'、'2'…） */
    q: string
    /** 同名点会被替换掉（例如把动点 E 换成中点 E） */
    points?: PointDef[]
    /** 追加的约束 */
    constraints?: Constraint[]
    /** 这一问才画出来的棱与面 */
    edges?: [string, string][]
    faces?: string[][]
  }[]
}

/**
 * 取出「按某一问看过来的场景」。
 *
 * 不选问（q 为空）就原样返回 —— 那时整道题一起看，所有条件都算数。
 * 选了几问，就只并进这一问的专属条件，并且把**别的问专属的点**剔掉。
 */
export function sceneForQuestion(scene: Scene, q: string): Scene {
  const variants = scene.variants ?? []
  const mine = q ? variants.filter((v) => v.q === q) : []
  const foreign = q
    ? new Set(
        variants
          .filter((v) => v.q !== q)
          .flatMap((v) => (v.points ?? []).map((p) => p.name))
          .filter((n) => !scene.points.some((p) => p.name === n)),
      )
    : new Set<string>()
  if (!mine.length && !foreign.size) return scene

  const replaced = new Map<string, PointDef>()
  for (const v of mine) for (const p of v.points ?? []) replaced.set(p.name, p)
  const points = scene.points.filter((p) => !foreign.has(p.name)).map((p) => replaced.get(p.name) ?? p)
  for (const [name, def] of replaced) if (!points.some((p) => p.name === name)) points.push(def)

  const seen = new Set(scene.edges.map((e) => [...e].sort().join('|')))
  const edges = [...scene.edges]
  for (const v of mine)
    for (const e of v.edges ?? []) {
      const k = [...e].sort().join('|')
      if (seen.has(k)) continue
      seen.add(k)
      edges.push(e)
    }
  const faceSeen = new Set(scene.faces.map((f) => [...f].sort().join('|')))
  const faces = [...scene.faces]
  for (const v of mine)
    for (const f of v.faces ?? []) {
      const k = [...f].sort().join('|')
      if (faceSeen.has(k)) continue
      faceSeen.add(k)
      faces.push(f)
    }

  return {
    ...scene,
    points,
    edges,
    faces,
    constraints: [...scene.constraints, ...mine.flatMap((v) => v.constraints ?? [])],
  }
}

const SUB_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

/** A1 → A₁。模型按约定输出 ASCII 名称，显示与内部统一用下标写法。 */
export function toDisplayName(name: string): string {
  const m = /^([A-Za-z]+?)_?(\d+)$/.exec(name.trim())
  if (!m) return name.trim()
  return m[1] + [...m[2]].map((d) => SUB_DIGITS[+d]).join('')
}

const POINT_KINDS = [
  'free',
  'midpoint',
  'ratio',
  'offset',
  'perpFoot',
  'projLine',
  'onSegment',
  'inFace',
  'onArc',
] as const
const CONSTRAINT_KINDS = [
  'distance',
  'equalDistance',
  'angle',
  'lineAngle',
  'perpendicular',
  'parallel',
  'perpLinePlane',
  'coplanar',
] as const

class SceneError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const str = (x: unknown, what: string): string => {
  if (typeof x !== 'string' || !x.trim()) throw new SceneError(`${what} 应该是一个字符串`)
  return x.trim()
}
const num = (x: unknown, what: string): number => {
  const n = typeof x === 'string' ? Number(x) : x
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new SceneError(`${what} 应该是一个数字`)
  return n
}
const arr = (x: unknown, what: string): unknown[] => {
  if (!Array.isArray(x)) throw new SceneError(`${what} 应该是一个数组`)
  return x
}

/** 解析并校验模型返回的场景。任何不认识的东西都会抛错，由调用方决定是重试还是如实告知失败。 */
export function parseScene(raw: unknown): Scene {
  if (!isObj(raw)) throw new SceneError('场景不是一个对象')

  const rawPoints = arr(raw.points, 'points')
  if (rawPoints.length < 3) throw new SceneError('点太少，构不成一个立体图形')

  const points: PointDef[] = []
  const known = new Set<string>()
  for (const p of rawPoints) {
    if (!isObj(p)) throw new SceneError('points 里有一项不是对象')
    const name = toDisplayName(str(p.name, '点的 name'))
    if (known.has(name)) throw new SceneError(`点 ${name} 重复定义了`)
    known.add(name)
    const kind = str(p.kind, `点 ${name} 的 kind`)
    if (!(POINT_KINDS as readonly string[]).includes(kind)) {
      throw new SceneError(`点 ${name} 的类型「${kind}」我还不会处理`)
    }
    if (kind === 'free') {
      const at = p.at === undefined ? undefined : (arr(p.at, `点 ${name} 的 at`).map((x) => num(x, '坐标')) as Vec3)
      if (at && at.length !== 3) throw new SceneError(`点 ${name} 的坐标应该是三个数`)
      points.push({ name, kind: 'free', at })
    } else if (kind === 'midpoint' || kind === 'ratio' || kind === 'onSegment') {
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== 2) throw new SceneError(`点 ${name} 的 of 应该是两个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      if (kind === 'midpoint') points.push({ name, kind: 'midpoint', of: of as [string, string] })
      else if (kind === 'onSegment')
        points.push({ name, kind: 'onSegment', of: of as [string, string], t: num(p.t ?? 0.5, `点 ${name} 的 t`) })
      else points.push({ name, kind: 'ratio', of: of as [string, string], t: num(p.t ?? 0.5, `点 ${name} 的 t`) })
    } else if (kind === 'inFace') {
      const face = arr(p.face, `点 ${name} 的 face`).map((x) => toDisplayName(str(x, '点名称')))
      if (face.length < 3 || face.length > 4) throw new SceneError(`点 ${name} 所在的面需要三到四个顶点`)
      for (const k of face) if (!known.has(k)) throw new SceneError(`点 ${name} 引用的面里有还没定义的点 ${k}`)
      points.push({
        name,
        kind: 'inFace',
        face,
        u: num(p.u ?? 0.5, `点 ${name} 的 u`),
        v: num(p.v ?? 0.5, `点 ${name} 的 v`),
      })
    } else if (kind === 'onArc') {
      // 翻折题的动点：绕一条棱旋转。of 是棱的两个端点，from 是旋转前的那个点。
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== 2) throw new SceneError(`点 ${name} 的 of 应该是旋转轴的两个端点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      const from = toDisplayName(str(p.from, `点 ${name} 的 from`))
      if (!known.has(from)) throw new SceneError(`点 ${name} 引用了还没定义的 ${from}`)
      points.push({
        name,
        kind: 'onArc',
        of: of as [string, string],
        from,
        angle: num(p.angle ?? 0, `点 ${name} 的 angle`),
      })
    } else if (kind === 'perpFoot' || kind === 'projLine') {
      const want = kind === 'perpFoot' ? 4 : 3
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== want) throw new SceneError(`点 ${name} 的 of 应该有 ${want} 个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      if (kind === 'perpFoot')
        points.push({ name, kind: 'perpFoot', of: of as [string, string, string, string] })
      else points.push({ name, kind: 'projLine', of: of as [string, string, string] })
    } else {
      const of = arr(p.of, `点 ${name} 的 of`).map((x) => toDisplayName(str(x, '点名称')))
      if (of.length !== 3) throw new SceneError(`点 ${name} 的平移派生需要三个点`)
      for (const k of of) if (!known.has(k)) throw new SceneError(`点 ${name} 引用了还没定义的 ${k}`)
      points.push({ name, kind: 'offset', of: of as [string, string, string] })
    }
  }

  const ref = (x: unknown, what: string): string => {
    const name = toDisplayName(str(x, what))
    if (!known.has(name)) throw new SceneError(`${what} 引用了不存在的点 ${name}`)
    return name
  }

  const edges: [string, string][] = arr(raw.edges ?? [], 'edges').map((e, i) => {
    const pair = arr(e, `第 ${i + 1} 条棱`).map((x) => ref(x, `第 ${i + 1} 条棱`))
    if (pair.length !== 2 || pair[0] === pair[1]) throw new SceneError(`第 ${i + 1} 条棱的端点不对`)
    return pair as [string, string]
  })

  const faces: string[][] = arr(raw.faces ?? [], 'faces').map((f, i) => {
    const ring = arr(f, `第 ${i + 1} 个面`).map((x) => ref(x, `第 ${i + 1} 个面`))
    if (ring.length < 3) throw new SceneError(`第 ${i + 1} 个面少于三个顶点`)
    return ring
  })

  const constraints: Constraint[] = arr(raw.constraints, 'constraints').map((c, i) => {
    if (!isObj(c)) throw new SceneError(`第 ${i + 1} 条约束不是对象`)
    const kind = str(c.kind, `第 ${i + 1} 条约束的 kind`)
    if (!(CONSTRAINT_KINDS as readonly string[]).includes(kind)) {
      throw new SceneError(`这道题用到了我还不会处理的条件「${kind}」`)
    }
    switch (kind) {
      case 'distance':
        return { kind, a: ref(c.a, 'distance'), b: ref(c.b, 'distance'), value: num(c.value, 'distance 的 value') }
      case 'equalDistance': {
        const ab = arr(c.ab, 'equalDistance.ab').map((x) => ref(x, 'equalDistance'))
        const cd = arr(c.cd, 'equalDistance.cd').map((x) => ref(x, 'equalDistance'))
        if (ab.length !== 2 || cd.length !== 2) throw new SceneError('equalDistance 需要两对点')
        return { kind, ab: ab as [string, string], cd: cd as [string, string] }
      }
      case 'angle':
        return {
          kind,
          at: ref(c.at, 'angle'),
          from: ref(c.from, 'angle'),
          to: ref(c.to, 'angle'),
          value: num(c.value, 'angle 的 value'),
        }
      case 'lineAngle': {
        const p = arr(c.p, 'lineAngle.p').map((x) => ref(x, 'lineAngle'))
        const q = arr(c.q, 'lineAngle.q').map((x) => ref(x, 'lineAngle'))
        if (p.length !== 2 || q.length !== 2) throw new SceneError('lineAngle 需要两条直线')
        return { kind, p: p as [string, string], q: q as [string, string], value: num(c.value, 'lineAngle 的 value') }
      }
      case 'perpendicular':
      case 'parallel': {
        const p = arr(c.p, `${kind}.p`).map((x) => ref(x, kind))
        const q = arr(c.q, `${kind}.q`).map((x) => ref(x, kind))
        if (p.length !== 2 || q.length !== 2) throw new SceneError(`${kind} 需要两条直线`)
        return { kind, p: p as [string, string], q: q as [string, string] }
      }
      case 'perpLinePlane': {
        const line = arr(c.line, 'perpLinePlane.line').map((x) => ref(x, 'perpLinePlane'))
        const plane = arr(c.plane, 'perpLinePlane.plane').map((x) => ref(x, 'perpLinePlane'))
        if (line.length !== 2 || plane.length !== 3) throw new SceneError('perpLinePlane 需要一条直线与三个平面点')
        return { kind, line: line as [string, string], plane: plane as [string, string, string] }
      }
      case 'coplanar': {
        const pts = arr(c.pts, 'coplanar.pts').map((x) => ref(x, 'coplanar'))
        if (pts.length !== 4) throw new SceneError('coplanar 需要四个点')
        return { kind, pts: pts as [string, string, string, string] }
      }
    }
    throw new SceneError(`第 ${i + 1} 条约束没法处理`)
  })

  if (constraints.length === 0) throw new SceneError('一条约束都没有，图形没法确定')

  // 某一问独有的条件（「若」那一类）。写法与主场景一致，只是包在 variants 里。
  // 引用的点允许是主场景里的，也允许是这一问自己新加的。
  const rawVariants = raw.variants === undefined ? [] : arr(raw.variants, 'variants')
  const variants: Scene['variants'] = []
  for (const [i, v] of rawVariants.entries()) {
    if (!isObj(v)) throw new SceneError(`第 ${i + 1} 个 variants 不是对象`)
    const q = String(v.q ?? '').trim()
    if (!q) throw new SceneError(`第 ${i + 1} 个 variants 没写属于哪一问（q）`)
    const vp: PointDef[] = []
    if (v.points !== undefined) {
      for (const p of arr(v.points, `第 ${i + 1} 个 variants 的 points`)) {
        if (!isObj(p)) throw new SceneError(`第 ${i + 1} 个 variants 的点不是对象`)
        const name = toDisplayName(str(p.name, 'variants 里的点 name'))
        const kind = str(p.kind, 'variants 里的点 kind')
        // **种类必须在白名单里。** 原来这一句没有，是审计实测出来的洞：
        // 变体里写个不存在的 kind，求解器那边的 switch 不认、又正好没有 default，
        // 于是一个残差都不产生 —— 图看着正常、条件是假的，谁都发现不了。
        if (!(POINT_KINDS as readonly string[]).includes(kind)) {
          throw new SceneError(`第 ${i + 1} 个 variants 里的点 ${name} 种类不认识：${kind}`)
        }
        // **引用的点名要跟主场景一样归一化。** 原来只归一化了 name，
        // of/from/face 里的名字原样拷 —— 写 `of:['A1','B1']` 会带着 'A1' 进求解器，
        // 求解器只认 'A₁'，于是抛一句没有上下文的「引用了不存在的点 A1」。
        const fix = (x: unknown): string => toDisplayName(str(x, 'variants 里的点名称'))
        const fixed: Record<string, unknown> = { ...(p as Record<string, unknown>), name, kind }
        for (const key of ['of', 'face'] as const) {
          if (Array.isArray(fixed[key])) fixed[key] = (fixed[key] as unknown[]).map(fix)
        }
        if (typeof fixed.from === 'string') fixed.from = fix(fixed.from)
        vp.push(fixed as unknown as PointDef)
      }
    }
    const vc = v.constraints === undefined ? [] : arr(v.constraints, `第 ${i + 1} 个 variants 的 constraints`)
    // **约束种类也要在名单里。** 这是审计抓到的同一个洞的另一半：
    // `as Constraint[]` 把没校验过的东西整包塞进强类型，拼错一个 kind
    // 就等于那条条件不存在（实测：题面要 60°、实际 90°，没有任何地方报错）。
    for (const c of vc) {
      if (!isObj(c)) throw new SceneError(`第 ${i + 1} 个 variants 的约束不是对象`)
      const ck = str(c.kind, 'variants 里的约束 kind')
      if (!(CONSTRAINT_KINDS as readonly string[]).includes(ck)) {
        throw new SceneError(`第 ${i + 1} 个 variants 里有个不认识的约束：${ck}`)
      }
    }
    const ve = v.edges === undefined ? [] : arr(v.edges, `第 ${i + 1} 个 variants 的 edges`)
    const vf = v.faces === undefined ? [] : arr(v.faces, `第 ${i + 1} 个 variants 的 faces`)
    variants.push({
      q,
      points: vp,
      constraints: vc as Constraint[],
      edges: ve.map((e) => {
        const pair = arr(e, 'variants 的棱').map((x) => toDisplayName(str(x, '棱的端点')))
        if (pair.length !== 2) throw new SceneError('variants 的棱必须是两个点')
        return pair as [string, string]
      }),
      faces: vf.map((f) => arr(f, 'variants 的面').map((x) => toDisplayName(str(x, '面的顶点')))),
    })
  }

  // 曲面立体：球、椭球、圆柱、圆锥、圆台。
  // 引用的点必须已经在上面定义过 —— 写错要当场报出来，
  // 不然它会在渲染层悄悄画不出来，那种「图里少了一块」最难查。
  const solids: SolidDef[] = []
  for (const [i, s] of (raw.solids === undefined ? [] : arr(raw.solids, 'solids')).entries()) {
    if (!isObj(s)) throw new SceneError(`第 ${i + 1} 个 solids 不是对象`)
    const kind = str(s.kind, `第 ${i + 1} 个 solids 的 kind`)
    const ref = (x: unknown, what: string) => {
      const n = toDisplayName(str(x, what))
      if (!known.has(n)) throw new SceneError(`${what} 引用了还没定义的点 ${n}`)
      return n
    }
    const rad = (x: unknown, what: string) => {
      const v = num(x, what)
      if (!(v > 0)) throw new SceneError(`${what} 必须是正数`)
      return v
    }
    if (kind === 'sphere') solids.push({ kind, center: ref(s.center, `第 ${i + 1} 个球的球心`), through: ref(s.through, `第 ${i + 1} 个球面上的点`) })
    else if (kind === 'ellipsoid')
      solids.push({
        kind,
        center: ref(s.center, `第 ${i + 1} 个椭球的中心`),
        a: ref(s.a, '椭球 a 半轴端点'),
        b: ref(s.b, '椭球 b 半轴端点'),
        c: ref(s.c, '椭球 c 半轴端点'),
      })
    else if (kind === 'cylinder')
      solids.push({
        kind,
        a: ref(s.a, '圆柱轴的一个端点'),
        b: ref(s.b, '圆柱轴的另一个端点'),
        radius: rad(s.radius, '圆柱半径'),
      })
    else if (kind === 'cone')
      solids.push({
        kind,
        apex: ref(s.apex, '圆锥顶点'),
        center: ref(s.center, '圆锥底面圆心'),
        rim: ref(s.rim, '圆锥底面圆上一点'),
      })
    else if (kind === 'frustum')
      solids.push({
        kind,
        a: ref(s.a, '圆台轴的一个端点'),
        b: ref(s.b, '圆台轴的另一个端点'),
        radiusA: rad(s.radiusA, '圆台一端的半径'),
        radiusB: rad(s.radiusB, '圆台另一端的半径'),
      })
    else throw new SceneError(`不认识的立体种类 ${kind}（只支持 ${SOLID_KINDS.join('、')}）`)
  }

  // 只用来算、不在图上出现的点（翻折题里「折之前的位置」那种）。
  // 名字写错要当场报 —— 不然它会静默失配，那个点还是照常显示出来。
  const hiddenPoints =
    raw.hiddenPoints === undefined
      ? []
      : arr(raw.hiddenPoints, 'hiddenPoints').map((x) => toDisplayName(str(x, 'hiddenPoints 里的点')))
  for (const n of hiddenPoints) if (!known.has(n)) throw new SceneError(`hiddenPoints 里的 ${n} 在图上的点里找不到`)

  const extra = hiddenPoints.length ? { hiddenPoints } : {}
  const out: Scene = solids.length
    ? { points, edges, faces, constraints, solids, ...extra }
    : { points, edges, faces, constraints, ...extra }
  return variants.length ? { ...out, variants } : out
}

/** 棱的唯一标识。动画要按步骤逐条显示，所以每条棱都得能单独认出来。 */
export const edgeKey = (a: string, b: string) => `${a}|${b}`

export interface RVertex {
  name: string
  at: Vec3
  /** 辅助点（解题过程中才画出来的），不是题面原有的 */
  aux: boolean
  /** 动点：位置由拖动决定 */
  moving: boolean
  /** 只用来算、不在图上画出来（名字也不显示） */
  hidden?: boolean
}

export interface REdge {
  key: string
  a: Vec3
  b: Vec3
  aux: boolean
}

export interface RFace {
  /** 面名（顶点按顺序拼起来），用来支持「高亮某个面」 */
  key: string
  pts: Vec3[]
  /** 顶点名。渲染层靠它判断这个面要不要跟着某次拖动重算（由动点张成的面必须实时跟着动） */
  names: string[]
  color: number
}

export interface Renderable {
  vertices: RVertex[]
  edges: REdge[]
  faces: RFace[]
  /**
   * 曲面立体。**已经换算成具体几何参数**（球心 + 半径这种），
   * 不再引用点名 —— 渲染层不该知道「球心是哪个点」。
   */
  solids?: {
    kind: 'sphere' | 'ellipsoid' | 'cylinder' | 'cone' | 'frustum'
    center?: Vec3
    radius?: number
    a?: Vec3
    b?: Vec3
    apex?: Vec3
    radiusA?: number
    radiusB?: number
    /** 椭球的三条半轴：长度 ra/rb/rc，各自的方向 ax/ay/az */
    ax?: Vec3
    ay?: Vec3
    az?: Vec3
    ra?: number
    rb?: number
    rc?: number
  }[]
}

/**
 * 三个坐标平面上的**正方形网格**的线段。
 *
 * 用户要求：坐标法时，每两个坐标轴构成的平面（一共三个）都铺一层**淡灰色**的网格，
 * 格子边长 **1 个单位**，网格的范围**与坐标轴一样长**，**轴到头就不再画**。
 *
 * 为什么要有它：只画三条轴，图上看不出「1 个单位有多长」——
 * 点 A(0,0,2) 里那个 2 到底有多远，全凭想象。有了格子，一眼就能数出来。
 *
 * 轴的长度一般不是整数个单位（现在是 1.25 个单位），所以最外圈会剩一小条 ——
 * 这是**照要求做的**：范围与轴一样长、格子是 1 个单位，两者凑不整时只能这样。
 *
 * 返回线段列表（每条两端），交给渲染层去画。
 */
export function gridLines(origin: Vec3, axes: [Vec3, Vec3, Vec3], extent: number): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = []
  // 轴长为 0 或负数时**一条都不画**。
  // （自检抓过：不加这一句的话，退出循环前的 i=0 会留下一地零长度的退化线段 ——
  //   渲染层画它们什么也看不见，但白白占着内存，而且让「有多少条格线」这个数变得没法用。）
  if (!(extent > 1e-6)) return out
  // 在某个平面上取一个点：u 沿第一条方向、v 沿第二条方向
  const at = (plane: number, s: number, t: number): Vec3 => {
    const [i, j] = plane === 0 ? [0, 1] : plane === 1 ? [1, 2] : [2, 0]
    const a = axes[i]
    const b = axes[j]
    return [origin[0] + a[0] * s + b[0] * t, origin[1] + a[1] * s + b[1] * t, origin[2] + a[2] * s + b[2] * t]
  }
  const n = Math.max(0, Math.floor(extent))
  for (let plane = 0; plane < 3; plane++) {
    // 整数位置的格线：0、1、…、n
    for (let i = 0; i <= n; i++) {
      out.push([at(plane, i, 0), at(plane, i, extent)]) // 沿第二条方向
      out.push([at(plane, 0, i), at(plane, extent, i)]) // 沿第一条方向
    }
    // 轴到头那一条边（范围与轴一样长，所以最外圈要封上）
    if (extent - n > 1e-6) {
      out.push([at(plane, extent, 0), at(plane, extent, extent)])
      out.push([at(plane, 0, extent), at(plane, extent, extent)])
    }
  }
  return out
}

/** 每个共面一个颜色，循环取用 */
const PALETTE = [0x4f8cff, 0xff9f43, 0x2ecc71, 0xe74c3c, 0x9b59b6, 0xf1c40f, 0x1abc9c, 0xff7ab8]

/** 面名：顶点按顺序拼起来，是识别「高亮哪个面」的依据 */
export const faceKey = (pts: string[]) => pts.join('')

/**
 * 转成渲染能用的结构。
 * base 传入「不含辅助线的原场景」时，能算出哪些点与棱是辅助元素 —— 动画要靠这个逐条显示。
 */
export function toRenderable(scene: Scene, solved: Record<string, Vec3>, base?: Scene): Renderable {
  const at = (name: string): Vec3 => {
    const p = solved[name]
    if (!p) throw new SceneError(`求解结果里缺少点 ${name}`)
    return p
  }
  const basePoints = new Set((base ?? scene).points.map((p) => p.name))
  const baseEdges = new Set((base ?? scene).edges.map(([a, b]) => edgeKey(a, b)))
  const hiddenSet = new Set((base ?? scene).hiddenPoints ?? scene.hiddenPoints ?? [])

  return {
    vertices: scene.points.map((p) => ({
      name: p.name,
      at: at(p.name),
      aux: base ? !basePoints.has(p.name) : false,
      moving: isMoving(p),
      hidden: hiddenSet.has(p.name),
    })),
    edges: scene.edges.map(([a, b]) => ({
      key: edgeKey(a, b),
      a: at(a),
      b: at(b),
      aux: base ? !baseEdges.has(edgeKey(a, b)) : false,
    })),
    // names 是顶点名，渲染层要靠它判断「这个面该不该跟着这次拖动重算」——
    // 由动点张成的面必须能实时跟着动，只有坐标没有名字就认不出是谁在动
    faces: scene.faces.map((ring, i) => ({
      key: faceKey(ring),
      pts: ring.map(at),
      names: [...ring],
      color: PALETTE[i % PALETTE.length],
    })),
    // 曲面立体：把它们**换算成具体的几何参数**再交给渲染层。
    // 渲染层不该知道「球心是哪个点」这种事 —— 那是场景层的事；
    // 它只需要「一个球心在这里、半径这么大」。
    solids: (scene.solids ?? []).map((s) => {
      const d3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      if (s.kind === 'sphere') {
        return { kind: 'sphere' as const, center: at(s.center), radius: d3(at(s.center), at(s.through)) }
      }
      if (s.kind === 'ellipsoid') {
        const c = at(s.center)
        return {
          kind: 'ellipsoid' as const,
          center: c,
          ra: Math.max(1e-6, d3(c, at(s.a))),
          rb: Math.max(1e-6, d3(c, at(s.b))),
          rc: Math.max(1e-6, d3(c, at(s.c))),
          ax: at(s.a),
          ay: at(s.b),
          az: at(s.c),
        }
      }
      if (s.kind === 'cylinder') return { kind: 'cylinder' as const, a: at(s.a), b: at(s.b), radius: s.radius }
      if (s.kind === 'cone') return { kind: 'cone' as const, apex: at(s.apex), center: at(s.center), radius: d3(at(s.center), at(s.rim)) }
      return { kind: 'frustum' as const, a: at(s.a), b: at(s.b), radiusA: s.radiusA, radiusB: s.radiusB }
    }),
  }
}

/**
 * 渲染前把把关：面必须真的共面。
 * 模型就算约束都写对了，也可能把不属于同一个面的点连成一个面 —— 那种面画出来是扭的，
 * 肉眼很难分辨，但一眼看上去就是「怪怪的」。这里直接算出来。
 */
export function checkFacesPlanar(r: Renderable, tol = 1e-3): string[] {
  const bad: string[] = []
  for (const f of r.faces) {
    if (f.pts.length < 3) continue
    const p = f.pts.map((q) => new Vector3(...q))
    const n = new Vector3().subVectors(p[1], p[0]).cross(new Vector3().subVectors(p[2], p[0]))
    if (n.length() < 1e-9) {
      bad.push('有个面的前三个点共线，构不成平面')
      continue
    }
    n.normalize()
    for (let i = 3; i < p.length; i++) {
      const d = Math.abs(new Vector3().subVectors(p[i], p[0]).dot(n))
      if (d > tol) bad.push(`有个面的第 ${i + 1} 个顶点偏离该平面 ${d.toFixed(4)}，说明这个面是扭的`)
    }
  }
  return bad
}
