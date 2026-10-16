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

/**
 * 走**真实流程**的测试题：只给文字，不给预建的场景与解答。
 *
 * 为什么要单独有一道：内置示例（上面那份）的场景是我自己写的，它绕过了一整条真实链路，
 * 永远发现不了「模型给的约束我接不住」这类问题。这一道是拿去让模型真的建一遍的。
 *
 * 选正四棱锥不是随便选的，这组数字刚好把要测的都凑齐了：
 * - 底面正方形给出**四边形面**，四个侧面给出**三角形面** —— 两种面型都压到；
 * - 侧棱 = 底边 = 2 时，∠APC 正好是 90°（测「直角画小方块、不写度数」），
 *   侧棱与底面成 45°（测整度数不写小数点），二面角余弦是 √3/3（测根号形式的反验）；
 * - 中点 M 测比例标注；棱上的动点 E 与面内的动点 F 测两类轨迹。
 */
export const REALFLOW_PROBLEM = `在正四棱锥 P-ABCD 中，底面 ABCD 是边长为 2 的正方形，侧棱 PA=PB=PC=PD=2。
点 E 是棱 PB 上的动点，点 F 是侧面 PAB 内的动点。
（1）求侧棱 PA 与底面 ABCD 所成角的大小；
（2）求二面角 P-CD-A 的余弦值；
（3）M 是 AB 的中点，求 PM 的长。`

/** 底面的外接圆半径是 2/√3，高是 2√6/3 —— 这里只给近似初值，精确值由求解器算。 */
export const DEMO_SCENE = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'C', kind: 'free', at: [1, 0, 1.732] },
    { name: 'P', kind: 'free', at: [1, 1.633, 0.577] },
    // 中点：用来验证「比例标注自动带上」——它不是模型给的，是由点的定义直接推出来的
    { name: 'N', kind: 'midpoint', of: ['A', 'B'] },
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
    // N 是 AB 的中点：连一条中线，让这个点有来处，也顺带验证比例标注
    ['P', 'N'],
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
  // 长度标注：一个固定值（顺便验「模型给的写法要过反验」），
  // 一个是动点之间的长度（没有固定值，只显示本地算的数——拖点时会跟着变，正好演示实时重算）
  lengths: [
    { p: ['A', 'B'], label: 'AB', value: '2' },
    { p: ['E', 'F'], label: 'EF' },
  ],
}

/**
 * 走真实建模流程的第二道题：**带动点**，用来验「三种解题法在动点上能不能实时更新」。
 *
 * 与 FULL_* 那道内置题的区别很重要：
 * - FULL_* 是**手工写死的**数据和解答，不走接口，用来验界面与几何；
 * - 这一道**只有题目文字**，图形与解答都由模型现场推 —— 走的是用户真正会走的那条路。
 *
 * 两个问都绕不开动点：
 * （1）E 取中点这个**特定位置**下的线面角 —— 落在某一步上；
 * （2）EF 的最小值 —— 要说明它对任意位置都成立，正好考向量/基底/坐标三种做法。
 */
export const MOVING_PROBLEM = `在棱长为 2 的正方体 ABCD-A₁B₁C₁D₁ 中，点 E 是棱 BB₁ 上的动点，点 F 是底面 ABCD 内的动点。
（1）当 E 是棱 BB₁ 的中点时，求直线 A₁E 与底面 ABCD 所成角的正切值；
（2）求线段 EF 的最小值。`

/**
 * 内置测试题之二：**棱长为 2 的正方体**。这道题的目标不是好看，是**把功能用满**。
 *
 * 与正四面体那道互补：那道考三角形面、点驱动面、三个独立的面内动点；
 * 这道考**四边形面、全部 8 种点类型、全部 8 种约束类型、四个问**。
 *
 * 覆盖清单：
 *   - 点类型 8 种全上：free（A、B、C、D、A₁）、offset（B₁、C₁、D₁）、
 *     midpoint（M、G）、ratio（O）、perpFoot（N）、projLine（H）、
 *     onSegment（E，在棱上滑）、inFace（F，在底面里滑）
 *   - 约束 8 种全上：distance、equalDistance、angle、lineAngle、
 *     perpendicular、parallel、perpLinePlane、coplanar
 *   - **同一位置的两条独立来路**：O 是「AC 的中点」，H 是「A₁ 到 BD 的射影」——
 *     二者应该重合。这是内置的一致性检查：两条定义若算出不同的点，说明哪一处错了。
 *   - 四边形面（正方体的六个面）与三角形面（截面 A₁BD）混在一起
 *   - 三类角各一个：异面直线角、二面角、线面角
 *   - 长度标注：定值（AB、A₁N）与动点之间的实时值（EF）
 *
 * 四个问的答案都是**手工算准后写进 FULL_EXPECT 的**，不靠模型给：
 *   （1）异面直线 A₁B 与 B₁C 所成角 = 60°
 *   （2）二面角 A₁-BD-A 的正切 = √2（余弦 = √3/3）
 *   （3）A₁G 与底面所成角的正弦 = 1/3
 *   （4）EF 的最小值 = 2（E 在顶面棱上、F 在底面内，二者最近时竖直对齐）
 *   附：点 A 到平面 A₁BD 的距离 = 2√3/3
 */
export const FULL_PROBLEM = `在棱长为 2 的正方体 ABCD-A₁B₁C₁D₁ 中，M 是棱 AA₁ 的中点，G 是棱 CC₁ 的中点，O 是底面 ABCD 的中心。
（1）求异面直线 A₁B 与 B₁C 所成角的大小；
（2）求二面角 A₁-BD-A 的正切值；
（3）求 A₁G 与底面 ABCD 所成角的正弦值；
（4）点 E 是棱 A₁B₁ 上的动点，点 F 在底面 ABCD 内运动，求线段 EF 的最小值。`

export const FULL_SCENE = {
  points: [
    // 底面四个顶点与 A₁ 用自由点，靠约束把正方体钉死；
    // 其余三个顶面顶点由 offset（平移派生）算出来 —— 它们天然就是棱柱的顶点，不需要再约束。
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'C', kind: 'free', at: [2, 0, 2] },
    { name: 'D', kind: 'free', at: [0, 0, 2] },
    { name: 'A1', kind: 'free', at: [0, 2, 0] },
    { name: 'B1', kind: 'offset', of: ['A1', 'B', 'A'] },
    { name: 'C1', kind: 'offset', of: ['B1', 'C', 'B'] },
    { name: 'D1', kind: 'offset', of: ['A1', 'D', 'A'] },
    // 两个动点必须在场景里（拖动要靠它们自己在 DEFS 里），不能等到某一步才加出来。
    // E 在顶面棱上滑，F 在底面里滑。
    { name: 'E', kind: 'onSegment', of: ['A1', 'B1'], t: 0.5 },
    { name: 'F', kind: 'inFace', face: ['A', 'B', 'C', 'D'], u: 0.35, v: 0.6 },
    // 其余的辅助点（M、G、O、H、N）**故意不放在这里**，而是由解答的某一步「加出来」——
    // 这样播放器才有东西可以揭示：一段一段地看着辅助点与辅助线被补上，
    // 而不是一打开就什么都摆在那儿。
  ],
  constraints: [
    // 钉死正方体所需的八条：底面是边长 2 的正方形（4 条边 + 1 个直角），
    // A₁ 由「垂直底面 + 棱长 2」定住（3 条）。
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'B', b: 'C', value: 2 },
    { kind: 'distance', a: 'C', b: 'D', value: 2 },
    { kind: 'distance', a: 'D', b: 'A', value: 2 },
    { kind: 'angle', at: 'A', from: 'D', to: 'B', value: 90 },
    { kind: 'perpLinePlane', line: ['A', 'A1'], plane: ['A', 'B', 'C'] },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    // 下面几条是**冗余但成立**的：它们不增加信息，但把剩下的约束类型也过一遍，
    // 顺带检验求解器面对「多余条件」不会跑偏。
    { kind: 'equalDistance', ab: ['A', 'B'], cd: ['C', 'D'] },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['B', 'C'] },
    { kind: 'parallel', p: ['A', 'B'], q: ['D', 'C'] },
    { kind: 'coplanar', pts: ['A', 'B', 'C', 'D'] },
    { kind: 'lineAngle', p: ['A1', 'B'], q: ['B1', 'C'], value: 60 },
  ],
  edges: [
    // 正方体的十二条棱 + 动点连线。辅助线都由解答的步骤加出来。
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
    ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
    ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1'],
    ['E', 'F'],
  ],
  faces: [
    ['A', 'B', 'C', 'D'],
    ['A1', 'B1', 'C1', 'D1'],
    ['A', 'B', 'B1', 'A1'],
    ['B', 'C', 'C1', 'B1'],
    ['C', 'D', 'D1', 'C1'],
    ['D', 'A', 'A1', 'D1'],
    // 截面 A₁BD：三角形面，与上面六个四边形面走不同分支。
    // 第（1）问的 60° 与最后一问的点面距离都要靠它，所以它得在场景里，而不是等某一步加。
    ['A1', 'B', 'D'],
  ],
}

/** 这道题的四个答案 + 一个附带的距离。手工算准的，测试拿它当基准。 */
export const FULL_EXPECT = {
  skewAngleDegrees: 60,
  dihedralCos: Math.sqrt(3) / 3,
  linePlaneSin: 1 / 3,
  minEF: 2,
  distAToPlaneA1BD: (2 * Math.sqrt(3)) / 3,
}

export const FULL_SOLUTION = {
  steps: [
    {
      title: '先把这个正方体摆出来',
      q: '0',
      text: '底面 ABCD 是边长 2 的正方形，AA₁ 垂直底面且 AA₁ = 2。顶面三个顶点由平移得到。',
      why: '正方体的基本结构',
      addPoints: [],
      addEdges: [
        ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
        ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1'],
        ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['D', 'D1'],
      ],
      uses: ['ABCD', 'A1B1C1D1', 'A', 'A1'],
    },
    {
      title: '第（1）问：异面直线 A₁B 与 B₁C 所成角',
      q: '1',
      text: '把 B₁C 平移到 A₁D，它就与 A₁B 相交于 A₁。于是所求角就是 ∠BA₁D，而 △A₁BD 是正三角形，所以是 60°。',
      why: '异面直线所成角要平移到相交',
      addPoints: [],
      addEdges: [['A1', 'B'], ['B1', 'C'], ['A1', 'D'], ['B', 'D']],
      uses: ['A1B', 'B1C', 'A1'],
    },
    // ↓ 同一问的另外三种解法。它们与上面那一步**同属第(1)问**，用 via 区分。
    //   切换时只放对应那一组，所以图上一次只会看到一种做法 —— 这是用户明确要求的：
    //   三种方法分开演算，不能同时出现。
    {
      title: '第（1）问·向量法：算两个方向向量的夹角',
      text: '取 A₁B 与 B₁C 的方向向量，点积除以两个模长，得到 cos = 1/2，所以夹角是 60°。',
      why: '异面直线所成角 = 两个方向向量夹角的余弦的绝对值',
      q: '1',
      via: '向量法',
      addPoints: [],
      addEdges: [['A1', 'B'], ['B1', 'C']],
      uses: ['A1B', 'B1C'],
    },
    {
      title: '第（1）问·坐标系法：建系算坐标',
      text: '以 A 为原点、三条棱为坐标轴，A₁B 的方向是 (2,-2,0)，B₁C 的方向是 (0,-2,2)，点积 4 除以 8 得 1/2，夹角 60°。',
      why: '建系之后异面直线的角就是两个坐标向量的夹角',
      q: '1',
      via: '坐标系法',
      addPoints: [],
      addEdges: [['A1', 'B'], ['B1', 'C']],
      uses: ['A1B', 'B1C', 'A'],
    },
    {
      title: '第（1）问·基底法：用三条棱作基底',
      text: '把 AB、AD、AA₁ 取作基底。A₁B = AB − AA₁，B₁C = AD − AA₁，两者点积得 |AB|² = 4，模长各是 2√2，所以 cos = 1/2。',
      why: '基底法不建系，直接把向量拆成三条棱的组合',
      q: '1',
      via: '基底法',
      addPoints: [],
      addEdges: [['A1', 'B'], ['B1', 'C'], ['A', 'A1']],
      uses: ['A1B', 'B1C', 'AA1'],
    },
    {
      title: '第（2）问：二面角 A₁-BD-A',
      q: '2',
      text: 'O 是底面中心，也是 A 与 A₁ 在 BD 上的垂足。所以二面角的平面角就是 ∠AOA₁，而 AO ⊥ 底面、AA₁ ⊥ 底面，于是 tan∠AOA₁ = AA₁ / AO = 2 / √2 = √2。',
      why: '二面角要找垂直于棱的两条线',
      addPoints: [
        { name: 'O', kind: 'ratio', of: ['A', 'C'], t: 0.5 },
        // H 是「A₁ 在 BD 上的射影」，与 O 是同一个点的另一条来路 —— 两条独立定义互相印证
        { name: 'H', kind: 'projLine', of: ['A1', 'B', 'D'] },
      ],
      addEdges: [['A1', 'H'], ['A', 'H']],
      uses: ['BD', 'A1H', 'AH', 'O'],
    },
    {
      title: '第（3）问：A₁G 与底面所成角',
      q: '3',
      text: 'G 是 CC₁ 的中点，所以 G 到底面的距离是 1（CC₁ 的一半）。而 A₁G 的长是 √(2² + 1² + 2²) = 3。线面角的正弦就是「高比斜边」＝ 1/3。',
      why: '线面角的正弦 = 端点到面的距离 / 斜线长',
      addPoints: [{ name: 'G', kind: 'midpoint', of: ['C', 'C1'] }],
      addEdges: [['A1', 'G'], ['C', 'G']],
      uses: ['A1G', 'G'],
    },
    {
      title: '第（4）问：动点 E、F 之间距离的最小值',
      q: '4',
      text: 'E 在顶面的棱 A₁B₁ 上，离底面 2；F 在底面内，离底面 0。所以 EF 至少是 2，而且当 E 与 F 竖直对齐时正好取到 2 —— 最小值就是 2。',
      why: '两条平行线上两点距离的最小值就是它们之间的距离',
      addPoints: [],
      addEdges: [],
      uses: ['EF', 'E', 'F'],
    },
    {
      title: '第（4）问·向量法：把 EF 当成向量',
      text: 'E 在 A₁B₁ 上、F 在底面内，EF 就是从 E 指向 F 的向量。它竖直方向上的分量正好是 2，所以长度至少是 2；E 与 F 上下对齐时取到 2。',
      why: '两点间距离就是差向量的模',
      q: '4',
      via: '向量法',
      addPoints: [],
      addEdges: [['E', 'F']],
      uses: ['EF', 'E', 'F'],
    },
    {
      title: '第（4）问·基底法：用三条棱当基底',
      text: '取 AB、AD、AA₁ 作基底。E = AA₁ + AB + t·AB 的方向上是确定的，F 在底面内所以没有 AA₁ 分量 —— 两者之差里 AA₁ 的系数恒为 1，模长至少是 2。',
      why: '基底法把向量拆成三条棱的组合，竖直分量一眼看出',
      q: '4',
      via: '基底法',
      addPoints: [],
      addEdges: [['E', 'F']],
      uses: ['EF', 'E', 'F', 'AA1'],
    },
    {
      title: '第（4）问·坐标系法：建系标坐标',
      text: '以 A 为原点、AB 为 x 轴、AD 为 y 轴、AA₁ 为 z 轴。E 的 z 坐标恒为 1（在顶面上），F 的 z 坐标恒为 0，所以两点距离的平方里 z 方向就贡献 1，距离至少是 1 个单位 —— 换成棱长就是 2。',
      why: '建系之后竖直方向的差一眼看出',
      q: '4',
      via: '坐标系法',
      addPoints: [],
      addEdges: [['E', 'F']],
      uses: ['EF', 'E', 'F', 'A'],
    },
    {
      title: '附带：点 A 到平面 A₁BD 的距离',
      q: '0',
      text: 'N 是 A 在平面 A₁BD 上的垂足。对角线 AC₁ 垂直于平面 A₁BD，所以这条距离等于 AC₁ 的三分之一，即 2√3/3。',
      why: '正方体的体对角线垂直于截面 A₁BD',
      addPoints: [
        { name: 'N', kind: 'perpFoot', of: ['A', 'A1', 'B', 'D'] },
        { name: 'M', kind: 'midpoint', of: ['A', 'A1'] },
      ],
      addEdges: [['A', 'N']],
      uses: ['AN', 'N', 'A1BD'],
    },
  ],
  answers: [
    { label: '（1）A₁B 与 B₁C 所成角', value: '60°' },
    { label: '（2）二面角 A₁-BD-A 的正切', value: '√2' },
    { label: '（3）A₁G 与底面所成角的正弦', value: '1/3' },
    { label: '（4）EF 的最小值', value: '2' },
  ],
  /**
   * 三种解题法各自要在图上画出来的东西。
   *
   * 用一个 arrows 数组装三种用途，靠 color 区分：
   * - **yellow** = 向量法的向量（一律带箭头，用户明确要求）
   * - **blue** = 基底法的基底（与黄色区分开；坐标系法的三个轴也用蓝色）
   * 坐标系另由 frame 描述：原点 + 三个轴上的点，程序据此**自己算出每个点的坐标**，
   * 不让模型报坐标 —— 那是它最容易报错、而本地算完全免费的东西。
   */
  arrows: [
    // 向量法：把 EF 本身当成向量画出来
    { from: 'E', to: 'F', label: 'EF', color: 'yellow' },
    { from: 'E', to: 'A1', label: 'EA₁', color: 'yellow' },
    // 基底法：以 AB、AD、AA₁ 为基底（蓝色，和黄色的向量分开）
    { from: 'A', to: 'B', label: 'AB', color: 'blue' },
    { from: 'A', to: 'D', label: 'AD', color: 'blue' },
    { from: 'A', to: 'A1', label: 'AA₁', color: 'blue' },
  ],
  frame: { origin: 'A', x: 'B', y: 'D', z: 'A1' },
  angles: [
    { kind: 'lineLine', p: ['A1', 'B'], q: ['B1', 'C'], label: 'A₁B 与 B₁C 所成角', value: '60°', of: 'degrees' },
    { kind: 'dihedral', edge: ['B', 'D'], inA: 'A1', inB: 'A', label: '二面角 A₁-BD-A', value: '√3/3', of: 'cos' },
    { kind: 'linePlane', line: ['A1', 'G'], plane: ['A', 'B', 'C'], label: 'A₁G 与底面所成角', value: '1/3', of: 'sin' },
  ],
  lengths: [
    { p: ['A', 'B'], label: 'AB', value: '2' },
    { p: ['A', 'N'], label: 'A 到平面A₁BD', value: '2√3/3' },
    { p: ['E', 'F'], label: 'EF' },
  ],
}
