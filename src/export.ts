/**
 * 导出图片与视频时的**坐标换算**。纯函数，能在电脑上单独验。
 *
 * 为什么需要这一层：3D 的画面在 WebGL 画布上，而**点标注、角度、坐标那些字都是 DOM**
 * （贴在画布上面的一层）。直接截画布，导出的图里**一个字都没有** ——
 * 那样的图拿给别人看，等于一张没有标注的立体图，基本没用。
 *
 * 所以导出时要自己把标注画上去。要画就得把「DOM 元素在屏幕上的位置」
 * 换算到「画布里的位置」—— 这里就是那个换算。
 * 换算本身与浏览器无关（给的都是数字），所以能单独测。
 */

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

export interface LabelSpot {
  text: string
  /** 元素在**视口**里的位置（getBoundingClientRect 的原样） */
  box: Box
  /** 字号（像素） */
  size: number
  color: string
  bold?: boolean
}

/** 画在导出图上的一个标注：已经换算成**画布坐标** */
export interface DrawnLabel {
  text: string
  /** 文字中心点在画布里的位置 */
  x: number
  y: number
  size: number
  color: string
  bold: boolean
}

/**
 * 把 DOM 标注换算到画布坐标系。
 *
 * 关键点：**不能用窗口尺寸**，要用画布自己的 rect —— 画布在页面里只占一块地方
 * （上面有工具条、下面有播放器），用窗口尺寸算出来的位置会整体偏掉。
 * 这条是项目里踩过的坑，写在这儿免得导出时再踩一次。
 *
 * 画布内部像素与 CSS 像素可能不一样（高倍屏），所以还要乘一个缩放比。
 */
export function toCanvasLabels(labels: LabelSpot[], canvas: Box, scale: number): DrawnLabel[] {
  const out: DrawnLabel[] = []
  for (const l of labels) {
    if (!l.text.trim()) continue
    if (l.box.width <= 0 || l.box.height <= 0) continue // 被隐藏的（display:none）不画
    // DOM 元素的位置是相对视口的，先减掉画布在视口里的原点
    const cx = l.box.left + l.box.width / 2 - canvas.left
    const cy = l.box.top + l.box.height / 2 - canvas.top
    // 落在画布之外的（比如被推出去还没拉回来的）不画，免得画到图外面
    if (cx < 0 || cy < 0 || cx > canvas.width || cy > canvas.height) continue
    out.push({
      text: l.text.trim(),
      x: cx * scale,
      y: cy * scale,
      size: l.size * scale,
      color: l.color,
      bold: !!l.bold,
    })
  }
  return out
}

/**
 * 导出时的画布尺寸：保持宽高比，最长边不超过 maxSide。
 *
 * 为什么要限：手机上是 3 倍屏，画布内部可能有两三千像素宽；
 * 直接导出来是一张几 MB 的图，发微信会被压得很难看，也不必要。
 */
export function exportSize(w: number, h: number, maxSide = 1600): { w: number; h: number } {
  if (w <= 0 || h <= 0) return { w: 1, h: 1 }
  const k = Math.min(1, maxSide / Math.max(w, h))
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) }
}

/**
 * 挑一个这浏览器**真的能录**的视频格式。
 *
 * 为什么不能写死 MP4：安卓 Chrome 上 MediaRecorder 支持的是 WebM，
 * MP4 要看版本。写死 mp4 的话，在不支持的机器上会直接抛错、用户看到的是「导出失败」，
 * 而其实换个格式就能录。所以按偏好顺序问一遍浏览器，它说支持哪个就用哪个。
 */
export function pickVideoMime(supported: (m: string) => boolean): { mime: string; ext: string } | null {
  const candidates: [string, string][] = [
    ['video/mp4;codecs=avc1', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm;codecs=vp8', 'webm'],
    ['video/webm', 'webm'],
  ]
  for (const [mime, ext] of candidates) if (supported(mime)) return { mime, ext }
  return null
}
