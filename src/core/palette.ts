import { darken, isHex, isLight, lighten, mix, normalizeHex } from './color'
import { TOKEN_KINDS, type StyleOverrides, type TokenKind } from './syntax'

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
  style?: StyleOverrides
}

export const SLOT_INFO: Record<Slot, { label: string; hint: string }> = {
  bg: { label: 'Background', hint: 'Behind everything' },
  surface: { label: 'Surface', hint: 'Panels, status bars' },
  overlay: { label: 'Overlay', hint: 'Selections, borders' },
  muted: { label: 'Muted', hint: 'Comments, gutters' },
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
  const palette: Palette = { name: typeof name === 'string' && name.trim() ? name.trim() : 'Untitled', colors: out }
  const style = parseStyle((input as { style?: unknown }).style)
  if (style) palette.style = style
  return palette
}

const isSlot = (value: unknown): value is Slot => typeof value === 'string' && (SLOTS as readonly string[]).includes(value)

// Unknown keys are dropped rather than rejected, so older or newer files still load
function parseStyle(input: unknown): StyleOverrides | undefined {
  if (typeof input !== 'object' || input === null) return undefined
  const { syntax, italicComments, italicKeywords } = input as Record<string, unknown>
  const style: StyleOverrides = {}
  if (typeof syntax === 'object' && syntax !== null) {
    const entries = TOKEN_KINDS.filter((kind) => isSlot((syntax as Record<string, unknown>)[kind])).map(
      (kind) => [kind, (syntax as Record<TokenKind, Slot>)[kind]] as const,
    )
    if (entries.length) style.syntax = Object.fromEntries(entries)
  }
  if (typeof italicComments === 'boolean') style.italicComments = italicComments
  if (typeof italicKeywords === 'boolean') style.italicKeywords = italicKeywords
  return Object.keys(style).length ? style : undefined
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
