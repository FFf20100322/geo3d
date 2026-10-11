import { edgeKey, faceKey, toDisplayName } from './scene.ts'
import { isMoving, type PointDef } from './solver.ts'

/**
 * 元素清单（N2）：把本题的点、棱、面整理成能点、能勾的条目。
 *
 * 这一层刻意做成纯函数放在单独模块里：清单本身是 DOM，node 里没法测，
 * 但「有哪些条目、叫什么名字、谁是动点」必须能测，所以只有这一层留下来测。
 *
 * **面那一栏的显隐不在这里存**。它由 isFaceHidden 现场去读 3D 里的那一份真状态。
 * 清单只读它、只改它，绝不自己再记一份 —— 一旦记两份，迟早出现
 * 「清单显示开着、图上是关的」，而只要出现过一次，用户就再也不敢信清单了。
 */

export type ElementTier = 'point' | 'edge' | 'face'

export interface ElementItem {
  /** 传给 3D 的身份：点名 / 棱 key / 面 key */
  key: string
  /** 显示名（带下标） */
  label: string
  /** 动点（清单上要标出来，否则用户不知道哪个能拖） */
  moving?: boolean
  /** 面专用：现在是不是被关掉了。来自 3D 那一份状态，不是清单自己记的 */
  hidden?: boolean
}

export interface ElementList {
  points: ElementItem[]
  edges: ElementItem[]
  faces: ElementItem[]
}

export interface Figure {
  points: PointDef[]
  edges: [string, string][]
  faces: string[][]
}

/**
 * isFaceHidden 就是把 3D 的真状态接进来的那根线（scene3d 的 isFaceHidden）。
 * 默认全都不隐藏，方便在 node 里只测结构。
 */
export function buildElements(fig: Figure, isFaceHidden: (key: string) => boolean = () => false): ElementList {
  return {
    points: fig.points.map((p) => ({
      key: toDisplayName(p.name),
      label: toDisplayName(p.name),
      moving: isMoving(p),
    })),
    edges: fig.edges.map(([a, b]) => {
      const x = toDisplayName(a)
      const y = toDisplayName(b)
      return { key: edgeKey(x, y), label: x + y }
    }),
    faces: fig.faces.map((ring) => {
      const names = ring.map(toDisplayName)
      const key = faceKey(names)
      return { key, label: names.join(''), hidden: isFaceHidden(key) }
    }),
  }
}
