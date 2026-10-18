import { readdirSync } from 'node:fs'
import { tmpdir, userInfo } from 'node:os'
import { join } from 'node:path'

// Neovim puts its default --listen sockets in $TMPDIR/nvim.<user>/<random>/nvim.<pid>.0
export function findNvimSockets(): string[] {
  const roots = [process.env.XDG_RUNTIME_DIR, process.env.TMPDIR, tmpdir()].filter(Boolean) as string[]
  const sockets = new Set<string>()
  for (const root of roots) {
    const base = join(root, `nvim.${userInfo().username}`)
    let dirs: string[]
    try {
      dirs = readdirSync(base)
    } catch {
      continue
    }
    for (const dir of dirs) {
      try {
        for (const file of readdirSync(join(base, dir))) {
          if (/^nvim\.\d+\.0$/.test(file)) sockets.add(join(base, dir, file))
        }
      } catch {
        // Not a directory, or it vanished while we looked
      }
    }
  }
  return [...sockets]
}

function nvimExpr(socket: string, expr: string): string | null {
  const proc = Bun.spawnSync(['nvim', '--server', socket, '--remote-expr', expr], { stderr: 'ignore' })
  return proc.exitCode === 0 ? proc.stdout.toString().trim() : null
}

export const nvimColorscheme = (socket: string) => nvimExpr(socket, "get(g:, 'colors_name', 'default')")

// Sourcing the file directly works whether or not ~/.config/nvim is on the
// runtimepath, and re-runs it every time, unlike :colorscheme with a cache
export const nvimSource = (socket: string, file: string) =>
  nvimExpr(socket, `execute('source ${file.replace(/'/g, "''")}')`) !== null

export const nvimRestore = (socket: string, scheme: string) =>
  nvimExpr(socket, `execute('colorscheme ${scheme.replace(/'/g, "''")}')`) !== null

const tmux = (...args: string[]) => Bun.spawnSync(['tmux', ...args], { stderr: 'ignore' })

export const tmuxRunning = () => Bun.which('tmux') !== null && tmux('info').exitCode === 0

// The options our tmux theme sets, read back so they can be restored on exit
export function tmuxSnapshot(themeFile: string): [string, string][] {
  const options = [...themeFile.matchAll(/^set -g ([\w-]+) /gm)].map((m) => m[1])
  return options.map((option) => [option, tmux('show', '-gv', option).stdout.toString().trim()])
}

export const tmuxSource = (file: string) => tmux('source-file', file).exitCode === 0

export function tmuxRestore(snapshot: [string, string][]) {
  for (const [option, value] of snapshot) tmux('set', '-g', option, value)
}

// Ghostty re-reads its config on SIGUSR2. It only shows the live theme if the
// config says `theme = theme-forge-live`; otherwise this is a harmless reload.
export function ghosttyReload(): number {
  const proc = Bun.spawnSync(['pkill', '-USR2', '-x', 'ghostty'], { stderr: 'ignore' })
  return proc.exitCode === 0 ? 1 : 0
}
