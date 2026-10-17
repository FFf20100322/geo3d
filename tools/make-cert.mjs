/**
 * 生成一张**自签的 HTTPS 证书**，给局域网里的手机用。
 *
 * 为什么需要它：service worker（离线可用那套）只在**安全上下文**里才装得上，
 * 而局域网 `http://192.168.x.x` 不算安全上下文（`http://localhost` 才算）。
 * 想在手机上试离线，就得走 https。
 *
 * 几点取舍：
 *  · 自签证书浏览器会提示「不安全」，手机上选择继续访问就行 —— 自己用，够了。
 *  · 把**局域网 IP 写进 SAN**，手机按 IP 访问时才不至于直接拒绝。
 *  · 用 Git 自带的 openssl（Windows 上一般都有），不引入任何新依赖。
 *  · 证书和私钥都写在 .certs/，**已被 .gitignore 挡住** —— 私钥不该进仓库，
 *    而且每台机器的局域网 IP 不同，本来就该各生成各的。
 *
 * 用法：`pnpm cert`，然后 `pnpm dev` 就会自动带上 https（配置里有证书才开）。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'

const dir = '.certs'
const key = `${dir}/dev-key.pem`
const cert = `${dir}/dev-cert.pem`

/** 本机所有 IPv4 地址 —— 都写进 SAN，免得换个网段就要重新生成 */
function localIPv4() {
  const out = []
  for (const list of Object.values(networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address)
    }
  }
  return out
}

/** 找一个能用的 openssl —— Git for Windows 自带一个，PATH 里通常没有 */
function findOpenssl() {
  const candidates = [
    'openssl',
    'C:/Program Files/Git/usr/bin/openssl.exe',
    'C:/Program Files (x86)/Git/usr/bin/openssl.exe',
  ]
  for (const c of candidates) {
    try {
      execFileSync(c, ['version'], { stdio: 'ignore' })
      return c
    } catch {
      /* 试下一个 */
    }
  }
  return null
}

const ossl = findOpenssl()
if (!ossl) {
  console.error('找不到 openssl。装一个 Git for Windows 就有了（它自带 openssl）。')
  process.exit(1)
}

if (existsSync(key) && existsSync(cert) && !process.argv.includes('--force')) {
  console.log('证书已经在了（.certs/），不重复生成。要重做加 --force。')
  process.exit(0)
}

mkdirSync(dir, { recursive: true })
const ips = localIPv4()
const san = ['DNS:localhost', 'IP:127.0.0.1', ...ips.map((ip) => `IP:${ip}`)].join(',')

execFileSync(
  ossl,
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    key,
    '-out',
    cert,
    '-days',
    '825',
    '-subj',
    '/CN=Geo3D dev',
    '-addext',
    `subjectAltName=${san}`,
  ],
  { stdio: 'ignore' },
)

console.log(`证书已生成：${cert} + ${key}`)
console.log(`写进去的地址：${san}`)
if (ips.length) console.log(`手机上用 https://${ips[0]}:5173/ —— 提示「不安全」时选择继续访问`)
else console.log('没找到局域网 IP，手机可能访问不了；插上网线或连上 WiFi 再生成一次')

// 顺手写一份说明，免得下次忘了这张证书是干什么的
writeFileSync(
  `${dir}/README.txt`,
  [
    '这张证书是自签的，只为在本机局域网里跑 https。',
    '为什么要 https：service worker（离线可用）需要安全上下文，而局域网 http 不算。',
    '浏览器会提示「不安全」—— 自己用，继续访问即可。',
    '不要把它用到任何对外的地方。重新生成：pnpm cert --force',
  ].join('\n') + '\n',
)
