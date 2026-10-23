import { derived, type Slot } from '../core/palette'
import { styleOf } from '../core/syntax'
import { header, type Target } from './types'

export const fish: Target = {
  id: 'fish',
  name: 'fish',
  kind: 'tool',
  path: (slug) => `.config/fish/themes/${slug}.theme`,
  setup: (slug) => `Add \`fish_config theme choose ${slug}\` to ~/.config/fish/config.fish`,
  render(palette) {
    const { colors: c } = palette
    const d = derived(palette)
    const { syntax: s, italicComments, italicKeywords } = styleOf(palette)
    // set_color documents hex as bare digits, which is also how fish's bundled themes write it
    const hex = (value: string) => value.slice(1)
    const slot = (name: Slot) => hex(c[name])
    const italic = (on: boolean) => (on ? ' --italics' : '')
    const theme: [string, string][] = [
      ['fish_color_normal', hex(c.fg)],
      ['fish_color_command', slot(s.function)],
      ['fish_color_keyword', slot(s.keyword) + italic(italicKeywords)],
      ['fish_color_quote', slot(s.string)],
      ['fish_color_redirection', slot(s.operator)],
      ['fish_color_end', slot(s.operator)],
      ['fish_color_error', hex(c.red)],
      ['fish_color_param', slot(s.variable)],
      ['fish_color_valid_path', `${slot(s.variable)} --underline`],
      ['fish_color_option', hex(c.cyan)],
      ['fish_color_comment', slot(s.comment) + italic(italicComments)],
      ['fish_color_selection', `${hex(c.fg)} --background=${hex(d.selection)}`],
      ['fish_color_operator', slot(s.operator)],
      ['fish_color_escape', slot(s.number)],
      ['fish_color_autosuggestion', hex(c.muted)],
      ['fish_color_cwd', hex(c.green)],
      ['fish_color_cwd_root', hex(c.red)],
      ['fish_color_user', hex(c.blue)],
      ['fish_color_host', hex(c.magenta)],
      ['fish_color_host_remote', hex(c.yellow)],
      ['fish_color_status', hex(c.red)],
      ['fish_color_cancel', `${hex(c.red)} --reverse`],
      ['fish_color_search_match', `--background=${hex(d.selection)}`],
      ['fish_color_history_current', `${hex(c.yellow)} --bold`],
      ['fish_pager_color_progress', hex(c.muted)],
      ['fish_pager_color_prefix', `${hex(c.blue)} --bold`],
      ['fish_pager_color_completion', hex(c.fg)],
      ['fish_pager_color_description', hex(c.muted)],
      ['fish_pager_color_selected_background', `--background=${hex(d.selection)}`],
    ]
    return [
      header(palette),
      // Read by the theme picker in `fish_config`; it has no way to escape quotes
      `# name: '${palette.name.replace(/'/g, '')}'`,
      `# preferred_background: ${hex(c.bg)}`,
      '',
      ...theme.map(([k, v]) => `${k} ${v}`),
      '',
    ].join('\n')
  },
}
