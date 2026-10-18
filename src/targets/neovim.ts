import { isLight, mix } from '../core/color'
import { ansi, derived, SLOTS, type Palette, type Slot } from '../core/palette'
import { styleOf } from '../core/syntax'
import { header, type Target } from './types'

type Spec = { fg?: Slot | string; bg?: Slot | string; sp?: Slot | string; bold?: true; italic?: true; undercurl?: true; link?: string }

// Values are palette slot names (emitted as c.<slot>) or literal hex strings
function groups(palette: Palette, d: ReturnType<typeof derived>): Record<string, Spec> {
  const { colors } = palette
  const { syntax: s, italicComments, italicKeywords } = styleOf(palette)
  const italic = (on: boolean): Spec => (on ? { italic: true } : {})
  return {
    Normal: { fg: 'fg', bg: 'bg' },
    NormalFloat: { fg: 'fg', bg: 'surface' },
    FloatBorder: { fg: 'overlay', bg: 'surface' },
    Cursor: { fg: 'bg', bg: 'fg' },
    CursorLine: { bg: d.lineHighlight },
    CursorLineNr: { fg: 'yellow', bold: true },
    LineNr: { fg: 'muted' },
    SignColumn: { bg: 'bg' },
    ColorColumn: { bg: 'surface' },
    Visual: { bg: 'overlay' },
    Search: { fg: 'bg', bg: 'yellow' },
    IncSearch: { fg: 'bg', bg: 'orange' },
    CurSearch: { link: 'IncSearch' },
    MatchParen: { fg: 'orange', bold: true },
    StatusLine: { fg: 'fg', bg: 'surface' },
    StatusLineNC: { fg: 'muted', bg: 'surface' },
    TabLine: { fg: 'muted', bg: 'surface' },
    TabLineSel: { fg: 'fg', bg: 'bg' },
    TabLineFill: { bg: 'surface' },
    WinSeparator: { fg: 'overlay' },
    Pmenu: { fg: 'fg', bg: 'surface' },
    PmenuSel: { fg: 'fg', bg: 'overlay', bold: true },
    PmenuSbar: { bg: 'surface' },
    PmenuThumb: { bg: 'overlay' },
    Folded: { fg: 'muted', bg: 'surface' },
    NonText: { fg: 'overlay' },
    EndOfBuffer: { fg: 'overlay' },
    Whitespace: { fg: 'overlay' },
    Title: { fg: 'blue', bold: true },
    Directory: { fg: 'blue' },
    ErrorMsg: { fg: 'red' },
    WarningMsg: { fg: 'yellow' },
    MoreMsg: { fg: 'green' },
    Question: { fg: 'cyan' },

    Comment: { fg: s.comment, ...italic(italicComments) },
    Constant: { fg: s.number },
    String: { fg: s.string },
    Character: { fg: s.string },
    Number: { fg: s.number },
    Boolean: { fg: s.number },
    Float: { fg: s.number },
    Identifier: { fg: s.variable },
    Function: { fg: s.function },
    Statement: { fg: s.keyword },
    Keyword: { fg: s.keyword, ...italic(italicKeywords) },
    Conditional: { fg: s.keyword },
    Repeat: { fg: s.keyword },
    Exception: { fg: s.keyword },
    Operator: { fg: s.operator },
    PreProc: { fg: s.keyword },
    Include: { fg: s.keyword },
    Type: { fg: s.type },
    StorageClass: { fg: s.keyword },
    Structure: { fg: s.type },
    Special: { fg: 'cyan' },
    Delimiter: { fg: s.punctuation },
    Todo: { fg: 'bg', bg: 'yellow', bold: true },
    Error: { fg: 'red' },
    '@variable': { fg: s.variable },
    '@variable.member': { fg: s.variable },
    '@property': { fg: s.variable },
    '@punctuation': { fg: s.punctuation },

    DiffAdd: { bg: d.diffAddBg },
    DiffChange: { bg: d.diffChangeBg },
    DiffDelete: { fg: 'red', bg: d.diffDeleteBg },
    DiffText: { bg: mix(colors.bg, colors.blue, 0.3) },
    Added: { fg: 'green' },
    Changed: { fg: 'blue' },
    Removed: { fg: 'red' },
    GitSignsAdd: { fg: 'green' },
    GitSignsChange: { fg: 'blue' },
    GitSignsDelete: { fg: 'red' },

    DiagnosticError: { fg: 'red' },
    DiagnosticWarn: { fg: 'yellow' },
    DiagnosticInfo: { fg: 'blue' },
    DiagnosticHint: { fg: 'cyan' },
    DiagnosticOk: { fg: 'green' },
    DiagnosticUnderlineError: { sp: 'red', undercurl: true },
    DiagnosticUnderlineWarn: { sp: 'yellow', undercurl: true },
    DiagnosticUnderlineInfo: { sp: 'blue', undercurl: true },
    DiagnosticUnderlineHint: { sp: 'cyan', undercurl: true },
  }
}

const isSlot = (value: string): value is Slot => (SLOTS as readonly string[]).includes(value)

function lua(spec: Spec): string {
  if (spec.link) return `{ link = '${spec.link}' }`
  const parts: string[] = []
  for (const key of ['fg', 'bg', 'sp'] as const) {
    const value = spec[key]
    if (value) parts.push(`${key} = ${isSlot(value) ? `c.${value}` : `'${value}'`}`)
  }
  for (const flag of ['bold', 'italic', 'undercurl'] as const) {
    if (spec[flag]) parts.push(`${flag} = true`)
  }
  return `{ ${parts.join(', ')} }`
}

export const neovim: Target = {
  id: 'neovim',
  name: 'Neovim',
  kind: 'editor',
  path: (slug) => `.config/nvim/colors/${slug}.lua`,
  setup: (slug) => `Run \`:colorscheme ${slug}\`, or set it in your config`,
  render(palette, slug) {
    const { colors } = palette
    const d = derived(palette)
    const { normal, bright } = ansi(palette)
    const key = (name: string) => (/^[A-Za-z]\w*$/.test(name) ? name : `['${name}']`)

    return [
      header(palette, '--'),
      `vim.cmd('highlight clear')`,
      `vim.o.background = '${isLight(colors.bg) ? 'light' : 'dark'}'`,
      `vim.g.colors_name = '${slug}'`,
      '',
      'local c = {',
      ...SLOTS.map((slot) => `  ${slot} = '${colors[slot]}',`),
      '}',
      '',
      'local groups = {',
      ...Object.entries(groups(palette, d)).map(([name, spec]) => `  ${key(name)} = ${lua(spec)},`),
      '}',
      '',
      'for name, spec in pairs(groups) do',
      '  vim.api.nvim_set_hl(0, name, spec)',
      'end',
      '',
      ...[...normal, ...bright].map((hex, i) => `vim.g.terminal_color_${i} = '${hex}'`),
      '',
    ].join('\n')
  },
}
