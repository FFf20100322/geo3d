/**
 * 电脑版（Electron）的主进程。
 *
 * **为什么要起一个本地小服务，而不是直接 loadFile：**
 * 页面里有三样东西在 `file://` 下会出问题 —— 模块脚本（type="module"）、
 * service worker、以及相对路径的 fetch。
 * 而在 `http://127.0.0.1:<随机端口>` 下**全都正常** —— 而且 **127.0.0.1 本身就是安全上下文**，
 * 所以离线那套 service worker 在 exe 里也能用，跟在公网上一样。
 *
 * 端口取 0（让系统分配空闲端口），避免跟别的程序抢端口。
 */
const { app, BrowserWindow, shell } = require('electron')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

// 打包后 dist 在 app.asar 里，用 process.resourcesPath 不一定对 —— Electron 的 asar 支持
// 让 fs 直接读 __dirname 下的文件，所以这里统一按 __dirname 推。
const ROOT = path.join(__dirname, '..', 'dist')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
}

function serve() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let url = '/'
      try {
        url = decodeURIComponent((req.url || '/').split('?')[0])
      } catch {
        /* 畸形 URL 就当根路径 */
      }
      let file = path.join(ROOT, url === '/' ? 'index.html' : url)
      // 目录穿越保护：请求路径必须落在 dist 里
      if (!path.resolve(file).startsWith(path.resolve(ROOT))) {
        res.writeHead(403)
        return res.end('forbidden')
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        // 单页应用：找不到的路径一律回 index.html
        file = path.join(ROOT, 'index.html')
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        // service worker 不能被缓存，否则改了代码还是旧的那份
        ...(file.endsWith('sw.js') ? { 'Cache-Control': 'no-cache' } : {}),
      })
      fs.createReadStream(file).pipe(res)
    })
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

let mainWindow = null

app.whenReady().then(async () => {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
    // 没构建就跑 exe 是最常见的坑，直接说清楚，别给一个白屏
    const { dialog } = require('electron')
    dialog.showErrorBox('还没构建页面', '先运行 pnpm build 生成 dist/，再启动电脑版。')
    app.quit()
    return
  }

  const port = await serve()
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0f1319',
    title: 'Geo3D · 高中立体几何',
    autoHideMenuBar: true,
    webPreferences: {
      // 页面自己就能调 DeepSeek 接口，不需要任何 Node 能力 —— 关掉更安全
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  mainWindow.loadURL(`http://127.0.0.1:${port}/`)

  // 页面里如果有人点了外链，用系统浏览器打开，别在 app 窗口里跳走
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
