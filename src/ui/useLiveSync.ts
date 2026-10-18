import { useEffect, useRef, useState } from 'react'
import type { Palette } from '../core/palette'

export type LiveState =
  | { state: 'off' }
  | { state: 'live'; tools: { tool: string; detail: string }[] }
  | { state: 'lost' }

const LIVE_PORT = '4747'
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)

// Served by `themeforge live` itself, the socket is same-origin. From the dev
// server it lives next door on the live port.
const socketUrl = () =>
  location.port === LIVE_PORT ? `ws://${location.host}/live` : `ws://127.0.0.1:${LIVE_PORT}/live`

export function useLiveSync(palette: Palette): LiveState {
  const [live, setLive] = useState<LiveState>({ state: 'off' })
  const socket = useRef<WebSocket | null>(null)
  const latest = useRef(palette)

  useEffect(() => {
    if (!isLocal) return
    let retry: ReturnType<typeof setTimeout>
    let delay = 2000
    let stopped = false

    const connect = () => {
      const ws = new WebSocket(socketUrl())
      ws.onopen = () => {
        delay = 2000
        socket.current = ws
        setLive({ state: 'live', tools: [] })
        ws.send(JSON.stringify({ type: 'palette', palette: latest.current }))
      }
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'status') setLive({ state: 'live', tools: message.status })
      }
      ws.onclose = () => {
        if (socket.current === ws) setLive({ state: 'lost' })
        socket.current = null
        if (stopped) return
        // Back off so a dev session without the live server stays quiet
        retry = setTimeout(connect, delay)
        delay = Math.min(delay * 2, 15000)
      }
    }
    connect()

    return () => {
      stopped = true
      clearTimeout(retry)
      socket.current?.close()
    }
  }, [])

  useEffect(() => {
    latest.current = palette
    const ws = socket.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'palette', palette }))
  }, [palette])

  return live
}
