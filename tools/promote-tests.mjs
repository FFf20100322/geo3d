/**
 * 一次性脚本：把「临时测试」升成正式的功能覆盖题（目标 ⑦ 的前半）。
 *
 * 用户要求「做几道覆盖所有功能的测试题，把以前的测试题删了」。
 * 但 T1/T2 覆盖的功能**不能丢**（曲面五种与整块开关、每问独有条件）——
 * 所以不是删掉它们，而是**把它们从「临时」升成正式成员**，换个一看就知道考什么的名字；
 * 真正该删的是死数据（SOLID_TEMP_*，全仓只有 demo.ts 自己引用）。
 *
 * 每处替换前先确认目标存在，改不到就报出来 —— 和清文档那次同一个写法。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

let done = 0
const missed = []

function sub(file, old, next, label) {
  if (!existsSync(file)) return missed.push(`${file}：文件不存在`)
  const t = readFileSync(file, 'utf8')
  if (!t.includes(old)) return missed.push(`${file}：找不到「${label}」`)
  writeFileSync(file, t.replace(old, next))
  done++
  console.log(`  ✓ ${file} —— ${label}`)
}

function cut(file, startMark, endMark, label) {
  if (!existsSync(file)) return missed.push(`${file}：文件不存在`)
  const t = readFileSync(file, 'utf8')
  const a = t.indexOf(startMark)
  const b = endMark ? t.indexOf(endMark, a) : -1
  if (a < 0 || b < 0) return missed.push(`${file}：找不到「${label}」的边界`)
  writeFileSync(file, t.slice(0, a) + t.slice(b))
  done++
  console.log(`  ✓ ${file} —— 删掉「${label}」`)
}

console.log('【把临时测试升成正式成员】')
// 这两道题覆盖的功能是别的题没有的，换个正经名字留下来
sub('src/main.ts', '【临时测试】T1 曲面立体', '曲面立体：球、椭球、圆柱、圆锥、圆台', 'T1 改名')
sub('src/main.ts', '【临时测试】T2', '每问独有条件：不串问', 'T2 改名')

// 文件头的「用完就删」已经不成立了 —— 它现在是正式的功能覆盖题
sub(
  'src/temptest.ts',
  '临时测试',
  '功能覆盖测试题',
  'temptest.ts 文件头：临时 → 正式',
)

console.log('【清死数据】')
// SOLID_TEMP_* 从加入起就没有任何地方引用（渲染早就改用 temptest.ts 了）
cut('src/demo.ts', 'export const SOLID_TEMP_', '\n/**', 'SOLID_TEMP_* 死数据块')

console.log(`\n共改 ${done} 处`)
if (missed.length) {
  console.log('没改到的（我对代码的记忆已过时，需要人工看一眼）：')
  for (const m of missed) console.log('  ✗ ' + m)
} else {
  console.log('全部都命中 ✓')
}
