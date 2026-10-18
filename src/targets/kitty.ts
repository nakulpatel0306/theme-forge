import { ansi, derived } from '../core/palette'
import { header, type Target } from './types'

export const kitty: Target = {
  id: 'kitty',
  name: 'Kitty',
  kind: 'terminal',
  path: (slug) => `.config/kitty/themes/${slug}.conf`,
  setup: (slug) => `Add \`include themes/${slug}.conf\` to ~/.config/kitty/kitty.conf`,
  render(palette) {
    const { colors: c } = palette
    const { normal, bright } = ansi(palette)
    const d = derived(palette)
    return [
      header(palette),
      `foreground ${c.fg}`,
      `background ${c.bg}`,
      `selection_foreground ${c.fg}`,
      `selection_background ${d.selection}`,
      `cursor ${d.cursor}`,
      `cursor_text_color ${c.bg}`,
      `url_color ${c.blue}`,
      `active_border_color ${c.blue}`,
      `inactive_border_color ${d.border}`,
      `active_tab_foreground ${c.bg}`,
      `active_tab_background ${c.blue}`,
      `inactive_tab_foreground ${c.muted}`,
      `inactive_tab_background ${c.surface}`,
      `tab_bar_background ${c.surface}`,
      '',
      ...[...normal, ...bright].map((hex, i) => `color${i} ${hex}`),
      '',
    ].join('\n')
  },
}
