import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { LIVE_PORT, LIVE_SLUG, startLive } from './server'

const ROOT = join(import.meta.dir, '../..')

type Options = { home: string; port?: string; open: boolean; isRealHome: boolean }

export function live({ home, port, open, isRealHome }: Options) {
  const dist = join(ROOT, 'dist')
  if (!existsSync(join(dist, 'index.html'))) {
    console.log('Building the web app first...')
    const build = Bun.spawnSync(['bun', 'run', 'build'], { cwd: ROOT, stdout: 'ignore', stderr: 'inherit' })
    if (build.exitCode !== 0) throw new Error('Web app build failed')
  }

  const session = startLive({
    home,
    dist,
    port: port ? Number(port) : LIVE_PORT,
    // Signalling Ghostty affects the real app, so not when --home is a sandbox
    reloadGhostty: isRealHome,
  })

  console.log(`Live sync running at ${session.url}

Edit colors there and these update as you drag:
  Neovim   every running instance, no setup needed
  tmux     the running server, no setup needed
  Ghostty  add \`theme = ${LIVE_SLUG}\` to ~/.config/ghostty/config once

Ctrl+C puts Neovim and tmux back the way they were.`)

  if (open) Bun.spawn(['open', session.url])

  process.on('SIGINT', () => {
    session.restore()
    console.log('\nRestored Neovim and tmux. Live theme files are left in place.')
    process.exit(0)
  })
}
