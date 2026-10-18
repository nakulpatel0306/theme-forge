import { darken, isHex, isLight, lighten, mix, normalizeHex } from './color'

// Twelve slots are enough to drive every target. Anything else a tool needs
// (bright ANSI colors, selection, cursor) is derived from these so a palette
// stays small enough to tweak by hand.
export const SLOTS = [
  'bg',
  'surface',
  'overlay',
  'muted',
  'fg',
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'magenta',
] as const

export type Slot = (typeof SLOTS)[number]
export type Colors = Record<Slot, string>

export type Palette = {
  name: string
  colors: Colors
}

export const SLOT_INFO: Record<Slot, { label: string; hint: string }> = {
  bg: { label: 'Background', hint: 'Behind everything' },
  surface: { label: 'Surface', hint: 'Status bars, gutters, panels' },
  overlay: { label: 'Overlay', hint: 'Selections and borders' },
  muted: { label: 'Muted', hint: 'Comments and line numbers' },
  fg: { label: 'Text', hint: 'Default foreground' },
  red: { label: 'Red', hint: 'Errors, deletions' },
  orange: { label: 'Orange', hint: 'Numbers, constants' },
  yellow: { label: 'Yellow', hint: 'Types, warnings' },
  green: { label: 'Green', hint: 'Strings, additions' },
  cyan: { label: 'Cyan', hint: 'Operators, info' },
  blue: { label: 'Blue', hint: 'Functions, links' },
  magenta: { label: 'Magenta', hint: 'Keywords' },
}

export function parsePalette(input: unknown): Palette {
  if (typeof input !== 'object' || input === null) throw new Error('Palette must be an object')
  const { name, colors } = input as { name?: unknown; colors?: Record<string, unknown> }
  if (typeof colors !== 'object' || colors === null) throw new Error('Palette is missing "colors"')

  const out = {} as Colors
  for (const slot of SLOTS) {
    const value = colors[slot]
    if (typeof value !== 'string' || !isHex(value)) {
      throw new Error(`Palette color "${slot}" must be a hex string, got ${JSON.stringify(value)}`)
    }
    out[slot] = normalizeHex(value)
  }
  return { name: typeof name === 'string' && name.trim() ? name.trim() : 'Untitled', colors: out }
}

// Filesystem and identifier friendly version of the palette name
export function slugify(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'theme'
  )
}

export type Ansi = {
  normal: [string, string, string, string, string, string, string, string]
  bright: [string, string, string, string, string, string, string, string]
}

// Terminal order: black red green yellow blue magenta cyan white
export function ansi({ colors: c }: Palette): Ansi {
  const light = isLight(c.bg)
  const brighten = (hex: string) => (light ? darken(hex, 0.15) : lighten(hex, 0.15))
  return {
    normal: [c.surface, c.red, c.green, c.yellow, c.blue, c.magenta, c.cyan, mix(c.fg, c.muted, 0.25)],
    bright: [
      c.muted,
      brighten(c.red),
      brighten(c.green),
      brighten(c.yellow),
      brighten(c.blue),
      brighten(c.magenta),
      brighten(c.cyan),
      c.fg,
    ],
  }
}

export function derived({ colors: c }: Palette) {
  return {
    cursor: c.fg,
    selection: c.overlay,
    border: c.overlay,
    lineHighlight: mix(c.bg, c.surface, 0.6),
    diffAddBg: mix(c.bg, c.green, 0.18),
    diffDeleteBg: mix(c.bg, c.red, 0.18),
    diffChangeBg: mix(c.bg, c.blue, 0.15),
  }
}
