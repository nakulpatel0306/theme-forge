import { ansi, derived } from '../core/palette'
import { header, type Target } from './types'

export const ghostty: Target = {
  id: 'ghostty',
  name: 'Ghostty',
  kind: 'terminal',
  path: (slug) => `.config/ghostty/themes/${slug}`,
  setup: (slug) => `Add \`theme = ${slug}\` to ~/.config/ghostty/config`,
  render(palette) {
    const { colors: c } = palette
    const { normal, bright } = ansi(palette)
    const d = derived(palette)
    return [
      header(palette),
      ...[...normal, ...bright].map((hex, i) => `palette = ${i}=${hex}`),
      `background = ${c.bg}`,
      `foreground = ${c.fg}`,
      `cursor-color = ${d.cursor}`,
      `cursor-text = ${c.bg}`,
      `selection-background = ${d.selection}`,
      `selection-foreground = ${c.fg}`,
      `split-divider-color = ${d.border}`,
      '',
    ].join('\n')
  },
}
