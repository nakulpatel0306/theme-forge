import { parsePalette, SLOTS, type Palette } from './palette'

// Compact, human-readable hash: #n=Kanagawa%20Dragon&c=181616-282727-...
// Colors are in SLOTS order so the link stays short.
export function encodeShare(palette: Palette): string {
  const params = new URLSearchParams({
    n: palette.name,
    c: SLOTS.map((slot) => palette.colors[slot].slice(1)).join('-'),
  })
  return params.toString()
}

export function decodeShare(hash: string): Palette | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const values = params.get('c')?.split('-')
  if (!values || values.length !== SLOTS.length) return null
  try {
    return parsePalette({
      name: params.get('n') ?? 'Shared theme',
      colors: Object.fromEntries(SLOTS.map((slot, i) => [slot, values[i]])),
    })
  } catch {
    return null
  }
}
