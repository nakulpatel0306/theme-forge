import { derived } from '../core/palette'
import { header, type Target } from './types'

export const lazygit: Target = {
  id: 'lazygit',
  name: 'lazygit',
  kind: 'tool',
  path: (slug) => `.config/lazygit/themes/${slug}.yml`,
  setup: (slug) =>
    `Append \`,$HOME/.config/lazygit/themes/${slug}.yml\` to LG_CONFIG_FILE (lazygit merges comma-separated configs)`,
  render(palette) {
    const { colors: c } = palette
    const d = derived(palette)
    const color = (hex: string, ...attrs: string[]) => `['${hex}'${attrs.map((a) => `, ${a}`).join('')}]`
    return [
      header(palette),
      'gui:',
      '  theme:',
      `    activeBorderColor: ${color(c.blue, 'bold')}`,
      `    inactiveBorderColor: ${color(c.overlay)}`,
      `    searchingActiveBorderColor: ${color(c.yellow, 'bold')}`,
      `    optionsTextColor: ${color(c.blue)}`,
      `    selectedLineBgColor: ${color(d.selection)}`,
      `    inactiveViewSelectedLineBgColor: ${color(c.surface)}`,
      `    cherryPickedCommitFgColor: ${color(c.cyan)}`,
      `    cherryPickedCommitBgColor: ${color(c.overlay)}`,
      `    markedBaseCommitFgColor: ${color(c.blue)}`,
      `    markedBaseCommitBgColor: ${color(c.yellow)}`,
      `    unstagedChangesColor: ${color(c.red)}`,
      `    defaultFgColor: ${color(c.fg)}`,
      '',
    ].join('\n')
  },
}
