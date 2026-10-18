import { contrast } from './color'
import { hexToOklch, hueDistance, oklchToHex, rgbToOklab, labToLch, type Oklch } from './oklch'
import type { Colors, Slot } from './palette'

export type Mode = 'dark' | 'light'
type Accent = Exclude<Slot, 'bg' | 'surface' | 'overlay' | 'muted' | 'fg'>

// Where each accent sits on the color wheel (OKLCH hue)
const ACCENT_HUES: Record<Accent, number> = {
  red: 25,
  orange: 55,
  yellow: 90,
  green: 140,
  cyan: 195,
  blue: 250,
  magenta: 320,
}
const ACCENTS = Object.keys(ACCENT_HUES) as Accent[]

// Lightness ladder for the neutral slots, tinted toward the theme's hue
const NEUTRALS: Record<Mode, Record<'bg' | 'surface' | 'overlay' | 'muted' | 'fg', number>> = {
  dark: { bg: 0.2, surface: 0.25, overlay: 0.31, muted: 0.54, fg: 0.88 },
  light: { bg: 0.97, surface: 0.93, overlay: 0.86, muted: 0.6, fg: 0.36 },
}
const ACCENT_L: Record<Mode, number> = { dark: 0.74, light: 0.55 }

function neutrals(hue: number, tint: number, mode: Mode): Pick<Colors, 'bg' | 'surface' | 'overlay' | 'muted' | 'fg'> {
  const ladder = NEUTRALS[mode]
  return {
    bg: oklchToHex({ l: ladder.bg, c: tint, h: hue }),
    surface: oklchToHex({ l: ladder.surface, c: tint, h: hue }),
    overlay: oklchToHex({ l: ladder.overlay, c: tint * 1.2, h: hue }),
    muted: oklchToHex({ l: ladder.muted, c: tint * 1.5, h: hue }),
    fg: oklchToHex({ l: ladder.fg, c: tint * 0.8, h: hue }),
  }
}

// Accents are text in every tool, so none may fall below 3:1 on the background
const readable = (hex: string, bg: string) => fixContrast(hex, bg, 3)

// Locked slots survive any generator untouched
function keepLocked(next: Colors, current: Colors, locked: ReadonlySet<Slot>): Colors {
  const out = { ...next }
  for (const slot of locked) out[slot] = current[slot]
  return out
}

// A whole palette from one color. The seed lands exactly on the accent slot
// nearest its hue; the other accents share its chroma and nudge toward its hue.
export function fromSeed(seed: string, mode: Mode, current: Colors, locked: ReadonlySet<Slot> = new Set()): Colors {
  const s = hexToOklch(seed)
  const chroma = Math.min(Math.max(s.c, 0.06), 0.16)
  const home = ACCENTS.reduce((best, a) => (hueDistance(ACCENT_HUES[a], s.h) < hueDistance(ACCENT_HUES[best], s.h) ? a : best))
  const shift = ((s.h - ACCENT_HUES[home] + 540) % 360) - 180

  const base = neutrals(s.h, Math.min(s.c * 0.15, 0.02), mode)
  const accents = Object.fromEntries(
    ACCENTS.map((a) => [
      a,
      readable(a === home ? seed : oklchToHex({ l: ACCENT_L[mode], c: chroma, h: ACCENT_HUES[a] + shift * 0.35 }), base.bg),
    ]),
  ) as Record<Accent, string>

  return keepLocked({ ...base, ...accents }, current, locked)
}

const ADJECTIVES = ['Quiet', 'Velvet', 'Ember', 'Frost', 'Midnight', 'Copper', 'Paper', 'Harbor', 'Moss', 'Neon', 'Dusty', 'Lunar']
const NOUNS = ['Fern', 'Harbor', 'Signal', 'Orchard', 'Static', 'Lantern', 'Tide', 'Circuit', 'Grove', 'Atlas', 'Kiln', 'Dune']

export function randomName(random = Math.random): string {
  const pick = (list: string[]) => list[Math.floor(random() * list.length)]
  let name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`
  while (name.split(' ')[0] === name.split(' ')[1]) name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`
  return name
}

export function shuffle(mode: Mode, current: Colors, locked: ReadonlySet<Slot>, random = Math.random): Colors {
  const hue = random() * 360
  const chroma = [0.07, 0.1, 0.14][Math.floor(random() * 3)]
  return fromSeed(oklchToHex({ l: ACCENT_L[mode], c: chroma, h: hue }), mode, current, locked)
}

// Nudges lightness away from the background until the pair reaches `target`,
// keeping hue and chroma so the color still reads as itself
export function fixContrast(hex: string, bg: string, target: number): string {
  if (contrast(hex, bg) >= target) return hex
  const color = hexToOklch(hex)
  const bgL = hexToOklch(bg).l
  const towards = bgL < 0.5 ? 1 : 0
  let lo = color.l
  let hi = towards
  // Binary search for the smallest change that passes
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (contrast(oklchToHex({ ...color, l: mid }), bg) >= target) hi = mid
    else lo = mid
  }
  return oklchToHex({ ...color, l: hi })
}

// k-means in OKLab over sampled image pixels. Deterministic: centers start at
// evenly spaced lightness quantiles, so the same image gives the same palette.
function clusters(pixels: [number, number, number][], k: number): { lab: [number, number, number]; weight: number }[] {
  const points = pixels.map(([r, g, b]) => rgbToOklab(r, g, b))
  const sorted = [...points].sort((a, b) => a[0] - b[0])
  let centers = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) / k) * sorted.length)])
  let counts = new Array(k).fill(0)

  for (let iter = 0; iter < 12; iter++) {
    const sums = centers.map(() => [0, 0, 0])
    counts = new Array(k).fill(0)
    for (const p of points) {
      let best = 0
      let bestDist = Infinity
      centers.forEach((c, i) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
        if (d < bestDist) [best, bestDist] = [i, d]
      })
      counts[best]++
      sums[best][0] += p[0]
      sums[best][1] += p[1]
      sums[best][2] += p[2]
    }
    centers = centers.map((c, i) =>
      counts[i] ? (sums[i].map((s) => s / counts[i]) as [number, number, number]) : c,
    )
  }
  return centers.map((lab, i) => ({ lab, weight: counts[i] / points.length }))
}

// Builds a palette that feels like an image: its dominant hue tints the
// neutrals, and each accent borrows the image's own color when one is close
export function fromImage(pixels: [number, number, number][], mode: Mode, current: Colors, locked: ReadonlySet<Slot> = new Set()): Colors {
  const found = clusters(pixels, 10).map(({ lab, weight }) => ({ ...labToLch(lab), weight }))
  const colorful = found.filter((c) => c.c > 0.035)
  // The neutrals take the hue covering the most area, so a mostly-navy
  // wallpaper gets a navy-tinted background even if it has vivid highlights
  const dominant: Oklch = (colorful.length ? colorful : found).reduce((a, b) => (a.weight > b.weight ? a : b))
  const avgChroma = colorful.length ? colorful.reduce((s, c) => s + c.c, 0) / colorful.length : 0.08
  const chroma = Math.min(Math.max(avgChroma, 0.06), 0.15)

  const accents = Object.fromEntries(
    ACCENTS.map((a) => {
      const target = ACCENT_HUES[a]
      const match = colorful
        .filter((c) => hueDistance(c.h, target) < 30)
        .sort((x, y) => hueDistance(x.h, target) - hueDistance(y.h, target))[0]
      const hue = match ? match.h : target
      const c = match ? Math.min(Math.max(match.c, 0.06), 0.17) : chroma
      return [a, oklchToHex({ l: ACCENT_L[mode], c, h: hue })]
    }),
  ) as Record<Accent, string>

  const base = neutrals(dominant.h, Math.min(dominant.c * 0.2, 0.025), mode)
  for (const a of ACCENTS) accents[a] = readable(accents[a], base.bg)
  return keepLocked({ ...base, ...accents }, current, locked)
}
