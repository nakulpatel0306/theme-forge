import { expect, test } from 'bun:test'
import { hexToRgb } from '../src/core/color'
import { importTheme } from '../src/core/importTheme'
import { PRESETS } from '../src/core/presets'
import { TARGETS } from '../src/targets'

const close = (a: string, b: string) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)]
  return Math.abs(x.r - y.r) + Math.abs(x.g - y.g) + Math.abs(x.b - y.b) <= 3
}

const FORMATS = { ghostty: 'Ghostty', kitty: 'Kitty', alacritty: 'Alacritty', wezterm: 'WezTerm', iterm2: 'iTerm2' }

test('every terminal export imports back to the same palette', () => {
  for (const [id, format] of Object.entries(FORMATS)) {
    const target = TARGETS.find((t) => t.id === id)!
    for (const preset of PRESETS) {
      const result = importTheme(target.render(preset, 'x'), preset.name)
      expect(result.format).toBe(format)
      for (const slot of ['bg', 'fg', 'surface', 'overlay', 'muted', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta'] as const) {
        expect(`${id} ${preset.name} ${slot} ${result.palette.colors[slot]}`).toBe(
          `${id} ${preset.name} ${slot} ${close(result.palette.colors[slot], preset.colors[slot]) ? result.palette.colors[slot] : preset.colors[slot]}`,
        )
      }
    }
  }
})

test('Xresources', () => {
  const text = [
    '*.background: #1d1f21',
    '*.foreground: #c5c8c6',
    ...['#282a2e', '#a54242', '#8c9440', '#de935f', '#5f819d', '#85678f', '#5e8d87', '#707880'].map((c, i) => `*.color${i}: ${c}`),
    '*.color8: #373b41',
  ].join('\n')
  const { format, palette } = importTheme(text)
  expect(format).toBe('Xresources')
  expect(palette.colors.blue).toBe('#5f819d')
})

test('explains what went wrong', () => {
  expect(() => importTheme('hello world')).toThrow(/Didn't recognize/)
  expect(() => importTheme('palette = 0=#000000\nbackground = #000000\nforeground = #ffffff')).toThrow(/Missing terminal colors 1, 2/)
})
