/**
 * 一次性录制脚本：只录页面像素，不录桌面。
 *
 * 不用 gdigrab / 录屏软件：那会把桌面、任务栏、通知一起录进去。
 * 这里连浏览器调试端口，只拿页面渲染帧 —— 桌面像素不进这条管道。
 *
 * 用法：
 *   node rec.mjs --url http://localhost:5173/ --secs 20 --actions acts/c3.json --out raw/c3.mp4
 *
 * actions JSON：[{"at":1.2,"js":"__clickText('正方体')"}]
 *   页面内可用：__clickId(id) __clickText(文字) __setText(id,值) __scroll(y) __drag(id,dx,dy)
 *
 * 帧率不固定（截图耗时），每帧记真实时间戳，最后用 concat duration 还原节奏。
 */
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (name, def) => {
  const i = args.indexOf('--' + name)
  return i >= 0 ? args[i + 1] : def
}

const URL = arg('url', 'http://localhost:5173/')
const SECS = Number(arg('secs', '20'))
const OUT = path.resolve(arg('out', 'raw/out.mp4'))
const ACTIONS_FILE = arg('actions', '')
const FPS = Number(arg('fps', '12'))
const PORT = Number(arg('port', '9222'))
const W = Number(arg('w', '1920'))
const H = Number(arg('h', '1080'))
const CHROME = arg('chrome', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
const FFMPEG = arg('ffmpeg', 'D:/FormatFactory/ffmpeg.exe')
const HEADLESS = arg('headless', '1') === '1'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const profileDir = path.resolve(`.edge-${PORT}`)
rmSync(profileDir, { recursive: true, force: true })
const child = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${W},${H}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-sync',
    '--disable-features=Translate,MediaRouter',
    '--mute-audio',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    ...(HEADLESS ? ['--headless=new'] : []),
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let wsUrl = null
for (let i = 0; i < 80; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()
    wsUrl = j.webSocketDebuggerUrl
    if (wsUrl) break
  } catch {
    /* 还没起来 */
  }
  await sleep(250)
}
if (!wsUrl) {
  console.error('浏览器调试端口没起来')
  child.kill()
  process.exit(1)
}

const ws = new WebSocket(wsUrl)
await new Promise((res, rej) => {
  ws.onopen = res
  ws.onerror = rej
})

let nextId = 1
const pending = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
  }
}
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = nextId++
    pending.set(id, { res, rej })
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const S = (m, p) => send(m, p, sessionId)

await S('Page.enable')
await S('Runtime.enable')
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
await S('Page.navigate', { url: URL })

for (let i = 0; i < 80; i++) {
  const { result } = await S('Runtime.evaluate', {
    expression: 'document.readyState === "complete" && !!document.body',
    returnByValue: true,
  })
  if (result?.value) break
  await sleep(250)
}
await sleep(1500)

await S('Runtime.evaluate', {
  expression: `
window.__clickId = (id) => { const e = document.getElementById(id); if (!e) return 'noid:' + id; e.click(); return 'ok:' + id; };
window.__clickText = (t) => {
  const all = [...document.querySelectorAll('button,a,[role="button"],div,li,span')]
    .filter(e => e.offsetParent !== null && !['BODY','HTML'].includes(e.tagName));
  const hits = all.filter(e => (e.textContent || '').trim().includes(t));
  if (!hits.length) return 'nohit:' + t;
  const deepest = hits.sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[hits.length - 1] || hits[0];
  let node = deepest;
  for (let k = 0; k < 4 && node; k++) {
    if (node.tagName === 'BUTTON' || node.getAttribute?.('role') === 'button' || node.onclick) { node.click(); return 'ok'; }
    node = node.parentElement;
  }
  deepest.click();
  return 'ok-deep';
};
window.__setText = (id, v) => { const e = document.getElementById(id); if (!e) return 'noid'; e.value = v; e.dispatchEvent(new Event('input', {bubbles:true})); return 'ok'; };
window.__scroll = (y) => { window.scrollTo(0, y); return 'ok'; };
window.__drag = (id, dx, dy, steps) => {
  const el = document.getElementById(id) || document.querySelector(id);
  if (!el) return 'noid';
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const fire = (type, cx, cy) => {
    const ev = new PointerEvent(type, { clientX: cx, clientY: cy, bubbles: true, pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: 1 });
    el.dispatchEvent(ev);
    document.elementFromPoint(cx, cy)?.dispatchEvent(ev);
  };
  fire('pointerdown', x, y);
  const n = steps || 12;
  for (let i = 1; i <= n; i++) fire('pointermove', x + (dx * i) / n, y + (dy * i) / n);
  fire('pointerup', x + dx, y + dy);
  return 'dragged';
};
'ready'`,
  returnByValue: true,
})

const actions = ACTIONS_FILE && existsSync(ACTIONS_FILE) ? JSON.parse(readFileSync(ACTIONS_FILE, 'utf8')) : []
const queue = [...actions].sort((a, b) => a.at - b.at)

async function runAction(a) {
  try {
    const r = await S('Runtime.evaluate', { expression: a.js, returnByValue: true, awaitPromise: true })
    const v = r?.result?.value ?? r?.exceptionDetails?.text ?? ''
    console.log(`  [${a.at}s] ${a.js.slice(0, 46)} -> ${JSON.stringify(v)}`)
  } catch (e) {
    console.log(`  [${a.at}s] ERROR ${e.message}`)
  }
}

const frameDir = OUT.replace(/\.mp4$/, '-frames')
rmSync(frameDir, { recursive: true, force: true })
mkdirSync(frameDir, { recursive: true })
mkdirSync(path.dirname(OUT), { recursive: true })

const t0 = Date.now()
const frames = []
while (true) {
  const now = (Date.now() - t0) / 1000
  if (now >= SECS) break
  while (queue.length && queue[0].at <= now) await runAction(queue.shift())

  const shotStart = Date.now()
  const shot = await S('Page.captureScreenshot', { format: 'jpeg', quality: 88, fromSurface: true })
  const name = String(frames.length).padStart(5, '0') + '.jpg'
  writeFileSync(path.join(frameDir, name), Buffer.from(shot.data, 'base64'))
  frames.push({ file: path.join(frameDir, name), at: (Date.now() - t0) / 1000 })

  const spent = Date.now() - shotStart
  const budget = 1000 / FPS
  if (spent < budget) await sleep(budget - spent)
}

const lastAt = frames.length ? frames[frames.length - 1].at : SECS
const lines = []
for (let i = 0; i < frames.length; i++) {
  const end = i + 1 < frames.length ? frames[i + 1].at : lastAt + 0.15
  const dur = Math.max(0.02, end - frames[i].at)
  lines.push(`file '${frames[i].file.replace(/\\/g, '/')}'`, `duration ${dur.toFixed(4)}`)
}
if (frames.length) lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`)
const listFile = path.join(frameDir, 'list.txt')
writeFileSync(listFile, lines.join('\n') + '\n', 'utf8')

execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, '-fps_mode', 'vfr', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', OUT], { stdio: 'inherit' })

ws.close()
child.kill()
await sleep(400)
rmSync(profileDir, { recursive: true, force: true })

console.log(`完成：${frames.length} 帧 -> ${OUT}`)
