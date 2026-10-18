import { isLight } from '../core/color'
import { ansi } from '../core/palette'
import { header, type Target } from './types'

const NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

export const warp: Target = {
  id: 'warp',
  name: 'Warp',
  kind: 'terminal',
  path: (slug) => `.warp/themes/${slug}.yaml`,
  setup: () => 'Open Settings > Appearance > Themes and pick it from the list',
  render(palette) {
    const { colors: c } = palette
    const { normal, bright } = ansi(palette)
    const block = (values: string[]) => values.map((hex, i) => `    ${NAMES[i]}: '${hex}'`)
    return [
      header(palette),
      `name: '${palette.name.replace(/'/g, "''")}'`,
      `accent: '${c.blue}'`,
      `background: '${c.bg}'`,
      `foreground: '${c.fg}'`,
      // Warp derives panel shades from this: "darker" for dark themes
      `details: ${isLight(c.bg) ? 'lighter' : 'darker'}`,
      'terminal_colors:',
      '  normal:',
      ...block(normal),
      '  bright:',
      ...block(bright),
      '',
    ].join('\n')
  },
}
