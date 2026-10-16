/**
 * 用本机已装的 Chrome 打开网页、精确点击、截图。
 *
 * 为什么自己写一个：
 * - DSH 自带的浏览器插件要一个 Electron 二进制，这台机器上没有；而 Chrome 是现成的。
 * - 更要紧的是**点击要准**。用手机 adb 点，坐标要靠截图估算，我已经连着点错好几次；
 *   这里用 CSS 选择器点，点不到就报错，不会「点歪了还以为点对了」。
 *
 * 用法：
 *   node tools/webdrive.mjs --url http://192.168.1.11:5173/ --shot out.png
 *   node tools/webdrive.mjs --url ... --shot out.png --click "#btn-3d" --click "text=翻折" --wait 800
 *   node tools/webdrive.mjs --url ... --shot out.png --eval "location.reload()" --wait 3000
 *
 * 选择器支持三种写法：
 *   #id / .class / 任意 CSS   —— 直接当 CSS 选择器
 *   text=翻折                 —— 按可见文字找（先精确、再包含），找到后点它的最近可点祖先
 *   //xpath                   —— 用 XPath
 *
 * 每一步都会打印「点了什么、找到了几个」，**找不到就退出并报错**，不静默跳过。
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/Application/chrome.exe'
const PORT = 9223

// ---- 命令行参数 ----
const argv = process.argv.slice(2)
const arg = (name, fallback = undefined) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const allArgs = (name) => argv.map((a, i) => (a === `--${name}` ? argv[i + 1] : null)).filter(Boolean)

const url = arg('url')
const shot = arg('shot', 'out.png')
const waitMs = Number(arg('wait', 2500))
const clicks = allArgs('click')
const evals = allArgs('eval')
const drags = allArgs('drag')
// 手机视口：`--phone` 用默认尺寸，或 `--phone 412x915x2.6`
const phoneArg = arg('phone', null)
const phone = (() => {
  if (phoneArg === null && !argv.includes('--phone')) return null
  const m = /^(\d+)x(\d+)(?:x([\d.]+))?$/.exec(phoneArg ?? '')
  return m
    ? { w: +m[1], h: +m[2], dpr: m[3] ? +m[3] : 2.6 }
    : { w: 412, h: 915, dpr: 2.6 } // 默认按常见安卓机
})()
if (!url) {
  console.error('必须给 --url')
  process.exit(2)
}

const profile = resolve(tmpdir(), `geo3d-webdrive-${Date.now()}`)
mkdirSync(profile, { recursive: true })

// --headless=new + swiftshader：无头模式下 three.js 要靠软件渲染，不给这个参数画布是黑的
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  '--enable-unsafe-swiftshader',
  '--use-gl=swiftshader',
  '--window-size=1280,2200',
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 等 CDP 端口起来 */
async function findTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
    } catch {
      /* 还没起来 */
    }
    await sleep(250)
  }
  throw new Error('Chrome 的调试端口一直没起来')
}

/** 极简 CDP 客户端：够用就好，不引依赖 */
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve: res, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(JSON.stringify(msg.error)))
      else res(msg.result)
    }
  })
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', () => rej(new Error('连不上调试端口')))
  })
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const myId = ++id
      pending.set(myId, { resolve: res, reject: rej })
      ws.send(JSON.stringify({ id: myId, method, params }))
    })
  return { ready, send, close: () => ws.close() }
}

/** 在页面里跑一段 JS，返回它的值；抛错就把错误原样带出来 */
async function run(send, expression) {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? '页面里报错了')
  return r.result?.value
}

/** 把「text=...」这类简写变成一段在页面里跑的查找 + 点击代码 */
function clickExpression(sel) {
  const finder = sel.startsWith('//')
    ? `document.evaluate(${JSON.stringify(sel)}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`
    : sel.startsWith('text=')
      ? `(() => {
          const want = ${JSON.stringify(sel.slice(5))};
          const all = [...document.querySelectorAll('button,a,div,span,li,label')];
          const visible = all.filter((el) => el.offsetParent !== null && el.textContent.trim());
          // 先找文字完全相同的，再找包含的；都取**最内层**那个，免得点到外面的大容器
          const exact = visible.filter((el) => el.textContent.trim() === want);
          const pool = exact.length ? exact : visible.filter((el) => el.textContent.includes(want));
          if (!pool.length) return null;
          return pool.sort((a, b) => a.textContent.length - b.textContent.length)[0];
        })()`
      : `document.querySelector(${JSON.stringify(sel)})`

  return `(() => {
    const el = ${finder};
    if (!el) return 'NOT_FOUND';
    const target = el.closest('button,a,[role=button]') ?? el;
    target.click();
    return 'CLICKED:' + (target.textContent || target.id || target.tagName).trim().slice(0, 30);
  })()`
}

try {
  const page = await findTarget()
  const { ready, send, close } = connect(page.webSocketDebuggerUrl)
  await ready
  await send('Page.enable')
  await send('Runtime.enable')

  // 手机视口：给 --phone 就按手机的尺寸与像素密度渲染。
  // 不这么做的话，页面按桌面宽度排版（例如「问」和「解法」两组会并排），
  // 看不出在手机上到底挤不挤 —— 而**手机上才是真正要用的地方**。
  if (phone) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: phone.w,
      height: phone.h,
      deviceScaleFactor: phone.dpr,
      mobile: true,
    })
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  }

  await send('Page.navigate', { url })
  await sleep(waitMs)

  for (const [i, sel] of clicks.entries()) {
    const out = await run(send, clickExpression(sel))
    if (out === 'NOT_FOUND') throw new Error(`第 ${i + 1} 次点击找不到目标：${sel}`)
    console.log(`点击 ${i + 1}：${sel} → ${out}`)
    await sleep(1200) // 点完等界面反应，**必须等**，不然截到的是没反应的画面
  }

  for (const [i, e] of evals.entries()) {
    const out = await run(send, e)
    console.log(`执行 ${i + 1}：${e} → ${out === undefined ? 'ok' : JSON.stringify(out)}`)
    await sleep(1200)
  }

  // 拖拽：`--drag x1,y1,x2,y2`。用 CDP 的鼠标事件序列 ——
  // 开了触摸模拟之后，Chrome 会把它们合成 pointer 事件，正好是应用监听的。
  // 分多步移动，而不是一步跳过去：应用里有些判定看的是移动距离。
  for (const [i, spec] of drags.entries()) {
    const [x1, y1, x2, y2] = spec.split(',').map(Number)
    if ([x1, y1, x2, y2].some((n) => !Number.isFinite(n))) throw new Error(`--drag 格式应是 x1,y1,x2,y2：${spec}`)
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', clickCount: 1 })
    const steps = 12
    for (let k = 1; k <= steps; k++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: x1 + ((x2 - x1) * k) / steps,
        y: y1 + ((y2 - y1) * k) / steps,
        button: 'left',
        buttons: 1,
      })
      await sleep(40)
    }
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', clickCount: 1 })
    console.log(`拖拽 ${i + 1}：(${x1},${y1}) → (${x2},${y2})`)
    await sleep(1000)
  }

  const shotPath = resolve(shot)
  mkdirSync(dirname(shotPath), { recursive: true })
  const img = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  writeFileSync(shotPath, Buffer.from(img.data, 'base64'))
  console.log(`截图：${shotPath}`)

  // 顺手把页面上的报错捞出来 —— 画布是黑的、界面没反应时，往往这里才有线索
  const errs = await run(send, `window.__errs ? window.__errs.join(' | ') : '(没装错误收集)'`)
  if (errs && errs !== '(没装错误收集)') console.log(`页面报错：${errs}`)

  close()
} finally {
  chrome.kill()
  await sleep(300)
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    /* 临时目录删不掉就算了 */
  }
}
