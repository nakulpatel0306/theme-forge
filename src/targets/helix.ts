import { derived, SLOTS } from '../core/palette'
import { SYNTAX } from '../core/syntax'
import { header, type Target } from './types'

type Style = { fg?: string; bg?: string; modifiers?: string[]; underline?: { color: string; style: string } }

const toml = (style: Style) =>
  `{ ${Object.entries(style)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k} = [${v.map((m) => `"${m}"`).join(', ')}]`
      if (typeof v === 'object') return `${k} = { color = "${v.color}", style = "${v.style}" }`
      return `${k} = "${v}"`
    })
    .join(', ')} }`

export const helix: Target = {
  id: 'helix',
  name: 'Helix',
  kind: 'editor',
  path: (slug) => `.config/helix/themes/${slug}.toml`,
  setup: (slug) => `Add \`theme = "${slug}"\` to ~/.config/helix/config.toml`,
  render(palette) {
    const d = derived(palette)
    const s = SYNTAX
    // Values are palette names, defined in the [palette] table at the bottom
    const scopes: Record<string, Style> = {
      'ui.background': { bg: 'bg' },
      'ui.text': { fg: 'fg' },
      'ui.text.focus': { fg: 'fg', modifiers: ['bold'] },
      'ui.cursor': { fg: 'bg', bg: 'muted' },
      'ui.cursor.primary': { fg: 'bg', bg: 'fg' },
      'ui.cursor.match': { fg: 'orange', modifiers: ['bold'] },
      'ui.cursorline.primary': { bg: 'line' },
      'ui.selection': { bg: 'overlay' },
      'ui.linenr': { fg: 'muted' },
      'ui.linenr.selected': { fg: 'yellow', modifiers: ['bold'] },
      'ui.gutter': { bg: 'bg' },
      'ui.statusline': { fg: 'fg', bg: 'surface' },
      'ui.statusline.inactive': { fg: 'muted', bg: 'surface' },
      'ui.statusline.normal': { fg: 'bg', bg: 'blue', modifiers: ['bold'] },
      'ui.statusline.insert': { fg: 'bg', bg: 'green', modifiers: ['bold'] },
      'ui.statusline.select': { fg: 'bg', bg: 'magenta', modifiers: ['bold'] },
      'ui.popup': { fg: 'fg', bg: 'surface' },
      'ui.window': { fg: 'overlay' },
      'ui.help': { fg: 'fg', bg: 'surface' },
      'ui.menu': { fg: 'fg', bg: 'surface' },
      'ui.menu.selected': { fg: 'fg', bg: 'overlay', modifiers: ['bold'] },
      'ui.virtual.whitespace': { fg: 'overlay' },
      'ui.virtual.indent-guide': { fg: 'surface' },
      'ui.virtual.inlay-hint': { fg: 'muted' },
      'ui.virtual.ruler': { bg: 'surface' },

      comment: { fg: s.comment, modifiers: ['italic'] },
      keyword: { fg: s.keyword, modifiers: ['italic'] },
      function: { fg: s.function },
      string: { fg: s.string },
      'constant.character.escape': { fg: s.operator },
      constant: { fg: s.number },
      'constant.numeric': { fg: s.number },
      type: { fg: s.type },
      constructor: { fg: s.type },
      operator: { fg: s.operator },
      variable: { fg: s.variable },
      'variable.other.member': { fg: s.variable },
      punctuation: { fg: s.punctuation },
      tag: { fg: 'yellow' },
      attribute: { fg: 'orange' },
      namespace: { fg: 'cyan' },
      label: { fg: 'magenta' },
      'markup.heading': { fg: 'blue', modifiers: ['bold'] },
      'markup.link.url': { fg: 'cyan', modifiers: ['underlined'] },
      'markup.bold': { modifiers: ['bold'] },
      'markup.italic': { modifiers: ['italic'] },

      'diff.plus': { fg: 'green' },
      'diff.minus': { fg: 'red' },
      'diff.delta': { fg: 'blue' },
      error: { fg: 'red' },
      warning: { fg: 'yellow' },
      info: { fg: 'blue' },
      hint: { fg: 'cyan' },
      'diagnostic.error': { underline: { color: 'red', style: 'curl' } },
      'diagnostic.warning': { underline: { color: 'yellow', style: 'curl' } },
      'diagnostic.info': { underline: { color: 'blue', style: 'curl' } },
      'diagnostic.hint': { underline: { color: 'cyan', style: 'curl' } },
    }

    return [
      header(palette),
      ...Object.entries(scopes).map(([scope, style]) => `"${scope}" = ${toml(style)}`),
      '',
      '[palette]',
      ...SLOTS.map((slot) => `${slot} = "${palette.colors[slot]}"`),
      `line = "${d.lineHighlight}"`,
      '',
    ].join('\n')
  },
}
