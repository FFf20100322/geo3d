import { buildElements, type Figure } from './elements.ts'
import { faceKey, parseScene, toRenderable } from './scene.ts'

/**
 * 可运行的校验：元素清单的数据层。跑 `node src/elements.check.ts`。
 *
 * 重点验一条：**清单里的棱、尤其是面的 key，必须和 3D 渲染层用的是同一个**。
 * 对不上就会出现「清单说面开着、图上关着」或者勾选框点了没反应，
 * 而这种错在界面上看不出来 —— 只能在这里比出来。
 */

let failed = 0
function ok(name: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${cond || !extra ? '' : `　　${extra}`}`)
}

console.log('【条目：名字一律用显示名】')
{
  const fig: Figure = {
    points: [
      { name: 'A1', kind: 'free', at: [0, 0, 0] },
      { name: 'B', kind: 'free', at: [1, 0, 0] },
      { name: 'M', kind: 'midpoint', of: ['A1', 'B'] },
      { name: 'E', kind: 'onSegment', of: ['A1', 'B'], t: 0.3 },
    ],
    edges: [['A1', 'B'], ['B', 'M']],
    faces: [['A1', 'B', 'M']],
  }
  const list = buildElements(fig)
  ok('点用的是下标显示名', list.points[0].label === 'A₁', `实际 ${list.points[0].label}`)
  ok('棱名由两端显示名拼成', list.edges[0].label === 'A₁B', `实际 ${list.edges[0].label}`)
  ok('面名由顶点显示名拼成', list.faces[0].label === 'A₁BM', `实际 ${list.faces[0].label}`)
  ok('条目数量与输入一一对应', list.points.length === 4 && list.edges.length === 2 && list.faces.length === 1)
  ok('顺序按输入来', list.points.map((p) => p.label).join(',') === 'A₁,B,M,E')
}

console.log('\n【动点要标出来，别的点不许被误标】')
{
  const fig: Figure = {
    points: [
      { name: 'A', kind: 'free', at: [0, 0, 0] },
      { name: 'E', kind: 'onSegment', of: ['A', 'B'], t: 0.5 },
      { name: 'M', kind: 'midpoint', of: ['A', 'B'] },
      { name: 'P', kind: 'inFace', face: ['A', 'B', 'C'], u: 0.5, v: 0.5 },
    ],
    edges: [],
    faces: [],
  }
  const list = buildElements(fig)
  const marked = list.points.filter((p) => p.moving).map((p) => p.label)
  ok('线段动点与面内动点被标出', marked.join(',') === 'E,P', `实际 ${marked.join(',')}`)
  ok('自由点与中点不被当成动点', !list.points[0].moving && !list.points[2].moving)
}

console.log('\n【面显隐：只读 3D 那一份状态，不自己记】')
{
  const fig: Figure = { points: [], edges: [], faces: [['A', 'B', 'C'], ['A', 'B', 'C', 'D']] }
  const hidden = new Set(['ABCD'])
  const list = buildElements(fig, (k) => hidden.has(k))
  ok('被关掉的那个面读出来是关的', list.faces[1].hidden === true)
  ok('没被关的面读出来是开的', list.faces[0].hidden === false)
  hidden.delete('ABCD')
  hidden.add('ABC')
  const again = buildElements(fig, (k) => hidden.has(k))
  ok('同一个 isFaceHidden 换一次结果，清单跟着换（说明没有缓存）', again.faces[0].hidden === true && again.faces[1].hidden === false)
}

console.log('\n【关键一条：清单的 key 与 3D 渲染层的 key 必须一模一样】')
{
  const scene = parseScene({
    points: [
      { name: 'A1', kind: 'free' },
      { name: 'B1', kind: 'free' },
      { name: 'C1', kind: 'free' },
      { name: 'D1', kind: 'free' },
    ],
    edges: [
      ['A1', 'B1'],
      ['B1', 'C1'],
      ['C1', 'D1'],
      ['D1', 'A1'],
    ],
    faces: [
      ['A1', 'B1', 'C1'],
      ['A1', 'B1', 'C1', 'D1'],
    ],
    constraints: [{ kind: 'distance', a: 'A1', b: 'B1', value: 1 }],
  })
  // 下标字不是合法的 JS 标识符，所以键必须加引号（node 直接跑 .ts 时同样如此）
  const solved: Record<string, [number, number, number]> = {
    'A₁': [0, 0, 0],
    'B₁': [1, 0, 0],
    'C₁': [1, 1, 0],
    'D₁': [0, 1, 0],
  }
  const render = toRenderable(scene, solved)
  const list = buildElements(scene, (k) => k === render.faces[0].key)

  ok('面的 key 一一对应', list.faces.map((f) => f.key).join(' | ') === render.faces.map((f) => f.key).join(' | '), `清单 ${list.faces.map((f) => f.key).join(',')}　渲染 ${render.faces.map((f) => f.key).join(',')}`)
  ok('棱的 key 一一对应', list.edges.map((e) => e.key).join(' | ') === render.edges.map((e) => e.key).join(' | '))
  // 顶点名在两边也必须一样，否则按名字高亮会点不动任何东西
  ok('点名与渲染层的点名一致', list.points.map((p) => p.key).join(',') === render.vertices.map((v) => v.name).join(','))
  ok('清单的 hidden 确实读到了渲染层那个面', list.faces[0].hidden === true && list.faces[1].hidden === false)
  ok('面 key 就是 faceKey', list.faces[1].key === faceKey(['A₁', 'B₁', 'C₁', 'D₁']))
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
