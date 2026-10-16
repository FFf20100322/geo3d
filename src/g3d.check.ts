import { buildG3d, G3D_MAGIC, parseG3d, suggestFileName, G3dError } from './g3d.ts'
import { DEMO_PROBLEM, DEMO_SCENE, DEMO_SOLUTION } from './demo.ts'
import { parseScene } from './scene.ts'
import { parseSolution } from './solution.ts'
import type { HistoryRecord } from './history.ts'

/**
 * `.g3d` 打包/解包的自检。
 *
 * 为什么必须测：打包最容易出的错是「看着导出成功了，其实少了一样东西」——
 * 少一张原图、少了补充的条件、或者解题过程被丢掉了。
 * 这种错在导出那一刻完全看不出来，要等到**别人拿到文件打开**才发现 —— 那时已经晚了。
 * 所以这里逐项核对：打包再解开，每一样都必须还在。
 */

let failed = 0
const ok = (label: string, pass: boolean, extra = '') => {
  console.log(`${pass ? '  ✓' : '  ✗'} ${label}${extra ? `　${extra}` : ''}`)
  if (!pass) failed++
}
const throws = (label: string, fn: () => unknown) => {
  try {
    fn()
    ok(label, false, '没有报错')
  } catch (e) {
    ok(label, e instanceof G3dError, e instanceof Error ? e.message : String(e))
  }
}

console.log('【.g3d 打包与解包】')

// 造一条「什么都有」的存档：原图、缩略图、补充条件、场景、解答，一样不缺
const scene = parseScene(DEMO_SCENE)
const record: HistoryRecord = {
  id: 'local-123',
  savedAt: 1750000000000,
  problemText: DEMO_PROBLEM,
  extra: '补充：AB = 2',
  thumbnail: 'data:image/png;base64,AAAA',
  image: 'data:image/png;base64,BBBB',
  scene,
  solution: parseSolution(DEMO_SOLUTION, scene),
}

const text = buildG3d(record, '9.9.9-test')

// ---- 逐项核对：每一样都得在 ----
{
  const back = parseG3d(text)
  ok('题面一模一样', back.problemText === record.problemText)
  ok('补充的条件还在', back.extra === record.extra, back.extra)
  ok('原图还在', back.image === record.image)
  ok('缩略图还在', back.thumbnail === record.thumbnail)
  ok('图形还在且能解析', !!back.scene && back.scene.points.length === scene.points.length, back.scene ? `${back.scene.points.length} 个点` : '没了')
  ok(
    '解题过程还在且步数一致',
    !!back.solution && back.solution.steps.length === record.solution!.steps.length,
    back.solution ? `${back.solution.steps.length} 步` : '没了',
  )
}

// ---- 不该带出去的东西：本机的编号 ----
{
  const f = JSON.parse(text) as { record: { id: string }; magic: string; version: number }
  ok('文件头标记正确', f.magic === G3D_MAGIC)
  ok('带了版本号', typeof f.version === 'number')
  ok('本机编号没有被带出去（导到别人那里要重新分配）', f.record.id === '')
  ok('导入后拿到的是一个全新的编号（由存档层分配）', parseG3d(text).id === '')
}

// ---- 往返一趟：再打包再解开，内容应当一致（不能越传越少） ----
{
  const once = parseG3d(text)
  const twice = parseG3d(buildG3d(once))
  ok('打包→解开→再打包→再解开，题面仍一致', twice.problemText === once.problemText)
  ok('往返之后步数也没变少', twice.solution?.steps.length === once.solution?.steps.length)
}

// ---- 坏文件必须被拒，而且要说清哪里不对 ----
{
  throws('不是 JSON 就拒掉', () => parseG3d('这不是 json'))
  throws('是 JSON 但没有标记就拒掉', () => parseG3d('{"hello":1}'))
  throws('标记不对就拒掉', () => parseG3d('{"magic":"other","version":1,"record":{}}'))
  throws('版本比当前新就拒掉（并说明是更新版本导出的）', () =>
    parseG3d(JSON.stringify({ magic: G3D_MAGIC, version: 999, record: { problemText: 'x' } })),
  )
  throws('没有题面就拒掉', () => parseG3d(JSON.stringify({ magic: G3D_MAGIC, version: 1, record: {} })))
  throws('题面是空白也拒掉', () =>
    parseG3d(JSON.stringify({ magic: G3D_MAGIC, version: 1, record: { problemText: '   ' } })),
  )
  // 场景结构不对：不能「结构像就收下」
  throws('图形结构不对就拒掉', () =>
    parseG3d(
      JSON.stringify({
        magic: G3D_MAGIC,
        version: 1,
        record: { problemText: 'x', scene: { points: 'not-an-array' } },
      }),
    ),
  )
}

// ---- 只有文字（还没生成过 3D）的题也要能打包 ----
{
  const textOnly: HistoryRecord = {
    id: '',
    savedAt: Date.now(),
    problemText: '只有文字的一道题',
    extra: '',
  }
  const back = parseG3d(buildG3d(textOnly))
  ok('只有文字的题也能打包解开', back.problemText === '只有文字的一道题' && back.scene === undefined)
}

// ---- 文件名 ----
{
  const name = suggestFileName({ ...record, problemText: '如图，正方体 ABCD-A₁B₁C₁D₁ 中：AB/2 = 3？' })
  ok('文件名以 .g3d 结尾', name.endsWith('.g3d'), name)
  ok(
    '文件名里没有非法字符（斜杠、问号这些在安卓与 Windows 上都不行）',
    !/[\\/:*?"<>|]/.test(name),
    name,
  )
  ok('文件名带了日期，一堆文件里认得出先后', /\d{8}/.test(name), name)
}

console.log(`\n${failed === 0 ? '✓ 全部通过' : `✗ ${failed} 项未通过`}`)
if (failed > 0) process.exit(1)
