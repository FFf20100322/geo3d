import { EDGES, FACES, VERTICES, selfCheck } from './geo.ts'

// 可运行的校验：任何一次数据改动后跑 `node src/geo.check.ts`，不通过就非零退出
selfCheck()
console.log(`自检通过：${Object.keys(VERTICES).length} 个顶点、${EDGES.length} 条棱、${FACES.length} 个共面（边长 1 的正方体）`)
