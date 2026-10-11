/**
 * 本地备份。每一轮做完跑一次（`pnpm backup`）。
 *
 * 为什么要单独做这件事：git 只能防「改错了想退回」，防不了「整个目录被弄坏、误删、磁盘出问题」。
 * 用户明确要求本地留一份，并且出问题时优先用本地备份退回，所以这里做两份：
 *
 *   最新/            完整仓库副本（连 .git 一起），随时能直接打开继续用
 *   历史/<时间戳>/    每次有变化就存一份，保留最近 20 份
 *
 * 刻意不备份 node_modules 与 dist：它们能靠 pnpm install 与构建完全恢复，备份它们只是白占地方。
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const SRC = resolve(process.argv[2] ?? '.')
const DST = resolve(process.argv[3] ?? 'F:/DSH项目备份/高中立体几何')
const KEEP = 20
const SKIP = new Set(['node_modules', 'dist', '.phone'])

const 最新 = join(DST, '最新')
const 历史 = join(DST, '历史')

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

/** 源目录里参与备份的东西（跳过 node_modules 之类） */
function entries(dir) {
  return readdirSync(dir).filter((n) => !SKIP.has(n))
}

/** 把源码树拷到目标目录；目标已存在就先清掉，保证是干净的一份 */
function copyTree(to) {
  rmSync(to, { recursive: true, force: true })
  mkdirSync(to, { recursive: true })
  for (const name of entries(SRC)) {
    cpSync(join(SRC, name), join(to, name), { recursive: true, filter: (src) => !SKIP.has(src.split(/[\\/]/).pop()) })
  }
}

/** 当前状态指纹：文件清单 + 大小 + 修改时间。用来判断这一轮到底有没有变化 */
function fingerprint(dir) {
  const parts = []
  const walk = (d, rel) => {
    for (const name of readdirSync(d).sort()) {
      if (SKIP.has(name)) continue
      const full = join(d, name)
      const r = rel ? `${rel}/${name}` : name
      const st = statSync(full)
      if (st.isDirectory()) walk(full, r)
      else parts.push(`${r}:${st.size}:${Math.round(st.mtimeMs)}`)
    }
  }
  walk(dir, '')
  return parts.join('\n')
}

mkdirSync(DST, { recursive: true })

// 每次备份前先把当前 git 状态记下来，方便回退时知道对应哪一次提交
let gitInfo = '(这个目录不是 git 仓库)'
try {
  const head = execFileSync('git', ['-C', SRC, 'log', '-1', '--pretty=%h %s'], { encoding: 'utf8' }).trim()
  const dirty = execFileSync('git', ['-C', SRC, 'status', '--porcelain'], { encoding: 'utf8' }).trim()
  gitInfo = `${head}\n${dirty ? `（有未提交的改动）\n${dirty}` : '（工作区干净）'}`
} catch {
  // 没有 git 也不影响备份
}

const changed = !existsSync(最新) || fingerprint(SRC) !== fingerprint(最新)
copyTree(最新)
writeFileSync(join(DST, '备份说明.txt'), `这是「高中立体几何 3D 助手」的本地备份。\n\n最新的完整仓库在「最新」目录里，可以直接打开使用。\n「历史」目录按时间保留了近 ${KEEP} 份快照，用于退回。\n\n本次备份对应的提交：\n${gitInfo}\n\n备份时间：${new Date().toLocaleString('zh-CN')}\n`)

let made = '未发现变化，只刷新了「最新」'
if (changed) {
  const dir = join(历史, stamp())
  copyTree(dir)
  made = `已新增历史快照 ${dir}`
  // 只留最近 KEEP 份
  const all = readdirSync(历史).sort()
  for (const old of all.slice(0, Math.max(0, all.length - KEEP))) {
    rmSync(join(历史, old), { recursive: true, force: true })
    console.log(`清掉过旧的快照 ${old}`)
  }
}

const size = (d) => {
  let total = 0
  const walk = (p) => {
    for (const n of readdirSync(p)) {
      const full = join(p, n)
      const st = statSync(full)
      if (st.isDirectory()) walk(full)
      else total += st.size
    }
  }
  walk(d)
  return (total / 1024).toFixed(1)
}

console.log(`源目录：${SRC}`)
console.log(`备份到：${DST}`)
console.log(made)
console.log(`最新：${size(最新)} KB　　历史快照数：${existsSync(历史) ? readdirSync(历史).length : 0}`)
console.log(`对应提交：${gitInfo.split('\n')[0]}`)
