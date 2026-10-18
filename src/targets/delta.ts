import { isLight, mix } from '../core/color'
import { derived } from '../core/palette'
import { header, type Target } from './types'

export const delta: Target = {
  id: 'delta',
  name: 'delta',
  kind: 'tool',
  path: (slug) => `.config/delta/themes/${slug}.gitconfig`,
  setup: (slug) =>
    `In ~/.gitconfig add \`[include] path = ~/.config/delta/themes/${slug}.gitconfig\` and \`features = ${slug}\` under [delta]`,
  render(palette, slug) {
    const { colors: c } = palette
    const d = derived(palette)
    // Syntax highlighting comes from the bat theme, which bat names after the file
    return [
      header(palette),
      `[delta "${slug}"]`,
      `  ${isLight(c.bg) ? 'light' : 'dark'} = true`,
      `  syntax-theme = ${slug}`,
      `  minus-style = syntax "${d.diffDeleteBg}"`,
      `  minus-emph-style = syntax "${mix(c.bg, c.red, 0.35)}"`,
      `  plus-style = syntax "${d.diffAddBg}"`,
      `  plus-emph-style = syntax "${mix(c.bg, c.green, 0.35)}"`,
      `  line-numbers-minus-style = "${c.red}"`,
      `  line-numbers-plus-style = "${c.green}"`,
      `  line-numbers-zero-style = "${c.muted}"`,
      `  line-numbers-left-style = "${c.overlay}"`,
      `  line-numbers-right-style = "${c.overlay}"`,
      `  file-style = "${c.blue}" bold`,
      `  file-decoration-style = "${c.blue}" ul`,
      `  hunk-header-style = file line-number syntax`,
      `  hunk-header-decoration-style = "${c.overlay}" box`,
      `  hunk-header-line-number-style = "${c.yellow}"`,
      `  hunk-header-file-style = "${c.blue}"`,
      `  commit-style = "${c.yellow}" bold`,
      `  commit-decoration-style = "${c.yellow}" box`,
      `  blame-palette = "${c.bg} ${c.surface} ${c.overlay}"`,
      '',
    ].join('\n')
  },
}
