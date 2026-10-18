import { useEffect } from 'react'
import { isLight } from '../core/color'
import { derived, SLOTS, type Palette } from '../core/palette'

// The app's own chrome is painted with the palette being edited, so every
// stylesheet reads --c-<slot> instead of fixed colors.
export function usePaletteVars(palette: Palette) {
  useEffect(() => {
    const root = document.documentElement.style
    for (const slot of SLOTS) root.setProperty(`--c-${slot}`, palette.colors[slot])
    for (const [key, value] of Object.entries(derived(palette))) root.setProperty(`--d-${key}`, value)
    root.setProperty('color-scheme', isLight(palette.colors.bg) ? 'light' : 'dark')
  }, [palette])
}
