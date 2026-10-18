import { afterAll, expect, test } from 'bun:test'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { startLive } from '../cli/live/server'

// Only the refusal paths are tested here: a valid palette would reload any
// real Neovim or tmux running on the machine
const home = await mkdtemp(join(tmpdir(), 'theme-forge-live-'))
const session = startLive({ home, port: 0, dist: home, reloadGhostty: false })
const wsUrl = session.url.replace('http', 'ws') + '/live'
afterAll(async () => {
  session.restore()
  await rm(home, { recursive: true, force: true })
})

test('refuses websocket connections from other websites', async () => {
  const res = await fetch(session.url + '/live', {
    headers: { Origin: 'https://evil.example', Upgrade: 'websocket', Connection: 'Upgrade' },
  })
  expect(res.status).toBe(403)
})

test('ignores messages that are not a valid palette', async () => {
  const ws = new WebSocket(wsUrl, { headers: { Origin: 'http://localhost:5179' } })
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.send('not json')
  ws.send(JSON.stringify({ type: 'palette', palette: { name: 'x', colors: { bg: '#000' } } }))
  await Bun.sleep(100)
  ws.close()
  expect(await readdir(home)).toEqual([])
})
