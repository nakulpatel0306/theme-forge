import { ansi, derived } from '../core/palette'
import { header, type Target } from './types'

const NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

export const alacritty: Target = {
  id: 'alacritty',
  name: 'Alacritty',
  kind: 'terminal',
  path: (slug) => `.config/alacritty/themes/${slug}.toml`,
  setup: (slug) =>
    `Add \`import = ["~/.config/alacritty/themes/${slug}.toml"]\` under [general] in ~/.config/alacritty/alacritty.toml`,
  render(palette) {
    const { colors: c } = palette
    const { normal, bright } = ansi(palette)
    const d = derived(palette)
    const table = (values: string[]) => values.map((hex, i) => `${NAMES[i]} = "${hex}"`).join('\n')
    return [
      header(palette),
      '[colors.primary]',
      `background = "${c.bg}"`,
      `foreground = "${c.fg}"`,
      '',
      '[colors.cursor]',
      `cursor = "${d.cursor}"`,
      `text = "${c.bg}"`,
      '',
      '[colors.selection]',
      `background = "${d.selection}"`,
      `text = "${c.fg}"`,
      '',
      '[colors.normal]',
      table(normal),
      '',
      '[colors.bright]',
      table(bright),
      '',
    ].join('\n')
  },
}
