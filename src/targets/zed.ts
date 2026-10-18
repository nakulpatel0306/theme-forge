import { isLight, mix, withAlphaHex } from '../core/color'
import { ansi, derived, type Palette } from '../core/palette'
import { styleOf, type TokenKind } from '../core/syntax'
import type { Target } from './types'

const ANSI_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

// Zed syntax names that map onto our token kinds
const SYNTAX_KEYS: [string, TokenKind][] = [
  ['comment', 'comment'],
  ['comment.doc', 'comment'],
  ['keyword', 'keyword'],
  ['function', 'function'],
  ['string', 'string'],
  ['string.escape', 'operator'],
  ['number', 'number'],
  ['boolean', 'number'],
  ['constant', 'number'],
  ['type', 'type'],
  ['constructor', 'type'],
  ['operator', 'operator'],
  ['variable', 'variable'],
  ['property', 'variable'],
  ['punctuation', 'punctuation'],
  ['punctuation.bracket', 'punctuation'],
  ['punctuation.delimiter', 'punctuation'],
]

function style(palette: Palette) {
  const { colors: c } = palette
  const d = derived(palette)
  const { normal, bright } = ansi(palette)
  const panel = mix(c.bg, c.surface, 0.5)

  const style = styleOf(palette)
  const italic = (kind: TokenKind) =>
    (kind === 'comment' && style.italicComments) || (kind === 'keyword' && style.italicKeywords)
  const syntax = Object.fromEntries(
    SYNTAX_KEYS.map(([key, kind]) => [
      key,
      italic(kind) ? { color: c[style.syntax[kind]], font_style: 'italic' } : { color: c[style.syntax[kind]] },
    ]),
  )
  Object.assign(syntax, {
    tag: { color: c.yellow },
    attribute: { color: c.orange },
    title: { color: c.blue, font_weight: 700 },
    link_text: { color: c.cyan },
    link_uri: { color: c.cyan },
  })

  return {
    background: c.surface,
    border: c.overlay,
    'border.variant': c.surface,
    'border.focused': c.blue,
    'border.selected': c.blue,
    'border.transparent': '#00000000',
    'border.disabled': c.surface,
    'surface.background': panel,
    'elevated_surface.background': c.surface,
    'element.background': c.surface,
    'element.hover': c.overlay,
    'element.active': c.overlay,
    'element.selected': c.overlay,
    'element.disabled': c.surface,
    'ghost_element.hover': withAlphaHex(c.overlay, 0.6),
    'ghost_element.selected': c.overlay,
    text: c.fg,
    'text.muted': c.muted,
    'text.placeholder': c.muted,
    'text.disabled': c.overlay,
    'text.accent': c.blue,
    icon: c.fg,
    'icon.muted': c.muted,
    'icon.accent': c.blue,
    'status_bar.background': c.surface,
    'title_bar.background': c.surface,
    'title_bar.inactive_background': c.surface,
    'toolbar.background': c.bg,
    'tab_bar.background': c.surface,
    'tab.inactive_background': c.surface,
    'tab.active_background': c.bg,
    'panel.background': panel,
    'panel.focused_border': c.blue,
    'scrollbar.thumb.background': withAlphaHex(c.overlay, 0.6),
    'scrollbar.track.background': '#00000000',
    'editor.background': c.bg,
    'editor.foreground': c.fg,
    'editor.gutter.background': c.bg,
    'editor.active_line.background': d.lineHighlight,
    'editor.line_number': c.muted,
    'editor.active_line_number': c.yellow,
    'editor.indent_guide': c.surface,
    'editor.indent_guide_active': c.overlay,
    'editor.invisible': c.overlay,
    'editor.wrap_guide': c.surface,
    'editor.document_highlight.read_background': withAlphaHex(c.overlay, 0.6),
    'editor.document_highlight.write_background': withAlphaHex(c.overlay, 0.8),
    'terminal.background': c.bg,
    'terminal.foreground': c.fg,
    'terminal.ansi.background': c.bg,
    ...Object.fromEntries(normal.map((hex, i) => [`terminal.ansi.${ANSI_NAMES[i]}`, hex])),
    ...Object.fromEntries(bright.map((hex, i) => [`terminal.ansi.bright_${ANSI_NAMES[i]}`, hex])),
    error: c.red,
    warning: c.yellow,
    info: c.blue,
    hint: c.cyan,
    success: c.green,
    created: c.green,
    modified: c.yellow,
    deleted: c.red,
    conflict: c.magenta,
    ignored: c.muted,
    hidden: c.muted,
    players: [{ cursor: d.cursor, background: d.cursor, selection: withAlphaHex(c.overlay, 0.9) }],
    syntax,
  }
}

export const zed: Target = {
  id: 'zed',
  name: 'Zed',
  kind: 'editor',
  path: (slug) => `.config/zed/themes/${slug}.json`,
  setup: () => 'Restart Zed, then pick the theme with `theme selector: toggle`',
  render(palette) {
    const theme = {
      $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
      name: palette.name,
      author: 'theme-forge',
      themes: [
        {
          name: palette.name,
          appearance: isLight(palette.colors.bg) ? 'light' : 'dark',
          style: style(palette),
        },
      ],
    }
    return JSON.stringify(theme, null, 2) + '\n'
  },
}
