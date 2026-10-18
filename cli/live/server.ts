import type { ServerWebSocket } from 'bun'
import { join } from 'node:path'
import { parsePalette, type Palette } from '../../src/core/palette'
import { ghostty } from '../../src/targets/ghostty'
import { neovim } from '../../src/targets/neovim'
import { tmux } from '../../src/targets/tmux'
import {
  findNvimSockets,
  ghosttyReload,
  nvimColorscheme,
  nvimRestore,
  nvimSource,
  tmuxRestore,
  tmuxRunning,
  tmuxSnapshot,
  tmuxSource,
} from './reload'

export const LIVE_SLUG = 'theme-forge-live'
export const LIVE_PORT = 4747

// The dev server and the live server itself. Anything else (another website
// open in your browser) is refused before it can write a single file.
const ALLOWED_ORIGINS = new Set(
  [LIVE_PORT, 5179].flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`]),
)

export type LiveStatus = { tool: string; detail: string }[]

type Options = { home: string; port: number; dist: string; reloadGhostty: boolean }

export function startLive({ home, port, dist, reloadGhostty }: Options) {
  const files = {
    ghostty: join(home, ghostty.path(LIVE_SLUG)),
    neovim: join(home, neovim.path(LIVE_SLUG)),
    tmux: join(home, tmux.path(LIVE_SLUG)),
  }

  // What each tool looked like before we started, keyed by nvim socket
  const nvimBefore = new Map<string, string>()
  let tmuxBefore: [string, string][] | null = null

  async function apply(palette: Palette): Promise<LiveStatus> {
    await Bun.write(files.ghostty, ghostty.render(palette, LIVE_SLUG))
    await Bun.write(files.neovim, neovim.render(palette, LIVE_SLUG))
    const tmuxTheme = tmux.render(palette, LIVE_SLUG)
    await Bun.write(files.tmux, tmuxTheme)

    const status: LiveStatus = []

    let nvimCount = 0
    for (const socket of findNvimSockets()) {
      if (!nvimBefore.has(socket)) {
        const scheme = nvimColorscheme(socket)
        if (scheme === null) continue
        nvimBefore.set(socket, scheme)
      }
      if (nvimSource(socket, files.neovim)) nvimCount++
    }
    if (nvimCount) status.push({ tool: 'Neovim', detail: nvimCount === 1 ? '1 window' : `${nvimCount} windows` })

    if (tmuxRunning()) {
      tmuxBefore ??= tmuxSnapshot(tmuxTheme)
      if (tmuxSource(files.tmux)) status.push({ tool: 'tmux', detail: 'status bar and borders' })
    }

    if (reloadGhostty && ghosttyReload()) {
      status.push({ tool: 'Ghostty', detail: `needs theme = ${LIVE_SLUG}` })
    }
    return status
  }

  // Coalesce rapid drags into at most one apply in flight plus one queued
  let pending: Palette | null = null
  let running = false
  const clients = new Set<ServerWebSocket<unknown>>()
  async function schedule(palette: Palette) {
    pending = palette
    if (running) return
    running = true
    while (pending) {
      const next = pending
      pending = null
      const status = await apply(next)
      const message = JSON.stringify({ type: 'status', status })
      for (const ws of clients) ws.send(message)
    }
    running = false
  }

  const server = Bun.serve({
    hostname: '127.0.0.1',
    port,
    async fetch(req, srv) {
      const url = new URL(req.url)
      if (url.pathname === '/live') {
        if (!ALLOWED_ORIGINS.has(req.headers.get('origin') ?? '')) {
          return new Response('Forbidden origin', { status: 403 })
        }
        return srv.upgrade(req) ? undefined : new Response('Expected a WebSocket', { status: 400 })
      }
      const file = Bun.file(join(dist, url.pathname === '/' ? 'index.html' : url.pathname))
      return (await file.exists()) ? new Response(file) : new Response(Bun.file(join(dist, 'index.html')))
    },
    websocket: {
      open(ws) {
        clients.add(ws)
      },
      close(ws) {
        clients.delete(ws)
      },
      message(_, raw) {
        try {
          const message = JSON.parse(String(raw))
          if (message.type === 'palette') schedule(parsePalette(message.palette))
        } catch {
          // Malformed or invalid palette; ignore it rather than write anything
        }
      },
    },
  })

  function restore() {
    for (const [socket, scheme] of nvimBefore) nvimRestore(socket, scheme)
    if (tmuxBefore) tmuxRestore(tmuxBefore)
    server.stop(true)
  }

  return { url: `http://localhost:${server.port}`, files, restore }
}
