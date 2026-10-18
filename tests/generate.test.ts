import { describe, expect, test } from 'bun:test'
import { contrast, hexToRgb } from '../src/core/color'
import { fixContrast, fromImage, fromSeed, randomName, shuffle } from '../src/core/generate'
import { hexToOklch, hueDistance, oklchToHex } from '../src/core/oklch'
import { SLOTS, type Slot } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'

const current = PRESETS[0].colors
const ACCENTS: Slot[] = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta']

// Fixed sequence so shuffle tests are repeatable
function seeded(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)
}

describe('oklch', () => {
  test('round trips every preset color', () => {
    for (const preset of PRESETS) {
      for (const slot of SLOTS) {
        const hex = preset.colors[slot]
        const back = hexToRgb(oklchToHex(hexToOklch(hex)))
        const orig = hexToRgb(hex)
        expect(Math.abs(back.r - orig.r) + Math.abs(back.g - orig.g) + Math.abs(back.b - orig.b)).toBeLessThanOrEqual(3)
      }
    }
  })

  test('out-of-gamut colors keep their hue', () => {
    const hex = oklchToHex({ l: 0.7, c: 0.4, h: 140 })
    expect(hueDistance(hexToOklch(hex).h, 140)).toBeLessThan(6)
  })
})

describe('fromSeed', () => {
  for (const mode of ['dark', 'light'] as const) {
    test(`${mode}: readable text and accents`, () => {
      for (const seed of ['#c4746e', '#3a7bd5', '#8a9a7b', '#ff00ff', '#777777']) {
        const c = fromSeed(seed, mode, current)
        expect(contrast(c.fg, c.bg)).toBeGreaterThan(7)
        for (const slot of ACCENTS) expect(contrast(c[slot], c.bg)).toBeGreaterThan(3)
      }
    })
  }

  test('the seed lands on the nearest accent slot unchanged', () => {
    expect(fromSeed('#3a7bd5', 'dark', current).blue).toBe('#3a7bd5')
    expect(fromSeed('#d04040', 'dark', current).red).toBe('#d04040')
  })

  test('locked slots are untouched', () => {
    const locked = new Set<Slot>(['bg', 'green'])
    const c = fromSeed('#3a7bd5', 'light', current, locked)
    expect(c.bg).toBe(current.bg)
    expect(c.green).toBe(current.green)
    expect(c.fg).not.toBe(current.fg)
  })
})

test('shuffle is repeatable for the same random source and honors locks', () => {
  const a = shuffle('dark', current, new Set(['red']), seeded(7))
  const b = shuffle('dark', current, new Set(['red']), seeded(7))
  expect(a).toEqual(b)
  expect(a.red).toBe(current.red)
  expect(randomName(seeded(3))).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/)
})

test('fixContrast reaches the target and keeps the hue', () => {
  const bg = '#181616'
  const fixed = fixContrast('#3a3030', bg, 4.5)
  expect(contrast(fixed, bg)).toBeGreaterThanOrEqual(4.5)
  expect(hueDistance(hexToOklch(fixed).h, hexToOklch('#3a3030').h)).toBeLessThan(10)
  expect(fixContrast('#c5c9c5', bg, 4.5)).toBe('#c5c9c5')
  const light = fixContrast('#e0e0a0', '#f8f8f8', 3)
  expect(contrast(light, '#f8f8f8')).toBeGreaterThanOrEqual(3)
})

test('fromImage borrows the image hues and is deterministic', () => {
  // A mostly navy image with orange and teal highlights
  const pixels: [number, number, number][] = [
    ...Array.from({ length: 600 }, () => [20, 30, 70] as [number, number, number]),
    ...Array.from({ length: 200 }, () => [230, 120, 40] as [number, number, number]),
    ...Array.from({ length: 200 }, () => [40, 170, 160] as [number, number, number]),
  ]
  const c = fromImage(pixels, 'dark', current)
  expect(fromImage(pixels, 'dark', current)).toEqual(c)
  expect(hueDistance(hexToOklch(c.orange).h, hexToOklch('#e67828').h)).toBeLessThan(8)
  expect(hueDistance(hexToOklch(c.bg).h, hexToOklch('#141e46').h)).toBeLessThan(25)
  expect(contrast(c.fg, c.bg)).toBeGreaterThan(7)
})
