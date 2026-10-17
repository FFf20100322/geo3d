/**
 * 离线用的 service worker。
 *
 * 它做两件事：
 *   1. 安装时把应用外壳（页面、脚本、样式）缓存下来；
 *   2. 之后每次请求先走缓存、再顺手更新 —— 这样**没网也能把应用打开**，
 *      打开之后所有本地功能（看已存的题、转 3D、拖点、标注、存图、导出）全都能用。
 *
 * **只有拍照识别、解题、查余额这三件事必须联网** —— 那要调云端模型，本地算不出来。
 * 所以离线时应用不会坏，只是那三个按钮要等有网。
 *
 * ⚠️ service worker 只在**安全上下文**里才装得上：
 *    - https:// 的站点（正式部署用的是这个）
 *    - http://localhost（本机开发）
 *    - APK 内部的自定义协议
 *    用 http://192.168.x.x 这种局域网地址访问时，浏览器不允许，装不上 ——
 *    那时候页面照常能用，只是离线打不开。
 */

const CACHE = 'geo3d-shell-v1'

// 装的时候缓存这几样。构建产物带着哈希文件名，没法在这里写死，
// 所以改成「运行时见到什么就缓存什么」—— 下面 fetch 里那条分支就是干这个的。
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 清掉旧版本的缓存，免得越攒越多
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  // 只处理自己的 GET 请求；别的（尤其是调模型接口的 POST）一律放行
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // 接口请求不缓存 —— 缓存了会拿到过期的余额、过期的模型回答
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const hit = await cache.match(req)
      // 先给缓存里的（离线时就有东西可给），同时后台去更新
      const fetching = fetch(req)
        .then((res) => {
          // 只缓存正常返回的，错误响应缓存下来会一直坏着
          if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone())
          return res
        })
        .catch(() => null)
      if (hit) return hit
      const fresh = await fetching
      if (fresh) return fresh
      // 完全没网、也没缓存过：导航请求给一个能看懂的页面，而不是浏览器的恐龙
      if (req.mode === 'navigate') {
        return new Response(
          `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
           <body style="background:#0f1319;color:#e6edf3;font:16px/1.7 system-ui;padding:32px">
           <h2>还没缓存到这一页</h2>
           <p>这一页之前没打开过，所以离线时取不到。</p>
           <p>连上网打开一次，以后就能离线看了。</p>
           <p style="color:#8b95a5">已经存过的题目不受影响：连上网打开一次之后，它们一直能看。</p>
           </body>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        )
      }
      return new Response('', { status: 504 })
    })(),
  )
})
