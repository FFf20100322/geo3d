import { normalizeExpr, parseExpr, verifySymbolic } from './symbolic.ts'

/**
 * 可运行的校验：符号值解析与反验。
 * 这一段是标注功能的地基 —— 角度、长度、答案都要先过它才允许显示，
 * 所以它自己必须先钉死。跑 `pnpm symboliccheck`。
 */

let failed = 0
function ok(label: string, cond: boolean, extra = '') {
  if (!cond) failed++
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
}
const near = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol

function val(label: string, input: string, want: number) {
  let got: number
  try {
    got = parseExpr(input)
  } catch (e) {
    failed++
    console.log(`  ✗ ${label}（${input}）解析失败：${e instanceof Error ? e.message : e}`)
    return
  }
  ok(label, near(got, want, 1e-9), `${input} = ${got}`)
}
function bad(label: string, input: string) {
  try {
    const v = parseExpr(input)
    failed++
    console.log(`  ✗ ${label}（${input}）本该报错，却算出 ${v}`)
  } catch (e) {
    ok(label, true, `→「${e instanceof Error ? e.message : e}」`)
  }
}

console.log('【常见答案形式】')
val('整数', '4', 4)
val('根号', '√6', Math.sqrt(6))
val('根号除以整数', '√3/6', Math.sqrt(3) / 6)
val('整数乘根号', '2√3', 2 * Math.sqrt(3))
val('括号加根号再除', '(√6)/3', Math.sqrt(6) / 3)
val('根号带括号', '√(2)/2', Math.sqrt(2) / 2)
val('整数根号除以整数', '3√3/2', (3 * Math.sqrt(3)) / 2)
val('根号在分子上带括号', '(3√3)/2', (3 * Math.sqrt(3)) / 2)
val('分数', '2/3', 2 / 3)
val('带加号', '1+√3', 1 + Math.sqrt(3))
val('带减号', '1-√3', 1 - Math.sqrt(3))
val('负根号', '-√2', -Math.sqrt(2))
val('两位小数', '0.75', 0.75)
val('根号里的括号算式', '√(2+1)', Math.sqrt(3))
val('两个根号相乘', '√2√3', Math.sqrt(6))
val('隐式乘法接括号', '2(1+√2)', 2 * (1 + Math.sqrt(2)))
val('平方', '√3^2', 3)
val('圆周率', 'π', Math.PI)
val('带度符号', '90°', 90)
val('小数带度符号', '35.26°', 35.26)

console.log('\n【容错：模型爱写的 LaTeX 与排版符号】')
val('LaTeX 分数', '\\frac{\\sqrt{3}}{6}', Math.sqrt(3) / 6)
val('LaTeX 根号', '\\sqrt{6}', Math.sqrt(6))
val('LaTeX 花括号根号', '\\sqrt{2}/2', Math.sqrt(2) / 2)
val('乘号写成 ×', '2×√3', 2 * Math.sqrt(3))
val('乘号写成 ·', '2·√3', 2 * Math.sqrt(3))
val('减号写成全角', '1−√3', 1 - Math.sqrt(3))
val('外面套了美元号', '$\\frac{\\sqrt{6}}{3}$', Math.sqrt(6) / 3)
val('中间有空格', '√3 / 6', Math.sqrt(3) / 6)
val('全角括号', '（√6）/3', Math.sqrt(6) / 3)

console.log('\n【该拒绝的要拒绝】')
bad('空表达式', '')
bad('只有符号', '√')
bad('未配对的括号', '(1+2')
bad('多余的括号', '1+2)')
bad('不认识的字母', 'abc')
bad('除数为零', '1/0')

console.log('\n【有意放宽的两处（宁可宽容，也别把对的答案误判成错的）】')
// 1++2 在数学上不常见，但含义唯一，为它报错反而可能否掉一个正确的值
ok('重复的正负号按含义理解', near(parseExpr('1++2'), 3) && near(parseExpr('1+-2'), -1))
// 空格被全部去掉，所以中间隔开的数字会并成一个数 —— 这是「√3 / 6」这类写法能识别的代价
ok('空格被完全去掉（1 2 会并成 12）', near(parseExpr('1 2'), 12))

console.log('\n【反验：对得上才允许显示】')
{
  const r1 = verifySymbolic('√3/6', Math.sqrt(3) / 6)
  ok('正确答案能通过', r1.ok, `解出 ${r1.value?.toFixed(8)}`)

  const r2 = verifySymbolic('2√3', 2 * Math.sqrt(3))
  ok('整数乘根号也能通过', r2.ok)

  // 这是最要防的情况：把 2√3 写成了 3√2，看着像答案但不是
  const r3 = verifySymbolic('3√2', 2 * Math.sqrt(3))
  ok('根号写反了要被拦下', !r3.ok, r3.reason ?? '')

  const r4 = verifySymbolic('√3/6', 0.3)
  ok('差得多要被拦下', !r4.ok)

  const r5 = verifySymbolic('abc', 1)
  ok('解析不了也要如实报错', !r5.ok && !!r5.reason, r5.reason ?? '')

  // 容差：本地算出的浮点有末位误差时不能误杀
  const r6 = verifySymbolic('√3/6', Math.sqrt(3) / 6 + 1e-12)
  ok('末位浮点误差不误杀', r6.ok)
}

console.log('\n【归一化本身】')
ok('LaTeX 分数被改写', normalizeExpr('\\frac{1}{2}') === '(1)/(2)', normalizeExpr('\\frac{1}{2}'))
ok('空格被去掉', normalizeExpr(' 1 + 2 ') === '1+2')
ok('全角乘号被改写', normalizeExpr('2×3') === '2*3')

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
