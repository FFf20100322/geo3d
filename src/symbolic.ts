/**
 * 符号值解析与反验。
 *
 * 用途：答案和标注要显示成 √3/6、2√3 这种印刷体形式（这是你定下的规矩），
 * 但**显示之前必须先验**——把这个符号式解成数值，和本地算出来的浮点值比对，对不上就不用。
 * 因为模型给出的根号形式完全可能写错（把 2√3 写成 3√2），而那种错看起来很像答案。
 *
 * 这一段是纯计算，能在 node 里完全自检，所以放在标注功能的最前面做。
 */

export class SymbolicError extends Error {}

/**
 * 把模型常见的写法收拾成统一记号。
 * 模型很爱吐 LaTeX（\\frac{}{}、\\sqrt{}），这里一并兼容，免得为了一个写法差异就白白重算一次。
 */
export function normalizeExpr(raw: string): string {
  let s = raw.trim()
  s = s.replace(/\$\$?/g, '')
  s = s.replace(/\\[()]/g, '')
  // 先处理 \sqrt 再处理 \frac：\frac 的括号里常常套着 \sqrt{...}，
  // 而那条正则不认嵌套花括号，顺序反了就会漏掉。
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
  s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
  s = s.replace(/\\cdot|\\times/g, '*')
  s = s.replace(/[{}[\]]/g, (m) => (m === '{' || m === '[' ? '(' : ')'))
  s = s.replace(/[×⋅·✕⨯]/g, '*')
  s = s.replace(/[−–—]/g, '-')
  s = s.replace(/[（]/g, '(').replace(/[）]/g, ')')
  s = s.replace(/\s+/g, '')
  return s
}

type Tok = { k: 'num'; v: number } | { k: 'op'; v: string }

function tokenize(s: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      const text = s.slice(i, j)
      const v = Number(text)
      if (!Number.isFinite(v)) throw new SymbolicError(`看不懂这个数「${text}」`)
      out.push({ k: 'num', v })
      i = j
      continue
    }
    if ('+-*/^()'.includes(c) || c === '√') {
      out.push({ k: 'op', v: c })
      i++
      continue
    }
    if (c === 'π') {
      out.push({ k: 'num', v: Math.PI })
      i++
      continue
    }
    throw new SymbolicError(`不认识的符号「${c}」`)
  }
  return out
}

/** 解析一个算式。支持 + - * / ^、括号、根号、π，以及 2√3 这种隐式乘法。 */
export function parseExpr(input: string): number {
  const s = normalizeExpr(input)
  if (!s) throw new SymbolicError('表达式是空的')
  const toks = tokenize(s)
  let p = 0

  const peek = () => toks[p]
  const eat = (v: string) => {
    const t = toks[p]
    if (t && t.k === 'op' && t.v === v) {
      p++
      return true
    }
    return false
  }

  function expr(): number {
    let v = term()
    for (;;) {
      if (eat('+')) v += term()
      else if (eat('-')) v -= term()
      else return v
    }
  }

  function term(): number {
    let v = unary()
    for (;;) {
      if (eat('*')) v *= unary()
      else if (eat('/')) {
        const d = unary()
        if (d === 0) throw new SymbolicError('除数为零')
        v /= d
      } else {
        // 隐式乘法：2√3、2(1+√3)、(1+√2)(1−√2)
        const t = peek()
        if (t && (t.k === 'num' || (t.k === 'op' && (t.v === '√' || t.v === '(')))) v *= unary()
        else return v
      }
    }
  }

  function unary(): number {
    if (eat('-')) return -unary()
    if (eat('+')) return unary()
    return power()
  }

  function power(): number {
    const base = atom()
    if (eat('^')) return Math.pow(base, unary())
    return base
  }

  function atom(): number {
    const t = peek()
    if (!t) throw new SymbolicError('表达式不完整')
    if (t.k === 'num') {
      p++
      return t.v
    }
    if (t.k === 'op' && t.v === '√') {
      p++
      const inner = atom()
      if (inner < 0) throw new SymbolicError('根号里是负数')
      return Math.sqrt(inner)
    }
    if (t.k === 'op' && t.v === '(') {
      p++
      const v = expr()
      if (!eat(')')) throw new SymbolicError('括号没配对')
      return v
    }
    throw new SymbolicError(`这里不该出现「${t.v}」`)
  }

  const v = expr()
  if (p !== toks.length) throw new SymbolicError('表达式后面还有多余的东西')
  return v
}

export interface VerifyResult {
  ok: boolean
  /** 符号式解出来的数值（解析失败时没有） */
  value?: number
  reason?: string
}

/**
 * 反验：符号式解出来的值，必须和本地算出来的实测值一致。
 *
 * 容差按相对值算，且下限是 1 —— 这样「4 和 4.0000001」算通过，
 * 而「0.0001 和 0.0002」这种两个都接近零的情况也不会被误判成通过。
 */
export function verifySymbolic(expr: string, actual: number, relTol = 1e-6): VerifyResult {
  let value: number
  try {
    value = parseExpr(expr)
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
  if (!Number.isFinite(value)) return { ok: false, reason: '算出来不是一个有限的数' }
  const scale = Math.max(1, Math.abs(actual))
  if (Math.abs(value - actual) <= relTol * scale) return { ok: true, value }
  return {
    ok: false,
    value,
    reason: `符号式算出来是 ${value.toFixed(8)}，本地算出来是 ${actual.toFixed(8)}，对不上`,
  }
}
