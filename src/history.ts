import type { Scene } from './scene'
import type { Solution } from './solution'

/**
 * 本地存档：拍过的题目与生成过的场景。
 *
 * 只存场景本身，不存求解出来的坐标 —— 求解只要几毫秒，打开时重算一次就行。
 * 这样既省空间，也不会存下一份可能过期的坐标。
 *
 * store 是注入的，所以这段逻辑能在 node 里用假的存储直接跑通（含超配额、存坏数据这些岔路）。
 */

export interface HistoryRecord {
  id: string
  savedAt: number
  problemText: string
  extra: string
  /** 拍下来的那张图的小缩略图，用来在列表里认出是哪道题 */
  thumbnail?: string
  /** 原题图片（存档里留的那一版）。用户要求存档保留所有的东西，原图是其中一样。 */
  image?: string
  /** 生成成功过的场景。没有就说明当时只识别了文字 */
  scene?: Scene
  /** 生成成功过的解题过程 */
  solution?: Solution
}

export interface Store {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const HISTORY_KEY = 'geo3d.history.v1'
/** 最多留 10 条，超了自动丢最早的一条 */
const MAX = 10

const isRecord = (x: unknown): x is HistoryRecord => {
  if (typeof x !== 'object' || x === null) return false
  const r = x as Partial<HistoryRecord>
  return typeof r.id === 'string' && typeof r.savedAt === 'number' && typeof r.problemText === 'string'
}

export interface History {
  list(): HistoryRecord[]
  /** 按题面文字去重：同一道题再存一次是更新，不是新增一条 */
  save(rec: Omit<HistoryRecord, 'id' | 'savedAt'> & { id?: string }): HistoryRecord
  remove(id: string): void
  clear(): void
}

export function createHistory(store: Store): History {
  function read(): HistoryRecord[] {
    try {
      const raw = store.getItem(HISTORY_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(isRecord) : []
    } catch {
      // 存坏了就当没有，不能让一条坏数据把整个页面卡死
      return []
    }
  }

  function write(list: HistoryRecord[]): void {
    const attempts: HistoryRecord[][] = [
      list,
      list.slice(0, Math.max(1, Math.floor(list.length / 2))),
      list.slice(0, 5).map((r) => ({ ...r, thumbnail: undefined })),
    ]
    let lastErr: unknown = null
    for (const attempt of attempts) {
      try {
        store.setItem(HISTORY_KEY, JSON.stringify(attempt))
        return
      } catch (e) {
        lastErr = e
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('存不进去了')
  }

  return {
    list: () => read().sort((a, b) => b.savedAt - a.savedAt),

    save(input) {
      const all = read()
      const existing = all.find((r) => (input.id && r.id === input.id) || r.problemText === input.problemText)
      const rest = all.filter((r) => r !== existing)
      // **输入里没传的字段，沿用原来那条记录的值。**
      // 只用 `...input` 展开是不够的（二审实测出来的，而且是我刚引入的）：
      // 没传的字段会被展开成 `undefined`，写进 JSON 就消失 ——
      // 于是「只想改个题面」再存一次，会把已经存好的解答与原图**擦掉**，
      // 而且 id 不变，用户看到的是「更新了一条」而不是「新建了一条」，毫无察觉。
      const rec: HistoryRecord = {
        ...input,
        problemText: input.problemText ?? existing?.problemText ?? '',
        extra: input.extra ?? existing?.extra ?? '',
        thumbnail: input.thumbnail ?? existing?.thumbnail,
        image: input.image ?? existing?.image,
        scene: input.scene ?? existing?.scene,
        solution: input.solution ?? existing?.solution,
        // 同一道题再存一次时沿用原来的 id，免得任何持有这个 id 的地方突然失效
        id: existing?.id ?? input.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: Date.now(),
      }
      // 超出上限就丢最旧的（按时间排，不是按写入顺序）
      rest.sort((a, b) => b.savedAt - a.savedAt)
      write([rec, ...rest.slice(0, MAX - 1)])
      return rec
    },

    remove(id) {
      write(read().filter((r) => r.id !== id))
    },

    clear() {
      store.setItem(HISTORY_KEY, JSON.stringify([]))
    },
  }
}
