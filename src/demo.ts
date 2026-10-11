/**
 * 内置测试题：正四面体（四个面全是三角形），把所有已做的功能都覆盖一遍。
 *
 * 它同时是两样东西：
 * 1. 不用拍照、不耗接口就能试功能的入口；
 * 2. 回归的种子 —— demo.check.ts 拿它把「动点、中位线、垂足、三类角度」这些性质钉死。
 *
 * 覆盖到的功能清单：
 *   - 三角形的面（四个面都是三角形，与四边形面走的是不同分支）
 *   - 棱上动点 E（一个自由度）、面内动点 F（两个自由度），两者互相独立
 *   - 中点派生的中位线 MN（两层依赖：E 类同，这里依赖 P、A、B）
 *   - 垂足 O（P 在底面上的射影），带出「线面垂直」这种直角关系
 *   - 解题步骤逐条画出辅助线（O 与 PO 是步骤里才出现的）
 *   - 三类角度标注各一个；底面各处的直角由本地枚举补上
 *
 * 之前那道正方体双动点的测试题没有丢：它在 git 历史里（搜「正方体」即可找到，
 * 例如引入三棱锥测试之前的最后一次提交）。不另存副本是因为副本会随时间失真，
 * 而历史里的那一份永远是当时真实跑过的样子。
 */

export const DEMO_PROBLEM = `在棱长为 2 的正四面体 PABC 中，底面 ABC 是正三角形，
点 E 在棱 AB 上运动，点 F 在侧面 PAB 内运动。
（这是内置的测试题：四个面都是三角形，含动点、中位线、垂足与三类角度标注。）`

/** 底面的外接圆半径是 2/√3，高是 2√6/3 —— 这里只给近似初值，精确值由求解器算。 */
export const DEMO_SCENE = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'C', kind: 'free', at: [1, 0, 1.732] },
    { name: 'P', kind: 'free', at: [1, 1.633, 0.577] },
    // 动点一：在棱 AB 上滑动，只有一个自由度
    { name: 'E', kind: 'onSegment', of: ['A', 'B'], t: 0.5 },
    // 动点二：在三角形面 PAB 内滑动，有左右与上下两个自由度
    { name: 'F', kind: 'inFace', face: ['P', 'A', 'B'], u: 0.35, v: 0.35 },
    // 三角形 PAB 的中位线：M、N 是 PA、PB 的中点，所以 MN ∥ AB
    { name: 'M', kind: 'midpoint', of: ['P', 'A'] },
    { name: 'N', kind: 'midpoint', of: ['P', 'B'] },
  ],
  constraints: [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'B', b: 'C', value: 2 },
    { kind: 'distance', a: 'C', b: 'A', value: 2 },
    { kind: 'distance', a: 'P', b: 'A', value: 2 },
    { kind: 'distance', a: 'P', b: 'B', value: 2 },
    { kind: 'distance', a: 'P', b: 'C', value: 2 },
  ],
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'A'],
    ['P', 'A'],
    ['P', 'B'],
    ['P', 'C'],
    // 中位线
    ['M', 'N'],
    // 跟着 E 动的线：只在 E 移动时变化
    ['A', 'E'],
    ['B', 'E'],
    // 跟着 F 动的线：只在 F 移动时变化
    ['P', 'F'],
    ['A', 'F'],
    ['B', 'F'],
  ],
  // 四个面全是三角形
  faces: [
    ['A', 'B', 'C'],
    ['P', 'A', 'B'],
    ['P', 'B', 'C'],
    ['P', 'C', 'A'],
  ],
}

export const DEMO_SOLUTION = {
  steps: [
    {
      title: '点 E 在棱 AB 上滑动',
      text: 'E 被限制在棱 AB 上，只有一个自由度。移动它时，连到 A、B 的线段会跟着变，而 F 不受影响。',
      why: '动点在给定线段上运动',
      addPoints: [],
      addEdges: [],
      uses: ['AB', 'E'],
    },
    {
      title: '点 F 在侧面 PAB 内滑动',
      text: 'F 被限制在三角形 PAB 内部，有左右与上下两个自由度。移动它时，连到 P、A、B 的线段会跟着变，而 E 不受影响。',
      why: '动点在给定平面内运动',
      addPoints: [],
      addEdges: [],
      uses: ['PAB', 'F'],
    },
    {
      title: '看中位线 MN',
      text: 'M、N 分别是 PA、PB 的中点，所以 MN 是三角形 PAB 的中位线：它永远平行于 AB，长度也永远是 AB 的一半。',
      why: '三角形中位线定理',
      addPoints: [],
      addEdges: [],
      uses: ['PA', 'PB', 'M', 'N', 'MN'],
    },
    {
      title: '作高 PO，O 是 P 在底面上的射影',
      text: '从 P 向底面 ABC 作垂线，垂足记为 O。因为正四面体是对称的，O 正好是底面正三角形的中心，并且 PO 垂直于底面内的每一条直线。',
      why: '正四面体的对称性',
      addPoints: [{ name: 'O', kind: 'perpFoot', of: ['P', 'A', 'B', 'C'] }],
      addEdges: [['P', 'O']],
      uses: ['A', 'B', 'C', 'O'],
    },
  ],
  answers: [],
  // 三类角各来一个。value 会被本地算一遍核对，对不上就退回本地算出的度数。
  angles: [
    { kind: 'linePlane', line: ['P', 'A'], plane: ['A', 'B', 'C'], label: 'PA 与底面所成角', value: '√3/3', of: 'cos' },
    { kind: 'dihedral', edge: ['A', 'B'], inA: 'P', inB: 'C', label: '二面角 P-AB-C', value: '1/3', of: 'cos' },
    { kind: 'lineLine', p: ['P', 'A'], q: ['P', 'B'], label: '∠APB', value: '60°', of: 'degrees' },
  ],
}
