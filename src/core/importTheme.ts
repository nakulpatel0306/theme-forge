import { contrast, isHex, mix, normalizeHex, rgbToHex } from './color'
import { hexToOklch, oklchToHex } from './oklch'
import type { Colors, Palette } from './palette'

// What every terminal theme format can tell us
type Found = { bg?: string; fg?: string; selection?: string; ansi: (string | undefined)[] }

export type ImportResult = { palette: Palette; format: string }

const hex = (value: string | undefined) => {
  if (!value) return undefined
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '').replace(/^0x/i, '#')
  return isHex(cleaned) ? normalizeHex(cleaned) : undefined
}

const ANSI_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

function ghostty(text: string): Found | null {
  if (!/^\s*palette\s*=\s*\d+=/m.test(text)) return null
  const found: Found = { ansi: [] }
  for (const [, key, value] of text.matchAll(/^\s*([\w-]+)\s*=\s*(.+?)\s*$/gm)) {
    if (key === 'palette') {
      const [index, color] = value.split('=')
      found.ansi[Number(index)] = hex(color)
    } else if (key === 'background') found.bg = hex(value)
    else if (key === 'foreground') found.fg = hex(value)
    else if (key === 'selection-background') found.selection = hex(value)
  }
  return found
}

function kitty(text: string): Found | null {
  if (!/^\s*color\d+\s+#/m.test(text)) return null
  const found: Found = { ansi: [] }
  for (const [, key, value] of text.matchAll(/^\s*(\w+)\s+(#[0-9a-f]{3,6})\s*$/gim)) {
    const index = key.match(/^color(\d+)$/)
    if (index) found.ansi[Number(index[1])] = hex(value)
    else if (key === 'background') found.bg = hex(value)
    else if (key === 'foreground') found.fg = hex(value)
    else if (key === 'selection_background') found.selection = hex(value)
  }
  return found
}

function xresources(text: string): Found | null {
  if (!/^\s*\*\.?color\d+\s*:/m.test(text)) return null
  const found: Found = { ansi: [] }
  for (const [, key, value] of text.matchAll(/^\s*\*\.?(\w+)\s*:\s*(\S+)/gm)) {
    const index = key.match(/^color(\d+)$/)
    if (index) found.ansi[Number(index[1])] = hex(value)
    else if (key === 'background') found.bg = hex(value)
    else if (key === 'foreground') found.fg = hex(value)
  }
  return found
}

// Alacritty and WezTerm are both TOML; tell them apart by their tables
function toml(text: string): { found: Found; format: string } | null {
  const sections = new Map<string, Record<string, string>>()
  let section = ''
  for (const line of text.split('\n')) {
    const header = line.match(/^\s*\[([^\]]+)\]/)
    if (header) {
      section = header[1].trim()
      continue
    }
    const pair = line.match(/^\s*([\w.]+)\s*=\s*(.+?)\s*$/)
    if (!pair) continue
    sections.set(section, { ...sections.get(section), [pair[1]]: pair[2] })
  }

  const alacritty = sections.get('colors.primary')
  if (alacritty) {
    const normal = sections.get('colors.normal') ?? {}
    const bright = sections.get('colors.bright') ?? {}
    return {
      format: 'Alacritty',
      found: {
        bg: hex(alacritty.background),
        fg: hex(alacritty.foreground),
        selection: hex(sections.get('colors.selection')?.background),
        ansi: [...ANSI_NAMES.map((n) => hex(normal[n])), ...ANSI_NAMES.map((n) => hex(bright[n]))],
      },
    }
  }

  const wez = sections.get('colors')
  if (wez && (wez.ansi || /ansi\s*=\s*\[/.test(text))) {
    const list = (key: string) => [...(text.match(new RegExp(`${key}\\s*=\\s*\\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(/#[0-9a-f]{3,6}/gi)].map((m) => hex(m[0]))
    return {
      format: 'WezTerm',
      found: { bg: hex(wez.background), fg: hex(wez.foreground), selection: hex(wez.selection_bg), ansi: [...list('ansi'), ...list('brights')] },
    }
  }
  return null
}

function iterm(text: string): Found | null {
  if (!text.includes('<plist') || !text.includes('Ansi 0 Color')) return null
  const read = (name: string) => {
    const block = text.split(`<key>${name}</key>`)[1]?.split('</dict>')[0]
    if (!block) return undefined
    const channel = (c: string) => Number(block.match(new RegExp(`${c} Component</key>\\s*<real>([\\d.eE-]+)`))?.[1] ?? NaN) * 255
    const [r, g, b] = [channel('Red'), channel('Green'), channel('Blue')]
    return [r, g, b].some(Number.isNaN) ? undefined : rgbToHex({ r, g, b })
  }
  return {
    bg: read('Background Color'),
    fg: read('Foreground Color'),
    selection: read('Selection Color'),
    ansi: Array.from({ length: 16 }, (_, i) => read(`Ansi ${i} Color`)),
  }
}

// Terminal themes have no orange; place one halfway between red and yellow
function orange(red: string, yellow: string): string {
  const r = hexToOklch(red)
  const y = hexToOklch(yellow)
  const d = ((y.h - r.h + 540) % 360) - 180
  return oklchToHex({ l: (r.l + y.l) / 2, c: (r.c + y.c) / 2, h: r.h + d / 2 })
}

function toPalette({ bg, fg, selection, ansi }: Found, name: string): Palette {
  if (!bg || !fg) throw new Error('No background and foreground colors found')
  const missing = [1, 2, 3, 4, 5, 6].filter((i) => !ansi[i])
  if (missing.length) throw new Error(`Missing terminal colors ${missing.join(', ')}`)

  // color0 is often the background itself; only use it as a surface if it differs
  const color0 = ansi[0]
  const surface = color0 && contrast(color0, bg) > 1.03 ? color0 : mix(bg, fg, 0.08)
  const colors: Colors = {
    bg,
    surface,
    overlay: selection && contrast(selection, bg) > 1.1 ? selection : mix(bg, fg, 0.18),
    muted: ansi[8] && contrast(ansi[8], bg) > 2 ? ansi[8] : mix(bg, fg, 0.45),
    fg,
    red: ansi[1]!,
    orange: orange(ansi[1]!, ansi[3]!),
    yellow: ansi[3]!,
    green: ansi[2]!,
    cyan: ansi[6]!,
    blue: ansi[4]!,
    magenta: ansi[5]!,
  }
  return { name, colors }
}

const PARSERS: [string, (text: string) => Found | null][] = [
  ['Ghostty', ghostty],
  ['iTerm2', iterm],
  ['Kitty', kitty],
  ['Xresources', xresources],
]

export function importTheme(text: string, name = 'Imported theme'): ImportResult {
  for (const [format, parse] of PARSERS) {
    const found = parse(text)
    if (found) return { format, palette: toPalette(found, name) }
  }
  const fromToml = toml(text)
  if (fromToml) return { format: fromToml.format, palette: toPalette(fromToml.found, name) }
  throw new Error("Didn't recognize this as a Ghostty, Kitty, Alacritty, WezTerm, iTerm2 or Xresources theme")
}
