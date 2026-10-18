import { derived } from '../core/palette'
import { header, type Target } from './types'

export const fzf: Target = {
  id: 'fzf',
  name: 'fzf',
  kind: 'tool',
  path: (slug) => `.config/fzf/themes/${slug}.sh`,
  setup: (slug) => `Add \`source ~/.config/fzf/themes/${slug}.sh\` to ~/.zshrc`,
  render(palette) {
    const { colors: c } = palette
    const d = derived(palette)
    const spec = Object.entries({
      fg: c.fg,
      bg: c.bg,
      hl: c.blue,
      'fg+': c.fg,
      'bg+': d.selection,
      'hl+': c.blue,
      info: c.yellow,
      prompt: c.magenta,
      pointer: c.red,
      marker: c.green,
      spinner: c.cyan,
      header: c.muted,
      border: d.border,
      gutter: c.bg,
    })
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    // Appends, so any non-color options you already set are kept
    return [header(palette), `export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS --color=${spec}"`, ''].join('\n')
  },
}
