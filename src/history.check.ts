import { HISTORY_KEY, createHistory, type Store } from './history.ts'
import type { Scene } from './scene.ts'

/**
 * 可运行的校验：本地存档。
 * 重点考岔路：重复保存要更新而不是新增、超上限要丢最旧的、存坏了不能把页面搞死、超配额要能降级重试。
 * 跑 `node src/history.check.ts`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}

/** 假的 localStorage：还能设定「最多装多少个字符」来模拟超配额 */
function fakeStore(limit = Infinity) {
  const map = new Map<string, string>()
  const store: Store = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      if (v.length > limit) {
        const e = new Error('QuotaExceededError')
        e.name = 'QuotaExceededError'
        throw e
      }
      map.set(k, v)
    },
  }
  return { store, map }
}

const scene: Scene = {
  points: [
    { name: 'A', kind: 'free', at: [0, 0, 0] },
    { name: 'B', kind: 'free', at: [2, 0, 0] },
    { name: 'C', kind: 'free', at: [0, 0, 2] },
  ],
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'A'],
  ],
  faces: [['A', 'B', 'C']],
  constraints: [{ kind: 'distance', a: 'A', b: 'B', value: 2 }],
}

console.log('【基本读写】')
{
  const { store } = fakeStore()
  const h = createHistory(store)
  ok('一开始是空的', h.list().length === 0)
  h.save({ problemText: '第一题', extra: '', scene })
  h.save({ problemText: '第二题', extra: '补充一句' })
  const list = h.list()
  ok('存了两条', list.length === 2, `实际 ${list.length}`)
  ok('最新的排在最前', list[0].problemText === '第二题')
  ok('场景能原样读回来', list[1].scene?.points.length === 3)
  ok('没有场景的那条也存得住', list[0].scene === undefined)
  ok('每条都有 id', list.every((r) => typeof r.id === 'string' && r.id.length > 0))
}

console.log('\n【同一道题再存是更新，不是新增】')
{
  const { store } = fakeStore()
  const h = createHistory(store)
  const first = h.save({ problemText: '同一道题', extra: '', scene })
  const again = h.save({ problemText: '同一道题', extra: '改了点东西', scene })
  const list = h.list()
  ok('条数没涨', list.length === 1, `实际 ${list.length}`)
  ok('id 保持不变', again.id === first.id)
  ok('内容被更新了', list[0].extra === '改了点东西')
}

console.log('\n【超出上限丢最旧的】')
{
  const { store } = fakeStore()
  const h = createHistory(store)
  for (let i = 1; i <= 15; i++) h.save({ problemText: `第 ${i} 题`, extra: '' })
  const list = h.list()
  ok('总数被压在 10 条', list.length === 10, `实际 ${list.length}`)
  ok('最新那条还在', list.some((r) => r.problemText === '第 15 题'))
  ok('最旧那条被丢了', !list.some((r) => r.problemText === '第 1 题'))
  ok('第 6 条开始还在', list.some((r) => r.problemText === '第 6 题'))
}

console.log('\n【存坏了不能把页面搞死】')
{
  const { store, map } = fakeStore()
  map.set(HISTORY_KEY, '{这不是合法 json')
  const h = createHistory(store)
  ok('坏数据当空处理', h.list().length === 0)
  h.save({ problemText: '救回来了', extra: '' })
  ok('之后还能正常存', h.list().length === 1)

  map.set(HISTORY_KEY, JSON.stringify([{ 乱七八糟: true }, { id: 'x', savedAt: 1, problemText: '好的一条' }]))
  ok('数组里混进坏条目时只留好的', createHistory(store).list().length === 1)
}

console.log('\n【超配额要能降级重试，不能直接崩】')
{
  const { store, map } = fakeStore()
  const h = createHistory(store)
  // 先塞进一大堆带缩略图的记录，把空间占掉
  for (let i = 0; i < 20; i++) h.save({ problemText: `第 ${i} 题`, extra: '', thumbnail: 'x'.repeat(2000) })

  // 现在把配额卡在「只装得下原本一半」的位置：write 应当自动降级
  const used = (map.get(HISTORY_KEY) ?? '').length
  const tight = createHistory({
    getItem: store.getItem,
    setItem: (k, v) => {
      if (v.length > used * 0.6) throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
      store.setItem(k, v)
    },
  })
  let threw = false
  try {
    tight.save({ problemText: '新的一题', extra: '', thumbnail: 'y'.repeat(2000) })
  } catch {
    threw = true
  }
  ok('配额紧张时自动降级而不是直接抛错', !threw)
  ok('降级后确实存进去了', (map.get(HISTORY_KEY) ?? '').includes('新的一题'))
}

console.log('\n【删除与清空】')
{
  const { store } = fakeStore()
  const h = createHistory(store)
  const a = h.save({ problemText: '甲', extra: '' })
  h.save({ problemText: '乙', extra: '' })
  h.remove(a.id)
  ok('删掉一条后只剩一条', h.list().length === 1 && h.list()[0].problemText === '乙')
  h.clear()
  ok('清空后为空', h.list().length === 0)
}

console.log('\n【存档里的每一样都要留得住】')
{
  // 这条是审计抓出来的：history.save 曾经手工列举字段，后来 HistoryRecord 加了
  // image（原图）与 solution（解答），那两行没人补 —— 于是**每次保存都静默丢掉**。
  // 后果很贵：从历史打开一道题解答没了（要重新花钱问模型），导出的 .g3d 里也没有原图。
  //
  // 所以这里逐项核对：传进去的每一样，读回来都必须在。**将来再加字段，这一条也会兜住。**
  const store = fakeStore().store
  const h = createHistory(store)
  const sol = { steps: [{ title: 't', text: 'x' }], answers: [], angles: [], lengths: [] }
  const saved = h.save({
    problemText: '带齐所有字段的一道题',
    extra: '补充条件',
    thumbnail: 'data:image/png;base64,THUMB',
    image: 'data:image/png;base64,IMAGE',
    scene: undefined,
    solution: sol as never,
  })
  const back = h.list().find((r) => r.id === saved.id)
  ok('原图留住了', back?.image === 'data:image/png;base64,IMAGE', String(back?.image))
  ok('缩略图留住了', back?.thumbnail === 'data:image/png;base64,THUMB')
  ok('解答留住了', !!back?.solution && (back.solution as { steps?: unknown[] }).steps?.length === 1)
  ok('补充条件留住了', back?.extra === '补充条件')
  ok('题面留住了', back?.problemText === '带齐所有字段的一道题')

  // 同一道题再存一次：更新，不是新增；而且这次传的字段也要留住
  h.save({ problemText: '带齐所有字段的一道题', extra: '改了', image: 'data:image/png;base64,IMAGE2' })
  const again = h.list()
  ok('同一道题不会存两条', again.length === 1, `${again.length} 条`)
  ok('再存一次时新传的原图也留住', again[0]?.image === 'data:image/png;base64,IMAGE2')
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
