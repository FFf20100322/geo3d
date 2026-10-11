import { latexToPlain, normalizeMath, normalizeSubscripts } from './text.ts'

/**
 * 可运行的校验：下标规范化。
 * 下标是立体几何题的命根子 —— A 和 A₁ 是两个不同的点，认丢了下标会让图形整个建错，
 * 而且约束仍然自洽、验算仍然通过，属于最难发现的那类错误。跑 `pnpm textcheck`。
 */

let failed = 0
function is(input: string, want: string) {
  const got = normalizeSubscripts(input)
  const ok = got === want
  if (!ok) failed++
  console.log(`${ok ? '  ✓' : '  ✗'} ${input}  →  ${got}${ok ? '' : `　　期望 ${want}`}`)
}

console.log('【下标规范化】')
is('正方体ABCD-A1B1C1D1', '正方体ABCD-A₁B₁C₁D₁')
is('ABC-A_1B_1C_1中', 'ABC-A₁B₁C₁中')
is('∠A¹AB=60°', '∠A₁AB=60°')
is('G是BC的中点，H是A1C1的中点', 'G是BC的中点，H是A₁C₁的中点')
// 下面这些不能被误伤：数字与字母之间隔着别的字符时不该动它
is('所有棱长都为2的斜三棱柱', '所有棱长都为2的斜三棱柱')
is('第10题(13分) AB=2√3', '第10题(13分) AB=2√3')
is('PA⊥平面ABCD，AB=2，∠BAD=60°', 'PA⊥平面ABCD，AB=2，∠BAD=60°')
is('已经写成下标的 A₁ 不应被再动一次', '已经写成下标的 A₁ 不应被再动一次')

console.log('\n【数学排版：指数要转成上标】')
{
  const m = (input: string, want: string) => {
    const got = normalizeMath(input)
    const ok = got === want
    if (!ok) failed++
    console.log(`${ok ? '  ✓' : '  ✗'} ${input}  →  ${got}${ok ? '' : `　　期望 ${want}`}`)
  }
  m('|GH|^2=|u-b/2|^2=3', '|GH|²=|u-b/2|²=3')
  m('A1C1 与 GH 的夹角', 'A₁C₁ 与 GH 的夹角')
  m('S=2×2=4', 'S=2×2=4')
  // 字母指数不转：x^n 里的 n 可能有别的含义，不乱动
  m('a^n + b^n', 'a^n + b^n')
}

console.log('\n【LaTeX → 能读的普通写法】')
{
  const l = (input: string, want: string) => {
    const got = latexToPlain(input)
    const ok = got === want
    if (!ok) failed++
    console.log(`${ok ? '  ✓' : '  ✗'} ${input}\n      → ${got}${ok ? '' : `\n      期望 ${want}`}`)
  }
  // 这一条就是实拍那道题里原样吐回来的东西
  l(
    '则$\\frac{1}{|\\overrightarrow{PQ}|}+\\frac{1}{|\\overrightarrow{PR}|}+\\frac{1}{|\\overrightarrow{PS}|}=$____。',
    '则1/|向量PQ|+1/|向量PR|+1/|向量PS|=____。',
  )
  l('\\frac{1}{2}', '1/2')
  l('\\frac{a+b}{c}', '(a+b)/c')
  l('\\frac{a}{b+c}', 'a/(b+c)')
  l('\\frac{\\sqrt{3}}{6}', '√(3)/6')
  l('\\frac{1}{|PQ|}', '1/|PQ|')
  l('\\sqrt{2}', '√(2)')
  l('$\\triangle ABC$ 中，$\\angle A=60^\\circ$', '△ABC 中，∠A=60°')
  l('PA \\perp 平面ABCD', 'PA ⊥ 平面ABCD')
  l('AB \\parallel CD', 'AB ∥ CD')
  l('|GH|^2=\\frac{3}{4}', '|GH|²=3/4')
  l('\\alpha+\\beta=\\theta', 'α+β=θ')
  l('\\text{解：}设x=1', '解：设x=1')
  l('$A_1B_1$', 'A₁B₁')
  l('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}', '向量AB·向量AC')
  l('没有任何 LaTeX 的普通句子', '没有任何 LaTeX 的普通句子')
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
