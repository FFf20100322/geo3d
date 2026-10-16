import type { HistoryRecord } from './history'
import { parseScene } from './scene.ts'
// 只借类型，**不用 parseSolution** —— 理由见下面 isSolutionShape 那段注释：
// 解析过的解答再解析一次必然报错（输入输出不是一个形状）
import type { Solution } from './solution.ts'

/**
 * `.g3d`：**一道题的完整打包**，用来在手机之间、手机与电脑之间传。
 *
 * 里面装的就是一条存档记录 —— 因为存档里**本来就留着全部东西**：
 * 原图、题面、补充的条件、生成过的场景、解题过程。所以打包这件事
 * 不需要另起一套数据结构，序列化一条记录就够了。
 *
 * 这一层是**纯函数**（不碰浏览器、不碰 DOM），所以在电脑上就能验：
 * 拿一条记录打包再解开，应该一模一样；坏文件要被拒掉，不能让人导入半个题。
 */

/** 文件头的标记，用来一眼认出这是不是我们的文件 */
export const G3D_MAGIC = 'geo3d'
/** 打包格式的版本。以后改了格式就 +1，老文件仍按老版本读 */
export const G3D_VERSION = 1

export interface G3dFile {
  magic: typeof G3D_MAGIC
  version: number
  exportedAt: number
  /** 导出时的软件版本，纯粹用来排查问题（「你是用哪一版导出的」） */
  appVersion?: string
  record: HistoryRecord
}

/** 建议的文件名：带上题目开头几个字，一堆文件里才认得出 */
export function suggestFileName(rec: HistoryRecord): string {
  // 文件名里不能有这些字符（Windows 与安卓都不行）
  const head = rec.problemText
    .replace(/[\\/:*?"<>|\n\r\t]/g, ' ')
    .trim()
    .slice(0, 20)
    .trim()
  const stamp = new Date(rec.savedAt || Date.now())
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.getDate())}`
  return `Geo3D_${date}_${head || '题目'}.g3d`
}

/** 把一条存档打包成 `.g3d` 的文本内容 */
export function buildG3d(rec: HistoryRecord, appVersion?: string): string {
  // id 不带出去：那是本机存档里的编号，导到别人手机上应当重新分配
  const { id: _id, ...rest } = rec
  const file: G3dFile = {
    magic: G3D_MAGIC,
    version: G3D_VERSION,
    exportedAt: Date.now(),
    appVersion,
    record: { ...rest, id: '' },
  }
  return JSON.stringify(file, null, 1)
}

export class G3dError extends Error {}

/**
 * 解开一个 `.g3d`。
 *
 * **宁可拒绝，也不要导入半个题**：任何一处对不上就抛错、说清哪里不对。
 * 尤其是 scene 与 solution —— 它们还要过各自的解析器，
 * 因为「结构看着像」不等于「能用」。
 */
export function parseG3d(text: string): HistoryRecord {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new G3dError('这个文件不是 Geo3D 题目文件（读不出内容）')
  }
  if (typeof raw !== 'object' || raw === null) throw new G3dError('这个文件不是 Geo3D 题目文件')
  const f = raw as Partial<G3dFile>
  if (f.magic !== G3D_MAGIC) throw new G3dError('这个文件不是 Geo3D 题目文件（没有标记）')
  if (typeof f.version !== 'number') throw new G3dError('文件缺少版本号')
  if (f.version > G3D_VERSION) {
    throw new G3dError(`这个文件是更新版本的 Geo3D 导出的（v${f.version}），当前版本读不了`)
  }
  const r = f.record
  if (typeof r !== 'object' || r === null) throw new G3dError('文件里没有题目内容')
  if (typeof r.problemText !== 'string' || !r.problemText.trim()) throw new G3dError('文件里没有题面文字')

  // 场景要过解析器 —— 它的输入输出是同一种形状，往返是安全的。
  let scene = r.scene
  if (scene !== undefined) {
    try {
      scene = parseScene(scene)
    } catch (e) {
      throw new G3dError(`文件里的图形读不出来：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // **解答不能再用 parseSolution 过一遍。**
  //
  // 踩过一次，而且是「导出一定成功、导入一定失败」那种：
  // parseSolution 解析出来的 Solution 与它能接受的**输入格式不一样** ——
  // 解析后 step.uses 是 {points, edges, faces} 这样的对象，而解析器要求输入是数组。
  // 于是「解析过的解答再解析一次」必然报错，而存档里存的正是解析过的那份。
  // （这正是「往返一趟」那条自检抓出来的 —— 不测往返就永远发现不了。）
  //
  // 所以这里**只做结构校验**：文件里带的就是我们导出时写下的形状，
  // 该有的字段必须在、类型必须对；对不上就拒掉，不硬收。
  let solution = r.solution
  if (solution !== undefined) {
    if (!scene) throw new G3dError('文件里有解题过程却没有图形，读不了')
    if (!isSolutionShape(solution)) throw new G3dError('文件里的解题过程结构不对')
  } else {
    solution = undefined
  }

  return {
    // 导入时重新分配 id 与时间：它是本机的一条新存档，不是原来那条
    id: '',
    savedAt: Date.now(),
    problemText: r.problemText,
    extra: typeof r.extra === 'string' ? r.extra : '',
    thumbnail: typeof r.thumbnail === 'string' ? r.thumbnail : undefined,
    image: typeof r.image === 'string' ? r.image : undefined,
    scene,
    solution,
  }
}

/**
 * 结构校验：一条**已经解析过**的解答该长什么样。
 * 只查「骨架在不在」——不重算、不重解析，因为文件里带的就是我们自己写下的形状。
 */
function isSolutionShape(x: unknown): x is Solution {
  if (typeof x !== 'object' || x === null) return false
  const s = x as Partial<Solution>
  if (!Array.isArray(s.steps) || s.steps.length === 0) return false
  for (const st of s.steps) {
    if (typeof st !== 'object' || st === null) return false
    const t = st as unknown as Record<string, unknown>
    if (typeof t.title !== 'string' || typeof t.text !== 'string') return false
    // uses 在解析后的形状里是个对象（分点/棱/面三份）
    if (typeof t.uses !== 'object' || t.uses === null) return false
    if (!Array.isArray(t.addPoints) || !Array.isArray(t.addEdges)) return false
  }
  if (!Array.isArray(s.answers) || !Array.isArray(s.angles) || !Array.isArray(s.lengths)) return false
  return true
}
