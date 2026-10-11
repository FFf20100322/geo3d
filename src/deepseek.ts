/**
 * DeepSeek 接入层。
 * 模型名写死为 V4.1 Flash（`deepseek-flash`），不提供模型选择项 —— 它原生多模态，读图与推理同一个模型就够。
 * 官方文档：https://api-docs.deepseek.com/zh-cn/guides/vision
 */

// 带 .ts 后缀：这个模块要能被 node 直接导入跑自检
import { latexToPlain, normalizeMath } from './text.ts'

const BASE = 'https://api.deepseek.com'
const MODEL = 'deepseek-flash'
const KEY_STORE = 'geo3d.apiKey'

export class ApiError extends Error {
  // 刻意不用构造器参数属性：那种写法 node 的类型剥离模式跑不了，而这个模块要能被自检脚本直接导入
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const getKey = (): string => localStorage.getItem(KEY_STORE) ?? ''
export const setKey = (k: string): void => {
  localStorage.setItem(KEY_STORE, k.trim())
}

function explain(status: number, body: string): string {
  if (status === 401) return 'API Key 不对或已失效，去设置里重新填一次。'
  if (status === 402) return '账户余额不足，去 DeepSeek 平台充值后再试。'
  if (status === 429) return '请求太频繁被限流了，等几秒再试。'
  if (status >= 500) return `DeepSeek 服务端出错（${status}），等一会再试。`
  return `接口返回 ${status}：${body.slice(0, 200)}`
}

/** 用户主动取消。单独一个类型，因为取消不该被当成失败去重试。 */
export class CancelledError extends Error {
  constructor() {
    super('已取消')
    this.name = 'CancelledError'
  }
}

/**
 * 当前任务的取消信号。
 * 同一时刻只会有一条任务链在跑（单用户、单界面），所以用一个模块级变量最省事，
 * 不必把 signal 一层层加进每个函数的参数里。
 */
let currentSignal: AbortSignal | undefined
export function setAbortSignal(s: AbortSignal | undefined): void {
  currentSignal = s
}

async function request(path: string, body?: unknown): Promise<unknown> {
  const key = getKey()
  if (!key) throw new ApiError('还没有填 API Key，先去设置里填上。')

  let res: Response
  try {
    res = await fetch(BASE + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: currentSignal,
    })
  } catch (e) {
    // 取消要如实区分出来：当成网络错误会让用户以为是自己网的问题，而且会被重试循环白跑两轮
    if (e instanceof DOMException && e.name === 'AbortError') throw new CancelledError()
    if (e instanceof Error && e.name === 'AbortError') throw new CancelledError()
    // fetch 抛异常通常意味着网络断了或被浏览器拦下（跨域已实测放行，所以多半是网络）
    throw new ApiError('网络没通，检查一下手机的网络再试。')
  }

  if (!res.ok) throw new ApiError(explain(res.status, await res.text().catch(() => '')), res.status)
  return res.json()
}

export interface Balance {
  available: boolean
  lines: string[]
  /** 顶栏常驻显示用的简短金额，例如 ¥13.79 */
  summary: string
}

/** GET /user/balance —— 设置页与顶栏都用它 */
export async function fetchBalance(): Promise<Balance> {
  const data = (await request('/user/balance')) as {
    is_available?: boolean
    balance_infos?: { currency?: string; total_balance?: string; granted_balance?: string; topped_up_balance?: string }[]
  }
  const infos = data.balance_infos ?? []
  const first = infos[0]
  const symbol = first?.currency === 'USD' ? '$' : first?.currency === 'CNY' ? '¥' : `${first?.currency ?? ''} `
  return {
    available: !!data.is_available,
    lines: infos.map(
      (b) =>
        `${b.currency ?? ''} 可用 ${b.total_balance ?? '?'}（赠金 ${b.granted_balance ?? '0'}，充值 ${b.topped_up_balance ?? '0'}）`,
    ),
    summary: first ? `${symbol}${first.total_balance ?? '?'}` : '余额未知',
  }
}

/**
 * 把题面变成几何场景。
 * 只让它说「有哪些点」和「它们满足什么关系」，绝不让它给最终坐标 —— 坐标交给本地求解器算。
 * 因为让模型直接给坐标，它算错时你根本看不出来；而约束对不对，求解器一验就知道。
 */
const SCENE_SYSTEM = `你是高中立体几何的场景建模助手。用户给你一道题的题面文字，你把它变成一个可求解的几何场景。
你只负责说「有哪些点」和「它们满足什么关系」，不要给出最终坐标 —— 坐标由本地求解器算。

输出 json，格式示例：
{
  "points": [
    {"name":"A","kind":"free","at":[0,0,0]},
    {"name":"B","kind":"free","at":[2,0,0]},
    {"name":"D","kind":"free","at":[0,0,2]},
    {"name":"A1","kind":"free","at":[0,2,0]},
    {"name":"C","kind":"offset","of":["B","D","A"]},
    {"name":"G","kind":"midpoint","of":["B","C"]}
  ],
  "edges": [["A","B"],["B","C"],["C","A"]],
  "faces": [["A","B","C"],["A","B","B1","A1"]],
  "constraints": [
    {"kind":"distance","a":"A","b":"B","value":2},
    {"kind":"perpendicular","p":["A","B"],"q":["A","D"]},
    {"kind":"angle","at":"A","from":"A1","to":"B","value":60}
  ]
}

点的 name 一律用 ASCII 下标写法，例如 A1、B1、C1，不要写成 A₁ 或 A_1。
点的 kind 只能取这四种：
- free：自由点，必须给 at，是你估计的初始坐标。它只用来帮求解器落到正确的解上，可以很粗糙，
  但彼此的大致关系要接近真实（垂直的边要近似垂直，长的边要画长一点）。
- midpoint：中点，of 是线段两个端点。
- ratio：把线段按比例分点，of 是两个端点，t 是从第一个端点出发的比例，取值在 0 到 1 之间。
- offset：平移派生，P = A + B - C。棱柱的顶面顶点用它最省事，例如 B1 写成 {"kind":"offset","of":["B","A1","A"]}。
点的定义顺序必须是「先定义被引用的点」。

约束的 kind 只能取这八种：
- distance：|ab| = value
- equalDistance：|ab| = |cd|，用 ab 与 cd 两个数组给点
- angle：∠from-at-to = value，单位度，value 在 0 到 180 之间
- lineAngle：直线 p 与直线 q 的夹角 = value，单位度，取锐角，异面直线同样适用
- perpendicular：直线 p ⊥ 直线 q
- parallel：直线 p ∥ 直线 q
- perpLinePlane：直线 line ⊥ 平面 plane，plane 用三个点表示
- coplanar：四个点共面，用 pts 给四个点

要求：
- 把题面里给出的每一个已知条件都翻译成约束，一条不漏，也一条不多。
- 题面没说的绝对不要假设。不要因为「看起来像正方体」就补上所有棱相等 —— 那是编条件。
- edges 是要画出来的线段，faces 是要填色显示的多边形（顶点按顺序排，必须是真的共面）。
- 如果题目的条件超出这八种约束能表达的范围，直接返回 {"unsupported":"说明是哪一条表达不了"}，不要硬凑。`

/** 让模型产出一个场景 json。返回原始对象，解析与校验交给 scene.ts。 */
export async function buildScene(problemText: string, extra: string, effort: 'low' | 'high' | 'max'): Promise<unknown> {
  const ask = extra.trim()
    ? `题目：\n${problemText}\n\n另外补充或更正的条件（以这部分为准）：\n${extra}`
    : `题目：\n${problemText}`

  let lastReason = '没有拿到可用结果'
  for (let attempt = 1; attempt <= 2; attempt++) {
    const data = (await request('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SCENE_SYSTEM },
        { role: 'user', content: ask },
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: effort,
      max_tokens: 4000,
    })) as { choices?: { message?: { content?: string } }[] }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastReason = '接口返回了空内容'
      continue
    }
    try {
      return JSON.parse(content)
    } catch {
      lastReason = '返回的内容不是合法 json'
    }
  }
  throw new ApiError(`生成场景失败（${lastReason}）。`)
}

const SOLVE_SYSTEM = `你是高中数学立体几何的解题助手。用户给你题面，以及已经建好的图形里有哪些点。
你要做两件事：写清解题过程，并说明每一步在图上画了什么。

输出 json，格式示例：
{
  "steps": [
    {
      "title": "取 BD 的中点 O，连 AO",
      "text": "连接 BD、AO。因为 ABCD 是正方形，对角线互相平分，所以 O 是 BD 的中点。",
      "why": "正方形的对角线互相平分",
      "addPoints": [{"name":"O","kind":"midpoint","of":["B","D"]}],
      "addEdges": [["B","D"],["A","O"]],
      "uses": ["A","B","D"]
    }
  ],
  "answers": [{"label":"(1)","value":"4"}],
  "angles": [
    {"kind":"lineLine","p":["A","B"],"q":["A","D"],"label":"∠BAD","value":"90°","of":"degrees"},
    {"kind":"linePlane","line":["A1","C"],"plane":["A","B","D"],"label":"A₁C 与底面所成角","value":"√3/3","of":"cos"},
    {"kind":"dihedral","edge":["B","D"],"inA":"A1","inB":"A","label":"二面角 A₁-BD-A","value":"√6/3","of":"cos"}
  ]
}

关于步骤：
- 每一步只做一件事。title 写这一步做了什么，text 写清推理，why 写依据（定理名或一句话）。
- 题面里有几个小问就要全部答完，最后在 answers 里给出每个小问的最终结果。
- addPoints 只允许画「拿到已知点就能直接算出来」的辅助点，kind 只能取这五种：
  midpoint —— 中点，of 是两个端点；
  ratio —— 按比例分点，of 是两个端点，另给 t（0 到 1）；
  offset —— 平移派生 P = A + B - C，of 是三个点；
  perpFoot —— 从一点向一个平面作垂线的垂足，of 是 [起点, 平面上的三个点]；
  projLine —— 一点在一条直线上的射影，of 是 [起点, 直线上的两个点]。
  绝对不要用 free —— 解题步骤里不允许凭空插一个自由点，那等于偷偷改题目图形。
- addPoints 的 name 用 ASCII 写法（如 O、H、K、M1），不要写下标字符。
- addEdges 是要画出来的辅助线段，两个端点必须已经存在。
- uses 填这一步主要用到的已有元素名字，用来在图上高亮。
- 不要重复画题面本来就有的线段。

关于 angles：
- 把这道题里「值得在图上标出来的角」列出来，最多四个，只列解题真正用到的。
- 三种画法，kind 只能取这三个：
  lineLine —— 两条直线的夹角。p 与 q 各是两个点；两条线共点时角就画在公共点上，不共点时会自动平移到一起。
  linePlane —— 直线与平面所成角。line 是直线的两个端点，plane 是平面上三个不共线的点。
    注意：这个角画在「斜线」与「它在该平面上的射影」之间，射影线程序会自己补，你不用管。
  dihedral —— 二面角。edge 是棱的两个端点，inA 与 inB 分别是两个半平面内、不在棱上的点。
- label 写这个角叫什么（如 ∠BAD、θ、二面角 A₁-BD-A），value 写它的大小，of 说明 value 是度数还是余弦/正弦（degrees / cos / sin，缺省是 degrees）。
- value 会被程序自己算一遍来核对：对不上就不显示，所以宁可只写 label 不写 value，也不要猜一个数。
- 线面角与二面角默认不会画出来（要用户手动打开），但请照常列出来，把选择权留给用户。

如果这道题的解法超出了上面这些辅助线画法，直接返回 {"unsupported":"说明是哪一步表达不了"}，不要硬凑。`

/** 生成解题过程。points 是图中已有的点名，让模型只引用真实存在的点。 */
export async function solveProblem(
  problemText: string,
  extra: string,
  points: string[],
  effort: 'low' | 'high' | 'max',
): Promise<unknown> {
  const ask = [
    `题目：\n${problemText}`,
    extra.trim() ? `另外补充或更正的条件（以这部分为准）：\n${extra}` : '',
    `图中已有的点：${points.join('、')}\n只能引用这些点，或者你在前面步骤里新画出来的点。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  let lastReason = '没有拿到可用结果'
  for (let attempt = 1; attempt <= 2; attempt++) {
    const data = (await request('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SOLVE_SYSTEM },
        { role: 'user', content: ask },
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: effort,
      max_tokens: 6000,
    })) as { choices?: { message?: { content?: string } }[] }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastReason = '接口返回了空内容'
      continue
    }
    try {
      return JSON.parse(content)
    } catch {
      lastReason = '返回的内容不是合法 json'
    }
  }
  throw new ApiError(`生成解题过程失败（${lastReason}）。`)
}

export interface OcrResult {
  problemText: string
  /** 这道题里出现过的所有几何点名称，单独列出来供用户核对有没有漏下标 */
  points: string[]
  uncertain: string[]
}

export interface ProblemCandidate {
  /** 照片上印的题号，没有就按顺序编号 */
  label: string
  /** 开头一句话，用来让人认出是哪一道 */
  preview: string
  /** 归一化范围 [左, 上, 宽, 高]，取值 0-1；仅用于画提示框，不参与裁切 */
  box: [number, number, number, number] | null
}

const SPLIT_SYSTEM = `你是高中数学试卷的排版分析助手。用户会给你一张照片，照片里可能不止一道题。
任务：找出照片里所有完整的题目，按从上到下的顺序排列，不要遗漏。
每道题给出三项：
- label：照片上印的题号，照抄（例如 "3" 或 "12"）；没印题号就按顺序给 "1"、"2"…
- preview：这道题开头的一句话，最多 30 字，用来分辨是哪一道
- box：这道题在照片里的大致范围，归一化为 [左, 上, 宽, 高]，取值 0 到 1
注意：只找题目，不要找答案、解析、页眉页脚、页码。题面配的插图属于它所属的那道题。
输出 json，格式示例：
{"problems":[{"label":"3","preview":"如图，在正方体ABCD-A1B1C1D1中，E为BC的中点","box":[0.06,0.22,0.88,0.15]}]}`

/**
 * 把照片里的题目全部找出来，让用户点选一道。
 * 框只当提示用：识别时始终把整张照片交给模型，所以框不准也不会导致漏条件。
 */
export async function listProblems(imageDataUrl: string): Promise<ProblemCandidate[]> {
  let lastReason = '没有拿到可用结果'
  for (let attempt = 1; attempt <= 3; attempt++) {
    const data = (await request('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SPLIT_SYSTEM },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请找出这张照片里所有的题目。' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: 'low',
      max_tokens: 2000,
    })) as { choices?: { message?: { content?: string } }[] }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastReason = '接口返回了空内容'
      continue
    }
    try {
      const parsed = JSON.parse(content) as { problems?: unknown }
      if (!Array.isArray(parsed.problems)) {
        lastReason = '返回的 json 里没有 problems'
        continue
      }
      return parsed.problems
        .map((raw, i) => {
          const p = raw as { label?: unknown; preview?: unknown; box?: unknown }
          const box =
            Array.isArray(p.box) && p.box.length === 4
              ? (p.box.map(Number) as [number, number, number, number])
              : null
          return {
            label: String(p.label ?? i + 1),
            preview: String(p.preview ?? ''),
            box: box && box.every((n) => Number.isFinite(n)) ? box : null,
          }
        })
        .filter((p) => p.preview || p.label)
    } catch {
      lastReason = '返回的内容不是合法 json'
    }
  }
  throw new ApiError(`找题目时试了三次都没成功（${lastReason}）。换一张更清晰的照片再试。`)
}

const OCR_SYSTEM = `你是高中数学立体几何题的转写助手。用户会给你一张题目照片。
任务：把题目文字逐字转写出来，保留原有的字母、数字、符号与下标，例如 PA⊥平面ABCD、AB=2、∠BAD=60°、E为BC的中点。
下标是最要紧的地方，请特别注意：
- 字母右下角的标号必须转写出来，写成下标字符，例如 A₁、B₁、C₁、D₁。
- 绝对不要把下标丢掉写成 A、B、C —— 那样会把两个完全不同的点混成一个，整道题就全错了。
- 也不要写成 A1 或 A_1，统一用 A₁ 这种下标写法。
另外还要单独列一份点清单：
- points 里列出这道题出现过的所有几何点名称，每个只出现一次，按题面出现顺序排列。
- 这份清单是用来给用户核对有没有漏下标的，所以务必写全，包括带下标的点。
数学式子的写法（很要紧，用户要照着核对，读不懂就等于没识别）：
- 绝对不要用 LaTeX。不要写 \\frac、\\sqrt、\\overrightarrow、$ 这些，一律用普通字符。
- 分数写成 a/b，分子分母里有加减或根号时加括号，例如 1/|PQ|、√3/6、(a+b)/c。
- 绝对值就用竖线，例如 |PQ|。
- 向量写成「向量PQ」，例如 向量PQ · 向量PR。
- 根号写 √3 或 √(2+1)；角度写 60°；三角形写 △ABC；角写 ∠A。
- 上下标用下标字符，例如 A₁、x²。
其他要求：
- 题面配的插图可能不准，一律不要拿插图当已知条件，只认文字。
- 只转写，不要解题，不要补全你没看见的条件，不要改写措辞。
- 看不清或拿不准的地方不要猜，写进 uncertain 数组。
输出 json，格式示例：
{"problemText":"如图，在正方体ABCD-A₁B₁C₁D₁中，E为BC的中点。","points":["A","B","C","D","A₁","B₁","C₁","D₁","E"],"uncertain":["图中的一个数字看不清"]}`

/**
 * 读图取题面。转写属于低难度任务，用低推理档提速。
 * 官方承认 json 模式有概率返回空 content，所以最多试三次。
 * target 指定要转写哪一道：整张照片照旧全部交给模型，并在提示里说明不要漏掉分散的条件。
 */
export async function readProblem(imageDataUrl: string, target?: ProblemCandidate): Promise<OcrResult> {
  const ask = target
    ? `这张照片里有多道题。只转写第 ${target.label} 题，它开头是：「${target.preview}」。
注意：这道题的条件可能分散在相邻的几行里，紧接着的「(1)(2)」小问也属于这道题，全部都要转写，不要漏。`
    : '请转写这张照片里的题目。'

  let lastReason = '没有拿到可用结果'
  for (let attempt = 1; attempt <= 3; attempt++) {
    const data = (await request('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: OCR_SYSTEM },
        {
          role: 'user',
          content: [
            { type: 'text', text: ask },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: 'low',
      max_tokens: 2000,
    })) as { choices?: { message?: { content?: string } }[] }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      lastReason = '接口返回了空内容'
      continue
    }
    try {
      const parsed = JSON.parse(content) as { problemText?: unknown; points?: unknown; uncertain?: unknown }
      // 先过 LaTeX 转换再过排版规范化：书本上的分数、绝对值、向量箭头模型经常原样吐 LaTeX 回来，
      // 而题面是用户核对的第一道关，读不了就等于没识别。
      const problemText =
        typeof parsed.problemText === 'string' ? normalizeMath(latexToPlain(parsed.problemText.trim())) : ''
      if (problemText) {
        const points = Array.isArray(parsed.points)
          ? parsed.points.map((s) => normalizeMath(latexToPlain(String(s).trim())))
          : []
        // 点清单也兜一道：万一模型在 points 里漏了下标，从题面里再扫一遍带下标的点补上
        const found = problemText.match(/[A-Za-z][₀-₉]+/g) ?? []
        const merged = [...new Set([...points, ...found])]
        return {
          problemText,
          points: merged.filter(Boolean),
          uncertain: Array.isArray(parsed.uncertain) ? parsed.uncertain.map((s) => String(s)) : [],
        }
      }
      lastReason = '返回的 json 里没有题面文字'
    } catch {
      lastReason = '返回的内容不是合法 json'
    }
  }
  throw new ApiError(`试了三次都没成功（${lastReason}）。换一张更清晰、更近的照片再试。`)
}
