/**
 * 内置示例题（当前这份是用来测动点的）。
 *
 * 两个用途：
 * 1. 不用拍照、不耗接口，随时能测界面：动点滑杆、联动、逐步高亮、辅助线动画。
 * 2. 当回归自检的种子 —— demo.check.ts 会把这道题从头跑一遍，任何一步坏掉都会当场失败。
 *
 * 这道题在同一张图里放了两个互不干扰的动点：
 *   E 在棱 BC 上滑动（一个自由度）
 *   F 在侧面 ABB₁A₁ 内滑动（两个自由度）
 */

export const DEMO_PROBLEM = `在棱长为 2 的正方体 ABCD-A₁B₁C₁D₁ 中，
点 E 在棱 BC 上运动，点 F 在侧面 ABB₁A₁ 内运动。
（这道题是内置的测试题：拖动两个动点，看各自的联动线段是否独立变化。）`

/** 棱长 2 的正方体，外加两个动点。坐标由本地求解器算，at 只是初值。 */
export const DEMO_SCENE: unknown = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'D', kind: 'free', at: [0, 0, 2] },
    { name: 'A1', kind: 'free', at: [0, 2, 0] },
    { name: 'C', kind: 'offset', of: ['B', 'D', 'A'] },
    { name: 'B1', kind: 'offset', of: ['B', 'A1', 'A'] },
    { name: 'C1', kind: 'offset', of: ['C', 'A1', 'A'] },
    { name: 'D1', kind: 'offset', of: ['D', 'A1', 'A'] },
    // 动点一：在棱 BC 上滑动
    { name: 'E', kind: 'onSegment', of: ['B', 'C'], t: 0.5 },
    // 动点二：在侧面 ABB₁A₁ 内滑动
    { name: 'F', kind: 'inFace', face: ['A', 'B', 'B1', 'A1'], u: 0.5, v: 0.5 },
  ],
  edges: [
    // 正方体的十二条棱
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'D'],
    ['D', 'A'],
    ['A1', 'B1'],
    ['B1', 'C1'],
    ['C1', 'D1'],
    ['D1', 'A1'],
    ['A', 'A1'],
    ['B', 'B1'],
    ['C', 'C1'],
    ['D', 'D1'],
    // 跟着 E 动的线段：只在 E 移动时变化
    ['A', 'E'],
    ['D', 'E'],
    // 跟着 F 动的线段：只在 F 移动时变化
    ['A', 'F'],
    ['B', 'F'],
    ['A1', 'F'],
  ],
  faces: [
    ['A', 'B', 'C', 'D'],
    ['A1', 'B1', 'C1', 'D1'],
    ['A', 'B', 'B1', 'A1'],
    ['B', 'C', 'C1', 'B1'],
    ['C', 'D', 'D1', 'C1'],
    ['D', 'A', 'A1', 'D1'],
  ],
  constraints: [
    { kind: 'distance', a: 'A', b: 'B', value: 2 },
    { kind: 'distance', a: 'A', b: 'D', value: 2 },
    { kind: 'distance', a: 'A', b: 'A1', value: 2 },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'D'] },
    { kind: 'perpendicular', p: ['A', 'B'], q: ['A', 'A1'] },
    { kind: 'perpendicular', p: ['A', 'D'], q: ['A', 'A1'] },
  ],
}

/** 两步：一步讲一个动点。步骤里的 uses 特意写了「棱」和「面」，用来验证高亮能覆盖到线面。 */
export const DEMO_SOLUTION: unknown = {
  steps: [
    {
      title: '点 E 在棱 BC 上滑动',
      text: 'E 被限制在棱 BC 上，只有一个自由度。移动它时，连到 A、D 的线段会跟着变，而 F 不受影响。',
      why: '动点在给定线段上运动',
      addPoints: [],
      addEdges: [],
      uses: ['BC', 'E'],
    },
    {
      title: '点 F 在侧面 ABB₁A₁ 内滑动',
      text: 'F 被限制在侧面 ABB₁A₁ 内部，有左右与上下两个自由度。移动它时，连到 A、B、A₁ 的线段会跟着变，而 E 不受影响。',
      why: '动点在给定平面内运动',
      addPoints: [],
      addEdges: [],
      uses: ['ABB1A1', 'F'],
    },
  ],
  answers: [],
}
