import { ansi, derived } from '../core/palette'
import { header, type Target } from './types'

export const wezterm: Target = {
  id: 'wezterm',
  name: 'WezTerm',
  kind: 'terminal',
  path: (slug) => `.config/wezterm/colors/${slug}.toml`,
  setup: (slug) => `Set \`config.color_scheme = '${slug}'\` in ~/.wezterm.lua`,
  render(palette, slug) {
    const { colors: c } = palette
    const { normal, bright } = ansi(palette)
    const d = derived(palette)
    const list = (values: string[]) => `[${values.map((hex) => `'${hex}'`).join(', ')}]`
    return [
      header(palette),
      '[colors]',
      `foreground = '${c.fg}'`,
      `background = '${c.bg}'`,
      `cursor_bg = '${d.cursor}'`,
      `cursor_fg = '${c.bg}'`,
      `cursor_border = '${d.cursor}'`,
      `selection_bg = '${d.selection}'`,
      `selection_fg = '${c.fg}'`,
      `split = '${d.border}'`,
      `ansi = ${list(normal)}`,
      `brights = ${list(bright)}`,
      '',
      // WezTerm looks schemes up by this name, so keep it identical to the slug
      '[metadata]',
      `name = '${slug}'`,
      '',
    ].join('\n')
  },
}
