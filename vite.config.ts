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
  // **构建时带路径前缀，这是因为要部署到 GitHub Pages 的项目页**。
  // 项目页的地址是 https://<用户名>.github.io/geo3d/ —— 资源在 /geo3d/ 下面，
  // 构建出来的 index.html 里如果还写 /assets/... 就会 404（白屏）。
  // 本地开发仍然用 /，不然 `pnpm dev` 打开就找不到东西。
  base: command === 'build' ? '/geo3d/' : '/',
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
