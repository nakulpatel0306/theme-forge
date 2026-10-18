import { useCallback, useEffect, useState } from 'react'
import { parsePalette, type Palette } from '../core/palette'
import { PRESETS } from '../core/presets'
import { decodeShare, encodeShare } from '../core/share'

const STORAGE_KEY = 'theme-forge:palette'
const HISTORY_LIMIT = 100
// Repeated edits of the same thing (dragging one color picker, typing the
// name) closer together than this collapse into one undo step. Anything
// without a key, like a shuffle, is always its own step.
const COALESCE_MS = 600

type History = { past: Palette[]; present: Palette; future: Palette[]; at: number; key?: string }
type Update = Palette | ((current: Palette) => Palette)

// A share link wins, then whatever you were last editing, then the first preset
function initial(): History {
  const shared = decodeShare(location.hash)
  let present = shared ?? PRESETS[0]
  if (!shared) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) present = parsePalette(JSON.parse(saved))
    } catch {
      // Storage blocked or holding something stale; start fresh
    }
  }
  return { past: [], present, future: [], at: 0 }
}

export function usePalette() {
  const [state, setState] = useState(initial)
  const palette = state.present

  const setPalette = useCallback((update: Update, key?: string) => {
    setState((h) => {
      const next = typeof update === 'function' ? update(h.present) : update
      if (next === h.present) return h
      const now = Date.now()
      const merge = key !== undefined && key === h.key && now - h.at < COALESCE_MS && h.past.length > 0
      const past = merge ? h.past : [...h.past, h.present].slice(-HISTORY_LIMIT)
      return { past, present: next, future: [], at: now, key }
    })
  }, [])

  const undo = useCallback(() => {
    setState((h) =>
      h.past.length
        ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], at: 0 }
        : h,
    )
  }, [])

  const redo = useCallback(() => {
    setState((h) =>
      h.future.length
        ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), at: 0 }
        : h,
    )
  }, [])

  useEffect(() => {
    history.replaceState(null, '', `#${encodeShare(palette)}`)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palette))
    } catch {
      // Private mode etc.; the URL hash still carries the palette
    }
  }, [palette])

  // Pasting a share link into an already-open tab only changes the hash
  useEffect(() => {
    const onHashChange = () => {
      const shared = decodeShare(location.hash)
      if (shared) setPalette(shared)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [setPalette])

  // Text fields keep their own native undo; everywhere else it's ours
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.matches('input:not([type=color]):not([type=checkbox]), textarea')) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) undo()
      else if ((key === 'z' && e.shiftKey) || key === 'y') redo()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return {
    palette,
    setPalette,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
