import { describe, expect, test } from 'bun:test'
import { ansi, slugify } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { TARGETS } from '../src/targets'

const kanagawa = PRESETS[0]

describe.each(TARGETS.map((t) => [t.id, t] as const))('%s', (_, target) => {
  test('renders every preset with all 16 terminal colors', () => {
    for (const preset of PRESETS) {
      const out = target.render(preset, slugify(preset.name))
      const { normal, bright } = ansi(preset)
      for (const hex of [...normal, ...bright, preset.colors.bg, preset.colors.fg]) {
        expect(out).toContain(hex)
      }
    }
  })

  test('install path stays inside ~/.config and never targets a main config', () => {
    const path = target.path('demo')
    expect(path.startsWith('.config/')).toBe(true)
    expect(path).toContain('demo')
  })

  test('output is stable', () => {
    expect(target.render(kanagawa, 'kanagawa-dragon')).toMatchSnapshot()
  })
})

test('TOML targets parse', () => {
  for (const id of ['alacritty', 'wezterm']) {
    const target = TARGETS.find((t) => t.id === id)!
    const parsed = Bun.TOML.parse(target.render(kanagawa, 'kanagawa-dragon')) as Record<string, any>
    expect(parsed.colors).toBeDefined()
  }
})

test('key = value targets have no malformed lines', () => {
  const ghostty = TARGETS.find((t) => t.id === 'ghostty')!.render(kanagawa, 'kanagawa-dragon')
  for (const line of ghostty.split('\n').filter((l) => l && !l.startsWith('#'))) {
    expect(line).toMatch(/^[a-z-]+ = (\d+=)?#[0-9a-f]{6}$/)
  }
  const kitty = TARGETS.find((t) => t.id === 'kitty')!.render(kanagawa, 'kanagawa-dragon')
  for (const line of kitty.split('\n').filter((l) => l && !l.startsWith('#'))) {
    expect(line).toMatch(/^[a-z_0-9]+ #[0-9a-f]{6}$/)
  }
})
