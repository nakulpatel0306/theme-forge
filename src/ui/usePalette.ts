import { useEffect, useState } from 'react'
import { parsePalette, type Palette } from '../core/palette'
import { PRESETS } from '../core/presets'
import { decodeShare, encodeShare } from '../core/share'

const STORAGE_KEY = 'theme-forge:palette'

// A share link wins, then whatever you were last editing, then the first preset
function initial(): Palette {
  const shared = decodeShare(location.hash)
  if (shared) return shared
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return parsePalette(JSON.parse(saved))
  } catch {
    // Storage blocked or holding something stale; start fresh
  }
  return PRESETS[0]
}

export function usePalette() {
  const [palette, setPalette] = useState(initial)

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
  }, [])

  return [palette, setPalette] as const
}
