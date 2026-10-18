import { describe, expect, test } from 'bun:test'
import { contrast, hexToRgb, isHex, mix, normalizeHex, rgbToHex } from '../src/core/color'
import { ansi, parsePalette, SLOTS, slugify } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { decodeShare, encodeShare } from '../src/core/share'

describe('color', () => {
  test('normalizes short and uppercase hex', () => {
    expect(normalizeHex('ABC')).toBe('#aabbcc')
    expect(normalizeHex(' #C4746E ')).toBe('#c4746e')
  })

  test('rejects garbage', () => {
    expect(isHex('#12345')).toBe(false)
    expect(isHex('red')).toBe(false)
    expect(() => normalizeHex('nope')).toThrow()
  })

  test('round trips rgb', () => {
    expect(rgbToHex(hexToRgb('#8ba4b0'))).toBe('#8ba4b0')
  })

  test('mix endpoints', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  test('contrast matches WCAG reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5)
  })
})

describe('palette', () => {
  test('every preset parses and has readable text', () => {
    for (const preset of PRESETS) {
      const parsed = parsePalette(preset)
      expect(Object.keys(parsed.colors)).toEqual([...SLOTS])
      expect(contrast(parsed.colors.fg, parsed.colors.bg)).toBeGreaterThan(4.5)
    }
  })

  test('names the missing slot when invalid', () => {
    const { colors } = PRESETS[0]
    expect(() => parsePalette({ name: 'x', colors: { ...colors, blue: 'oops' } })).toThrow(/"blue"/)
    expect(() => parsePalette({ name: 'x' })).toThrow(/colors/)
  })

  test('slugify', () => {
    expect(slugify('Rosé Pine')).toBe('rose-pine')
    expect(slugify('  Kanagawa Dragon  ')).toBe('kanagawa-dragon')
    expect(slugify('!!!')).toBe('theme')
  })

  test('ansi brights move away from the background', () => {
    const dark = ansi(PRESETS[0])
    const light = ansi(PRESETS.find((p) => p.name === 'Catppuccin Latte')!)
    expect(dark.normal).toHaveLength(8)
    expect(hexToRgb(dark.bright[1]).r).toBeGreaterThan(hexToRgb(dark.normal[1]).r)
    expect(hexToRgb(light.bright[1]).r).toBeLessThan(hexToRgb(light.normal[1]).r)
  })
})

describe('share links', () => {
  test('round trip', () => {
    for (const preset of PRESETS) {
      expect(decodeShare(encodeShare(preset))).toEqual(preset)
    }
  })

  test('reject tampered links', () => {
    expect(decodeShare('')).toBeNull()
    expect(decodeShare('#c=181616-282727')).toBeNull()
    const bad = encodeShare(PRESETS[0]).replace('181616', 'zzzzzz')
    expect(decodeShare(bad)).toBeNull()
  })
})

describe('style overrides', () => {
  const styled = {
    ...PRESETS[0],
    style: { syntax: { keyword: 'red' as const, string: 'cyan' as const }, italicComments: false },
  }

  test('share links carry them', () => {
    expect(decodeShare(encodeShare(styled))).toEqual(styled)
    expect(encodeShare(PRESETS[0])).not.toContain('s=')
  })

  test('parsePalette keeps valid overrides and drops junk', () => {
    const parsed = parsePalette({ ...PRESETS[0], style: { syntax: { keyword: 'red', string: 'nope', bogus: 'blue' }, italicKeywords: 'yes' } })
    expect(parsed.style).toEqual({ syntax: { keyword: 'red' } })
    expect(parsePalette({ ...PRESETS[0], style: { syntax: {} } }).style).toBeUndefined()
  })
})
