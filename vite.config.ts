import { defineConfig } from 'vite'

// host: true —— 手机连同一 WiFi 时可以直接用电脑的局域网 IP 打开，不必等打包 APK
export default defineConfig({
  server: { host: true, port: 5173 },
  build: { target: 'es2022' },
})
