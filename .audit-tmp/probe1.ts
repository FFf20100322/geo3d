// 审计用临时探针（不在仓库里，跑完就删）
import { parseScene } from '../src/scene.ts'
import { parseSolution } from '../src/solution.ts'
import { FOLD_SCENE, FOLD_SOLUTION, SOLID_TEMP_SCENE, SOLID_TEMP_PROBLEM, MOVING_PROBLEM, REALFLOW_PROBLEM } from '../src/demo.ts'
import { T1_SCENE, T1_SOLUTION, T2_SCENE, T2_SOLUTION } from '../src/temptest.ts'
import { solve } from '../src/solver.ts'

const cases: [string, unknown, unknown][] = [
  ['demo.FOLD', FOLD_SCENE, FOLD_SOLUTION],
  ['demo.SOLID_TEMP', SOLID_TEMP_SCENE, { steps: [{ title: 'x', text: 'y', addPoints: [], addEdges: [], uses: [] }], answers: [], angles: [], lengths: [] }],
  ['temptest.T1', T1_SCENE, T1_SOLUTION],
  ['temptest.T2', T2_SCENE, T2_SOLUTION],
]

for (const [name, sceneSrc, solSrc] of cases) {
  try {
    const s = parseScene(sceneSrc)
    const r = solve(s.points, s.constraints)
    console.log(`  ${name}: 场景 ${s.points.length} 点 / 解出来 ${r.ok} 残差 ${r.maxError.toExponential(2)}`)
    try {
      const sol = parseSolution(solSrc, s)
      console.log(`    ✓ 解答 ${sol.steps.length} 步`)
    } catch (e) {
      console.log(`    ✗ 解答报错 -> ${(e as Error).message}`)
    }
  } catch (e) {
    console.log(`  ✗ ${name}: 场景报错 -> ${(e as Error).message}`)
  }
}

// 未使用的导出
console.log('\nSOLID_TEMP_PROBLEM 前 30 字:', SOLID_TEMP_PROBLEM.slice(0, 30))
console.log('MOVING/REALFLOW 是否被 main 引用（看上面 grep）')
