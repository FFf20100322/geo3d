import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

// host: true —— 手机连同一 WiFi 时可以直接用电脑的局域网 IP 打开，不必等打包 APK
//
// **HTTPS 是可选的，证书有了才开。**
//
// 为什么要 HTTPS：service worker（离线可用的那套）只在**安全上下文**里才装得上，
// 而局域网 http://192.168.x.x **不算**安全上下文（http://localhost 才算）。
// 所以想在手机上试离线，就必须走 https —— 用户也明确说了可以做。
//
// 证书用 `pnpm cert` 生成（自签名，把局域网 IP 写进 SAN，手机浏览器会提示「不安全」，
// 选择继续访问即可）。**证书与私钥不进仓库**（.gitignore 里挡着）——
// 私钥不该提交，而且每台机器的局域网 IP 不一样，本来就该各生成各的。
const keyPath = '.certs/dev-key.pem'
const certPath = '.certs/dev-cert.pem'
const hasCert = existsSync(keyPath) && existsSync(certPath)

export default defineConfig(({ command }) => ({
  // **默认 base 必须是 `/`，不能写死成 `/geo3d/`。**
  // 这里踩过一个会让 APK 白屏的坑：为了 GitHub Pages 的项目页
  // （https://<用户名>.github.io/geo3d/，资源在 /geo3d/ 下），曾经把构建前缀
  // 写死成 '/geo3d/' —— 而 APK 里页面在根路径，`/geo3d/assets/xxx.js` 一律 404，
  // 打出来的包一打开就是白屏。
  //
  // 所以改成：普通构建用 '/'（APK、exe、本地都靠它），
  // 只有发网页版时才用 `pnpm build:pages`（命令行 `--base=/geo3d/` 覆盖这里）。
  base: command === 'build' ? '/' : '/',
  server: {
    host: true,
    port: 5173,
    ...(hasCert
      ? {
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        }
      : {}),
  },
  build: { target: 'es2022' },
}))
