import { describe, expect, test } from 'bun:test'
import { strFromU8, unzipSync } from 'fflate'
import { ansi, slugify } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { TARGETS } from '../src/targets'
import { colorTheme, vscode } from '../src/targets/vscode'

const kanagawa = PRESETS[0]

describe.each(TARGETS.map((t) => [t.id, t] as const))('%s', (_, target) => {
  // iTerm2 stores colors as 0-1 components; it gets its own test below
  test.skipIf(target.id === 'iterm2')('renders every preset using the palette', () => {
    for (const preset of PRESETS) {
      const out = target.render(preset, slugify(preset.name))
      const { normal, bright } = ansi(preset)
      // Terminals must carry the full ANSI set; other tools just need the core accents
      const expected =
        target.kind === 'terminal'
          ? [...normal, ...bright, preset.colors.bg, preset.colors.fg]
          : [preset.colors.red, preset.colors.blue]
      for (const hex of expected) expect(out).toContain(hex)
    }
  })

  test('install path is a dedicated theme file, never a main config', () => {
    const path = target.path('demo')
    expect(path).toMatch(/^\.(config|warp)\//)
    expect(path).toContain('demo')
    expect(path).not.toMatch(/(^|\/)(config|config\.toml|config\.yml|kitty\.conf|tmux\.conf|starship\.toml|btop\.conf|settings\.json)$/)
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

test('VS Code theme uses valid colors and packages as a vsix', () => {
  for (const preset of PRESETS) {
    const theme = colorTheme(preset)
    for (const [key, value] of Object.entries(theme.colors)) {
      expect(`${key}=${value}`).toMatch(/=#[0-9a-f]{6}([0-9a-f]{2})?$/)
    }
    expect(theme.type).toBe(preset.name === 'Catppuccin Latte' ? 'light' : 'dark')
  }

  const files = unzipSync(vscode.binary!(kanagawa, 'kanagawa-dragon'))
  expect(Object.keys(files).sort()).toEqual([
    '[Content_Types].xml',
    'extension.vsixmanifest',
    'extension/package.json',
    'extension/themes/kanagawa-dragon-color-theme.json',
  ])
  const pkg = JSON.parse(strFromU8(files['extension/package.json']))
  expect(pkg.contributes.themes[0].path).toBe('./themes/kanagawa-dragon-color-theme.json')
  expect(strFromU8(files['extension.vsixmanifest'])).toContain(`Version="${pkg.version}"`)
})

test('iTerm2 colors round-trip from their 0-1 components', () => {
  const iterm2 = TARGETS.find((t) => t.id === 'iterm2')!
  for (const preset of PRESETS) {
    const out = iterm2.render(preset, 'x')
    const read = (name: string) => {
      const block = out.split(`<key>${name}</key>`)[1]
      const c = (channel: string) =>
        Math.round(Number(block.match(new RegExp(`${channel} Component</key>\\s*<real>([\\d.]+)`))![1]) * 255)
      return '#' + [c('Red'), c('Green'), c('Blue')].map((v) => v.toString(16).padStart(2, '0')).join('')
    }
    expect(read('Background Color')).toBe(preset.colors.bg)
    expect(read('Ansi 1 Color')).toBe(ansi(preset).normal[1])
    expect(read('Ansi 15 Color')).toBe(ansi(preset).bright[7])
  }
})
