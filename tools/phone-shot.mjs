/**
 * 把手机屏幕截图取回电脑。
 *
 * 关键点：**全程不在手机上写任何文件**。
 * 常规做法是 `adb shell screencap -p /sdcard/x.png` 再 `adb pull`，但那样会在用户手机上留下文件。
 * 这里改用 `adb exec-out screencap -p`，把 PNG 直接从手机的 stdout 流水到电脑内存里再落盘，
 * 手机侧不产生任何文件、也不读取任何文件。
 *
 * 另外：绝不能用 PowerShell 的 `>` 重定向去接二进制流（它会做编码转换，PNG 会坏掉，
 * 表现为「Unsupported or malformed image data」）。这也是必须用 node 来做的原因。
 *
 * 用法：node tools/phone-shot.mjs [输出路径]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const CANDIDATES = [
  process.env.ADB,
  'C:/Users/Administrator/AppData/Local/Microsoft/WinGet/Packages/Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe/platform-tools/adb.exe',
  'C:/platform-tools/adb.exe',
  `${process.env.LOCALAPPDATA ?? ''}/Android/Sdk/platform-tools/adb.exe`,
].filter(Boolean)

const adb = CANDIDATES.find((p) => existsSync(p))
if (!adb) {
  console.error('没找到 adb。装一个：winget install Google.PlatformTools')
  process.exit(1)
}

const out = process.argv[2] ?? '.phone/shot.png'
mkdirSync(dirname(out), { recursive: true })

// exec-out 把二进制原样送到 stdout；不给 encoding 就会拿到 Buffer，正是我们要的
const png = execFileSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 128 * 1024 * 1024 })

if (png[0] !== 0x89 || png[1] !== 0x50 || png[2] !== 0x4e || png[3] !== 0x47) {
  console.error('取回来的不是 PNG，可能 adb 没连上或设备未授权。')
  process.exit(1)
}
writeFileSync(out, png)
console.log(`${out}  ${png.length} 字节  手机侧未写任何文件`)
