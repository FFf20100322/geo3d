/**
 * 内置测试题：正四面体（四个面全是三角形），把所有已做的功能都覆盖一遍。
 *
 * 它同时是两样东西：
 * 1. 不用拍照、不耗接口就能试功能的入口；
 * 2. 回归的种子 —— demo.check.ts 拿它把「动点、点驱动面、三类角度」这些性质钉死。
 *
 * 覆盖到的功能清单：
 *   - 三角形的面（四个面都是三角形，与四边形面走不同分支）
 *   - 三个面内动点各一个自由度对：E 在面 PAB、F 在面 PBC、M 在面 PCA
 *   - **点驱动面**：E、F、M 三个动点张成一个面，动任意一个，那个面实时跟着变
 *   - 三个动点互相独立：动一个不影响另外两个
 *   - 三类角度标注各一个；其余直角由本地枚举补上
 *   - 解题步骤逐条高亮（用到点、棱、面）
 *
 * 之前那道正方体双动点、以及随后的正四面体中位线版测试题都没有丢：
 * 它们在 git 历史里（搜「正方体」或「中位线」即可找到）。不另存副本是因为副本会随时间失真，
 * 而历史里的那一份永远是当时真实跑过的样子。
 */

export const DEMO_PROBLEM = `在棱长为 2 的正四面体 PABC 中，底面 ABC 是正三角形。
点 E 在侧面 PAB 内运动，点 F 在侧面 PBC 内运动，点 M 在侧面 PCA 内运动。
（这是内置的测试题：三个面上的动点张成一个新平面，动任意一个，那个平面跟着变。）`

/** 底面的外接圆半径是 2/√3，高是 2√6/3 —— 这里只给近似初值，精确值由求解器算。 */
export const DEMO_SCENE = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'C', kind: 'free', at: [1, 0, 1.732] },
    { name: 'P', kind: 'free', at: [1, 1.633, 0.577] },
    // 三个面内动点，各在一个侧面里，互相独立
    { name: 'E', kind: 'inFace', face: ['P', 'A', 'B'], u: 0.4, v: 0.3 },
    { name: 'F', kind: 'inFace', face: ['P', 'B', 'C'], u: 0.4, v: 0.3 },
    { name: 'M', kind: 'inFace', face: ['P', 'C', 'A'], u: 0.4, v: 0.3 },
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
    // 三个动点两两相连：把「它们张成的那个面」描出边来，不然半透明面太薄看不清
    ['E', 'F'],
    ['F', 'M'],
    ['M', 'E'],
  ],
  // 四个面全是三角形，外加一个由三个动点张成的面
  faces: [
    ['A', 'B', 'C'],
    ['P', 'A', 'B'],
    ['P', 'B', 'C'],
    ['P', 'C', 'A'],
    // ↓ 这个面没有固定形状：三个顶点都是动点，拖动时它整个跟着变
    ['E', 'F', 'M'],
  ],
}

export const DEMO_SOLUTION = {
  steps: [
    {
      title: '点 E 在侧面 PAB 内滑动',
      text: 'E 被限制在三角形 PAB 内部，有左右与上下两个自由度。它只在这个面里动，不影响 F 与 M。',
      why: '动点在给定平面内运动',
      addPoints: [],
      addEdges: [],
      uses: ['PAB', 'E'],
    },
    {
      title: '点 F 在侧面 PBC 内滑动',
      text: '同理，F 被限制在三角形 PBC 内部。三个动点各自待在自己的侧面里，互不干涉。',
      why: '动点在给定平面内运动',
      addPoints: [],
      addEdges: [],
      uses: ['PBC', 'F'],
    },
    {
      title: '点 M 在侧面 PCA 内滑动',
      text: 'M 被限制在三角形 PCA 内部。到这一步，三个侧面上各有一个动点。',
      why: '动点在给定平面内运动',
      addPoints: [],
      addEdges: [],
      uses: ['PCA', 'M'],
    },
    {
      title: 'E、F、M 三点张成一个面',
      text: '不在同一条直线上的三个点确定一个平面，所以 E、F、M 永远张成一个平面。拖动任意一个动点时，这个平面会实时跟着改变形状与朝向 —— 这就是「点驱动面」。',
      why: '不共线的三点确定一个平面',
      addPoints: [],
      addEdges: [],
      uses: ['EF', 'FM', 'ME', 'EFM'],
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
