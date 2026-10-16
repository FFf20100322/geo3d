/**
 * 【临时测试】这个文件是**用完就删**的，不进本地备份、也不该长期留在仓库里。
 *
 * 目的：把「代码写完但真机没看过」的那几项一次性验掉。
 * 每一项都只给题目文字或场景数据，不写解答 —— 要看的只是**图画得对不对**。
 *
 * 对应要验的五笔欠账：
 * 1. 曲面立体（球、椭球、圆柱、圆锥、圆台）的线框 —— T1
 * 2. B2 的换问重建图形 —— T2
 * 3. 真实题目上切换三种解法、拖动时箭头实时更新 —— 用 T2 的题就能试
 * 4. 翻折的折纸效果 —— 用内置的翻折题（不在这里）
 * 5. 建系理由写在步骤里 —— 要联网解题，不在这里
 */

/**
 * T1：曲面立体。
 * 一个球、一个椭球、一个圆柱、一个圆锥、一个圆台，排成一排。
 * 它们的共同点是**都没法用平面多边形拼出来** —— 这正是这一轮补的东西。
 *
 * 点的名字故意不按 ABC 来（用户提过：别每次都同一套），免得和别的题混淆。
 */
export const T1_PROBLEM = '【临时测试】曲面立体：球、椭球、圆柱、圆锥、圆台各一个。'
export const T1_SCENE = {
  points: [
    // 球：球心 P，球面上一点 Q
    { name: 'P', kind: 'free', at: [-6, 0, 0] },
    { name: 'Q', kind: 'free', at: [-4.5, 0, 0] },
    // 椭球：中心 U，三条半轴端点 V、W、X（长度 2.2、1.2、0.7，明显不相等才看得出是椭球）
    { name: 'U', kind: 'free', at: [-2, 0, 0] },
    { name: 'V', kind: 'free', at: [0.2, 0, 0] },
    { name: 'W', kind: 'free', at: [-2, 1.2, 0] },
    { name: 'X', kind: 'free', at: [-2, 0, 0.7] },
    // 圆柱：轴的两个端点 G、H
    { name: 'G', kind: 'free', at: [2, -1, 0] },
    { name: 'H', kind: 'free', at: [2, 1, 0] },
    // 圆锥：顶点 M，底面圆心 N，底面圆上一点 K
    { name: 'M', kind: 'free', at: [5.5, 1, 0] },
    { name: 'N', kind: 'free', at: [5.5, -1, 0] },
    { name: 'K', kind: 'free', at: [6.5, -1, 0] },
    // 圆台：轴的两个端点 S、T
    { name: 'S', kind: 'free', at: [9, -1, 0] },
    { name: 'T', kind: 'free', at: [9, 1, 0] },
  ],
  constraints: [
    { kind: 'distance', a: 'P', b: 'Q', value: 1.5 },
    { kind: 'distance', a: 'U', b: 'V', value: 2.2 },
    { kind: 'distance', a: 'U', b: 'W', value: 1.2 },
    { kind: 'distance', a: 'U', b: 'X', value: 0.7 },
    // 三条半轴两两垂直，椭球才正
    { kind: 'perpendicular', p: ['U', 'V'], q: ['U', 'W'] },
    { kind: 'perpendicular', p: ['U', 'V'], q: ['U', 'X'] },
    { kind: 'perpendicular', p: ['U', 'W'], q: ['U', 'X'] },
    { kind: 'distance', a: 'G', b: 'H', value: 2 },
    { kind: 'distance', a: 'M', b: 'N', value: 2 },
    { kind: 'distance', a: 'N', b: 'K', value: 1 },
    { kind: 'perpendicular', p: ['M', 'N'], q: ['N', 'K'] },
    { kind: 'distance', a: 'S', b: 'T', value: 2 },
  ],
  // 位置关系：五样东西沿 x 轴排开、互不重叠，这样一眼能看全
  edges: [
    ['P', 'Q'],
    ['U', 'V'],
    ['G', 'H'],
    ['M', 'N'],
    ['N', 'K'],
    ['S', 'T'],
  ],
  faces: [] as string[][],
  solids: [
    { kind: 'sphere', center: 'P', through: 'Q' },
    { kind: 'ellipsoid', center: 'U', a: 'V', b: 'W', c: 'X' },
    { kind: 'cylinder', a: 'G', b: 'H', radius: 0.9 },
    { kind: 'cone', apex: 'M', center: 'N', rim: 'K' },
    { kind: 'frustum', a: 'S', b: 'T', radiusA: 0.5, radiusB: 1.1 },
  ],
}

/**
 * T1 的解答：**至少要一步**。
 *
 * 这里踩过一次：一开始给的是空解答，载入器报「解题过程是空的」、
 * 整道题载入失败，图上留着上一次的图形 —— 看上去像「曲面没画出来」，
 * 其实是题根本没载进去。**空解答不是合法的解答**，这是有意为之的设计。
 */
export const T1_SOLUTION = {
  steps: [
    {
      title: '看这几个曲面',
      text: '球、椭球、圆柱、圆锥、圆台各一个，都没有平面多边形可以拼出来，只能靠曲面。',
      why: '这一页只是用来看线框画得对不对',
      q: '0',
      addPoints: [] as { name: string; kind: string; of: string[] }[],
      addEdges: [
        ['P', 'Q'],
        ['U', 'V'],
        ['G', 'H'],
        ['M', 'N'],
      ],
      uses: ['P', 'Q', 'U', 'V'],
    },
  ],
  answers: [],
  angles: [],
  lengths: [],
}

/**
 * T2：**某一问独有的条件**（B2）。两问共用一套点，但第（2）问把动点钉死成中点。
 *
 * 验的时候看两点：
 * - 看第（1）问时，那个点应该**能拖动**（它是动点）
 * - 看第（2）问时，它应该**被钉在中点**上、拖不动
 *
 * 点和角的记号故意换一套（不用 ABCD-P），免得和别的题混。
 */
export const T2_PROBLEM = `在三棱锥 R-EFG 中，RE = RF = RG = 2，且 RE、RF、RG 两两垂直。
（1）点 L 是棱 EF 上的动点，求 RL 与底面 EFG 所成角的正切值的取值范围；
（2）若 L 是棱 EF 的中点，求 RL 与底面 EFG 所成角的正切值。`

export const T2_SCENE = {
  points: [
    { name: 'R', kind: 'free', at: [0, 2, 0] },
    { name: 'E', kind: 'free', at: [0, 0, 0] },
    { name: 'F', kind: 'free', at: [2, 0, 0] },
    { name: 'G', kind: 'free', at: [0, 0, 2] },
    // 主场景里 L 是**动点**（在第（1）问里用）
    { name: 'L', kind: 'onSegment', of: ['E', 'F'], t: 0.5 },
  ],
  constraints: [
    { kind: 'distance', a: 'R', b: 'E', value: 2 },
    { kind: 'distance', a: 'R', b: 'F', value: 2 },
    { kind: 'distance', a: 'R', b: 'G', value: 2 },
    { kind: 'perpendicular', p: ['R', 'E'], q: ['R', 'F'] },
    { kind: 'perpendicular', p: ['R', 'E'], q: ['R', 'G'] },
    { kind: 'perpendicular', p: ['R', 'F'], q: ['R', 'G'] },
  ],
  edges: [
    ['R', 'E'],
    ['R', 'F'],
    ['R', 'G'],
    ['E', 'F'],
    ['F', 'G'],
    ['G', 'E'],
    ['R', 'L'],
  ],
  faces: [
    ['E', 'F', 'G'],
    ['R', 'E', 'F'],
  ],
  // ← 第（2）问专属：把 L 换成**中点**，并加一条约束钉住它
  variants: [
    {
      q: '2',
      points: [{ name: 'L', kind: 'midpoint', of: ['E', 'F'] }],
      constraints: [{ kind: 'distance', a: 'E', b: 'L', value: Math.SQRT2 }],
    },
  ],
}

/** T2 的解答：只有两步，够切问、够看图形变化就行 */
export const T2_SOLUTION = {
  steps: [
    {
      title: '先摆出三棱锥',
      text: 'RE、RF、RG 两两垂直且都等于 2，所以它是三条棱互相垂直的三棱锥。',
      why: '题面直接给的垂直关系',
      q: '0',
      addPoints: [] as { name: string; kind: string; of: string[] }[],
      addEdges: [
        ['R', 'E'],
        ['R', 'F'],
        ['R', 'G'],
      ],
      uses: ['R', 'E', 'F', 'G'],
    },
    {
      title: '第（1）问：L 在 EF 上滑动',
      text: 'L 是 EF 上的动点，可以拖着它来回滑动，看 RL 的变化。',
      why: '动点用 onSegment',
      q: '1',
      addPoints: [] as { name: string; kind: string; of: string[] }[],
      addEdges: [['R', 'L']],
      uses: ['L', 'RL'],
    },
    {
      title: '第（2）问：L 被钉在 EF 的中点',
      text: '这一问的「若 L 是中点」只对第（2）问成立 —— 切到第（1）问时它又变回能滑动的动点。',
      why: '「若」是这一问独有的条件',
      q: '2',
      addPoints: [] as { name: string; kind: string; of: string[] }[],
      addEdges: [['R', 'L']],
      uses: ['L', 'RL', 'EF'],
    },
  ],
  answers: [
    { label: '（1）正切值的取值范围', value: '[√2/2, +∞)' },
    { label: '（2）正切值', value: '√2' },
  ],
  angles: [],
  lengths: [],
}
