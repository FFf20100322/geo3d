/**
 * 装成应用（APK）时，把文件真正存到手机上。
 *
 * **为什么不能只靠 `<a download>`**：安卓 WebView 没有下载处理器。
 * 网页版里浏览器会把文件放进「下载」文件夹，打包成 APK 之后这一下是空的 ——
 * 用户看到「已导出」，翻遍手机也找不到文件。
 *
 * 所以装成应用时走另一条路：写进应用自己的缓存目录（**不需要任何存储权限**），
 * 再拉起系统的分享面板。用户可以把文件存到「文件」里、发给微信/QQ、或者传网盘 ——
 * 这条路比网页的「下载」自由度大，也不需要我申请「所有文件访问权限」那种吓人的东西。
 *
 * 只在装成应用时启用；网页与 exe 照旧走浏览器下载，一行都不变。
 */
import { Capacitor } from '@capacitor/core'

/** 现在是不是跑在打包好的应用里（APK）。网页与 exe 都不是。 */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

/**
 * 文本/二进制转 base64。
 *
 * Filesystem 插件传二进制要 base64，而题目文件里有中文，
 * 所以必须先按 UTF-8 编码再转 —— 直接 `btoa(text)` 遇到中文会抛异常。
 */
function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  // 分块：String.fromCharCode 一次传太多参数会爆栈（大一点的 PNG 正好能触发）
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const s = String(fr.result ?? '')
      // readAsDataURL 给的是 data:...;base64,xxxx，只取逗号后面那段
      const at = s.indexOf(',')
      resolve(at >= 0 ? s.slice(at + 1) : '')
    }
    fr.onerror = () => reject(fr.error ?? new Error('读不出这张图'))
    fr.readAsDataURL(blob)
  })
}

/**
 * 把一份内容写成文件并拉起分享面板。
 *
 * `mime` 只用于给系统一个提示；文件名以 name 为准。
 * 返回 true 表示已经走完原生流程（调用方不要再退回浏览器下载）。
 */
async function saveNative(name: string, base64: string, dialogTitle: string): Promise<boolean> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')

  // 先删掉上次同名的那份：有的机型重复写同名文件会读到旧内容
  try {
    await Filesystem.deleteFile({ path: name, directory: Directory.Cache })
  } catch {
    // 本来就没有，正常
  }
  const wrote = await Filesystem.writeFile({
    path: name,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  })
  await Share.share({
    title: dialogTitle,
    text: name,
    url: wrote.uri,
    dialogTitle,
  })
  return true
}

/** 存一段文本（`.g3d` 就这一个用途）。不在应用里时返回 false。 */
export async function saveTextNative(name: string, text: string, dialogTitle: string): Promise<boolean> {
  if (!isNativeApp()) return false
  return saveNative(name, bytesToBase64(new TextEncoder().encode(text)), dialogTitle)
}

/** 存一个 Blob（存图导出用）。不在应用里时返回 false。 */
export async function saveBlobNative(name: string, blob: Blob, dialogTitle: string): Promise<boolean> {
  if (!isNativeApp()) return false
  return saveNative(name, await blobToBase64(blob), dialogTitle)
}
