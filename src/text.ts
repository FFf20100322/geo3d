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

/** LaTeX 命令到普通符号的直译表 */
const LATEX_SYMBOLS: [RegExp, string][] = [
  [/\\overrightarrow\s*\{([^{}]*)\}/g, '向量$1'],
  [/\\vec\s*\{([^{}]*)\}/g, '向量$1'],
  [/\\overline\s*\{([^{}]*)\}/g, '$1'],
  [/\\underline\s*\{([^{}]*)\}/g, '$1'],
  [/\\text\s*\{([^{}]*)\}/g, '$1'],
  [/\\mathrm\s*\{([^{}]*)\}/g, '$1'],
  // ∠ 和 △ 是「前缀符号」，后面不该有空格（写成 ∠A 而不是 ∠ A）；
  // 而 ⊥ ∥ 之类是关系符号，两侧留空格反而好读，所以不吞空格。
  [/\\triangle\s*/g, '△'],
  [/\\angle\s*/g, '∠'],
  [/\\perp\b/g, '⊥'],
  [/\\parallel\b/g, '∥'],
  [/\\cong\b/g, '≌'],
  [/\\sim\b/g, '∽'],
  [/\\in\b/g, '∈'],
  [/\\cdot\b/g, '·'],
  [/\\times\b/g, '×'],
  [/\\div\b/g, '÷'],
  [/\\pm\b/g, '±'],
  [/\\leq?\b/g, '≤'],
  [/\\geq?\b/g, '≥'],
  [/\\neq\b/g, '≠'],
  [/\\approx\b/g, '≈'],
  [/\\ldots\b/g, '…'],
  [/\\cdots\b/g, '…'],
  [/\\alpha\b/g, 'α'],
  [/\\beta\b/g, 'β'],
  [/\\gamma\b/g, 'γ'],
  [/\\theta\b/g, 'θ'],
  [/\\lambda\b/g, 'λ'],
  [/\\mu\b/g, 'μ'],
  [/\\pi\b/g, 'π'],
  [/\\varphi\b/g, 'φ'],
  [/\\phi\b/g, 'φ'],
  [/\\Rightarrow\b/g, '⇒'],
  [/\\Leftrightarrow\b/g, '⇔'],
  [/\\to\b/g, '→'],
]

/** 这个片段是不是「单个整体」，可以直接放进分数的一侧而不用再加括号 */
function isSimpleToken(x: string): boolean {
  const t = x.trim()
  if (!t) return false
  if (/^[A-Za-z0-9₁₂₃₄₅₆₇₈₉₀√πθαβγλμ°]+$/.test(t)) return true
  if ((t.startsWith('(') && t.endsWith(')')) || (t.startsWith('|') && t.endsWith('|'))) return true
  if (t.startsWith('向量') && t.length > 2) return true
  return false
}

/**
 * 把 LaTeX 转成能读的普通写法。
 *
 * 为什么需要它：书本上的分数、绝对值、向量箭头，模型经常原样吐 LaTeX 回来
 * （`\frac{1}{|\overrightarrow{PQ}|}`），直接显示在输入框里根本没法读，
 * 而题面是你要核对的第一道关，读不了就等于没识别。
 *
 * 做法是从里往外反复展开 \frac、\sqrt 这类带花括号的命令，直到不再变化为止 ——
 * 因为它们可以任意嵌套，一次正则替换处理不了嵌套的情况。
 */
export function latexToPlain(raw: string): string {
  let s = raw

  // 带花括号的命令：从最里层往外展开。花括号里不含花括号时才能安全匹配。
  const INNER = /\\(frac|sqrt|overrightarrow|vec|overline|underline|text|mathrm|left|right)\s*\{([^{}]*)\}/g
  for (let round = 0; round < 30; round++) {
    const before = s
    s = s.replace(INNER, (m, cmd: string, arg: string) => {
      switch (cmd) {
        case 'frac':
          // 分数要有两个参数，单独出现时不动它，留给下一轮配上分母
          return m
        case 'sqrt':
          return `√(${arg})`
        case 'overrightarrow':
        case 'vec':
          return `向量${arg}`
        case 'overline':
        case 'underline':
        case 'text':
        case 'mathrm':
          return arg
        default:
          return arg // \left \right 只是撑括号，直接丢掉
      }
    })
    // \frac{分子}{分母}：此时分子分母内部的命令都已展开，不再含花括号
    s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a: string, b: string) => {
      const top = a.trim()
      const bottom = b.trim()
      const topText = top.includes('+') || top.includes('-') ? `(${top})` : top
      const bottomText = isSimpleToken(bottom) ? bottom : `(${bottom})`
      return `${topText}/${bottomText}`
    })
    if (s === before) break
  }

  for (const [re, to] of LATEX_SYMBOLS) s = s.replace(re, to)

  // 收尾：去掉残留的美元号、转义空格、多余的花括号与 \left \right
  s = s.replace(/\\left|\\right/g, '')
  s = s.replace(/\\[,;:!]/g, '')
  s = s.replace(/\$+/g, '')
  s = s.replace(/\\/g, '') // 剩下的反斜杠一律去掉，免得留下一堆看不懂的符号
  s = s.replace(/\{/g, '').replace(/\}/g, '')
  s = s.replace(/\^\\?circ\b/g, '°')
  s = s.replace(/([A-Za-z0-9)])_(\d)/g, '$1$2')
  return normalizeMath(s.replace(/[ \t]{2,}/g, ' ').trim())
}

