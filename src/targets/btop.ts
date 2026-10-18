import { mix } from '../core/color'
import { derived } from '../core/palette'
import { header, type Target } from './types'

export const btop: Target = {
  id: 'btop',
  name: 'btop',
  kind: 'tool',
  path: (slug) => `.config/btop/themes/${slug}.theme`,
  setup: (slug) => `Set \`color_theme = "${slug}"\` in ~/.config/btop/btop.conf`,
  render(palette) {
    const { colors: c } = palette
    const d = derived(palette)
    // Graphs fade from a calm color at low load to red at high load
    const gradient = (name: string, start: string, end: string): [string, string][] => [
      [`${name}_start`, start],
      [`${name}_mid`, mix(start, end, 0.5)],
      [`${name}_end`, end],
    ]
    const theme: [string, string][] = [
      ['main_bg', c.bg],
      ['main_fg', c.fg],
      ['title', c.fg],
      ['hi_fg', c.blue],
      ['selected_bg', d.selection],
      ['selected_fg', c.fg],
      ['inactive_fg', c.muted],
      ['graph_text', c.muted],
      ['meter_bg', c.surface],
      ['proc_misc', c.cyan],
      ['cpu_box', c.blue],
      ['mem_box', c.green],
      ['net_box', c.magenta],
      ['proc_box', c.yellow],
      ['div_line', c.overlay],
      ...gradient('temp', c.green, c.red),
      ...gradient('cpu', c.green, c.red),
      ...gradient('free', c.cyan, c.blue),
      ...gradient('cached', c.blue, c.magenta),
      ...gradient('available', c.yellow, c.orange),
      ...gradient('used', c.orange, c.red),
      ...gradient('download', c.cyan, c.blue),
      ...gradient('upload', c.magenta, c.red),
      ...gradient('process', c.green, c.red),
    ]
    return [header(palette), ...theme.map(([key, hex]) => `theme[${key}]="${hex}"`), ''].join('\n')
  },
}
