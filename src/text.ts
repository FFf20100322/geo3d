/**
 * 文本规范化。放在单独一个模块里，因为它同时被接入层（识别结果）和解题层（解题文字）用到，
 * 挂在任何一边都会让依赖方向别扭。
 */

const SUB_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/**
 * 把 A1、A_1、A¹ 这类写法统一成 A₁。
 * 下标是立体几何题的命根子：A 和 A₁ 是两个完全不同的点，写法不统一就会指错点，
 * 而错了以后约束照样自洽、验算照样通过 —— 属于最难发现的那类错误。
 */
export function normalizeSubscripts(s: string): string {
  const toSub = (digs: string, table: (d: string) => string) => [...digs].map(table).join('')
  return s
    .replace(
      new RegExp(`([A-Za-z])([${SUP_DIGITS}]+)`, 'g'),
      (_m, letter: string, digs: string) => letter + toSub(digs, (d) => SUB_DIGITS[SUP_DIGITS.indexOf(d)]),
    )
    .replace(/([A-Za-z])_?(\d+)/g, (_m, letter: string, digs: string) => letter + toSub(digs, (d) => SUB_DIGITS[+d]))
}

/**
 * 数学文字排版：下标 + 指数。
 * 模型很爱写 |GH|^2 和 A1C1，直接显示出来很难看；转成 |GH|² 和 A₁C₁ 才是课本上的样子。
 * 只转数字，不碰字母指数（x^n 里的 n 可能有别的含义）。
 */
export function normalizeMath(s: string): string {
  return normalizeSubscripts(s).replace(/\^(\d+)/g, (_m, digs: string) =>
    [...digs].map((d) => SUP_DIGITS[+d]).join(''),
  )
}
