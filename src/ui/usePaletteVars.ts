import { useEffect } from 'react'
import { isLight } from '../core/color'
import { ansi, derived, SLOTS, type Palette } from '../core/palette'

// The app's own chrome is painted with the palette being edited, so every
// stylesheet reads --c-<slot> instead of fixed colors.
export function usePaletteVars(palette: Palette) {
  useEffect(() => {
    const root = document.documentElement.style
    for (const slot of SLOTS) root.setProperty(`--c-${slot}`, palette.colors[slot])
    for (const [key, value] of Object.entries(derived(palette))) root.setProperty(`--d-${key}`, value)
    const { normal, bright } = ansi(palette)
    const terminal = [...normal, ...bright]
    terminal.forEach((hex, i) => root.setProperty(`--ansi-${i}`, hex))
    root.setProperty('color-scheme', isLight(palette.colors.bg) ? 'light' : 'dark')
  }, [palette])
}
