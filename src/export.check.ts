import { exportSize, pickVideoMime, toCanvasLabels } from './export.ts'

/**
 * 导出图片/视频时的坐标换算与格式选择。
 *
 * 这些看着像「小工具」，但它们是**导出功能里唯一能在电脑上验的部分** ——
 * 真正画图要 WebGL 与 DOM，只有到浏览器里才能看。所以把能算的都放这儿、测掉，
 * 剩下看的部分就只是一层薄壳。
 */

let failed = 0
const ok = (label: string, pass: boolean, extra = '') => {
  console.log(`${pass ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
  if (!pass) failed++
}

console.log('【导出：DOM 标注 → 画布坐标】')

// 画布在页面里只占一块地方（上面有工具条、下面有播放器）
const canvas = { left: 0, top: 200, width: 800, height: 600 }

{
  // 一个正好在画布正中偏上的标注
  const labels = [
    { text: 'A', box: { left: 390, top: 490, width: 20, height: 20 }, size: 14, color: '#fff' },
  ]
  const out = toCanvasLabels(labels, canvas, 1)
  ok('数量对', out.length === 1)
  // 元素中心 = (400, 500)；减掉画布原点 (0,200) → 画布内 (400, 300) = 正中
  ok('位置换算正确（正中）', !!out[0] && out[0].x === 400 && out[0].y === 300, out[0] ? `${out[0].x},${out[0].y}` : '没了')
  ok('文字原样带过去', out[0]?.text === 'A')
}

{
  // **关键坑**：用窗口尺寸当画布原点会整体偏掉（偏了 200，正是画布顶边到页面顶的距离）
  const labels = [{ text: 'B', box: { left: 390, top: 490, width: 20, height: 20 }, size: 14, color: '#fff' }]
  const wrong = toCanvasLabels(labels, { ...canvas, left: 0, top: 0 }, 1)
  ok('（反例）把画布当成从页面顶边开始，位置就会偏 200', wrong[0]?.y === 500, wrong[0] ? String(wrong[0].y) : '')
}

{
  // 高倍屏：画布内部像素是 CSS 像素的 3 倍，位置与字号都要跟着放大
  const labels = [{ text: 'C', box: { left: 390, top: 490, width: 20, height: 20 }, size: 14, color: '#fff' }]
  const out = toCanvasLabels(labels, canvas, 3)
  ok('高倍屏下位置乘 3', out[0]?.x === 1200 && out[0]?.y === 900, out[0] ? `${out[0].x},${out[0].y}` : '')
  ok('高倍屏下字号也乘 3', out[0]?.size === 42, String(out[0]?.size))
}

{
  // 空文字与隐藏元素不画
  const labels = [
    { text: '   ', box: { left: 10, top: 210, width: 20, height: 20 }, size: 14, color: '#fff' },
    { text: 'D', box: { left: 0, top: 0, width: 0, height: 0 }, size: 14, color: '#fff' },
  ]
  ok('空文字不画', toCanvasLabels(labels, canvas, 1).length === 0)
}

{
  // 被推到画布外面（还没拉回来）的标注不画，免得画到图外面去
  const labels = [{ text: 'E', box: { left: -50, top: 300, width: 20, height: 20 }, size: 14, color: '#fff' }]
  ok('落在画布外面的不画', toCanvasLabels(labels, canvas, 1).length === 0)
}

console.log('\n【导出尺寸：别产出几 MB 的巨图】')
{
  ok('小图不动它', JSON.stringify(exportSize(800, 600)) === JSON.stringify({ w: 800, h: 600 }))
  // 手机上画布内部可能两三千像素宽
  const big = exportSize(2400, 3600)
  ok('大图按最长边压到 1600 以内', Math.max(big.w, big.h) === 1600, `${big.w}x${big.h}`)
  ok('宽高比保持不变', Math.abs(big.w / big.h - 2400 / 3600) < 0.01, (big.w / big.h).toFixed(4))
  ok('尺寸不会是 0（某些机器上挂载瞬间画布是 0）', exportSize(0, 0).w >= 1 && exportSize(0, 0).h >= 1)
}

console.log('\n【视频格式：按浏览器真的支持什么来挑】')
{
  const onlyWebm = pickVideoMime((m) => m.startsWith('video/webm'))
  ok('只支持 webm 时挑 webm', onlyWebm?.ext === 'webm', JSON.stringify(onlyWebm))
  const withMp4 = pickVideoMime((m) => m.startsWith('video/mp4') || m.startsWith('video/webm'))
  ok('支持 mp4 时优先 mp4', withMp4?.ext === 'mp4', JSON.stringify(withMp4))
  // 关键：**不能在浏览器什么都不支持时硬挑一个**，那会在用户那边炸掉
  ok('什么都不支持时返回 null（由调用方去说清楚，而不是硬录）', pickVideoMime(() => false) === null)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
