import type { Palette, Slot } from './palette'

// Default answer to "what color is a keyword". The live preview and every
// editor target read styleOf(palette), which layers the palette's own
// overrides on top of this, so what you see is what you export.
export const SYNTAX = {
  comment: 'muted',
  keyword: 'magenta',
  function: 'blue',
  string: 'green',
  number: 'orange',
  type: 'yellow',
  operator: 'cyan',
  variable: 'fg',
  punctuation: 'fg',
} as const satisfies Record<string, Slot>

export type TokenKind = keyof typeof SYNTAX
export type Syntax = Record<TokenKind, Slot>
export const TOKEN_KINDS = Object.keys(SYNTAX) as TokenKind[]

export const TOKEN_LABEL: Record<TokenKind, string> = {
  comment: 'Comments',
  keyword: 'Keywords',
  function: 'Functions',
  string: 'Strings',
  number: 'Numbers',
  type: 'Types',
  operator: 'Operators',
  variable: 'Variables',
  punctuation: 'Punctuation',
}

// Stored on a palette only when the user changes something
export type StyleOverrides = {
  syntax?: Partial<Syntax>
  italicComments?: boolean
  italicKeywords?: boolean
}

export type Style = { syntax: Syntax; italicComments: boolean; italicKeywords: boolean }

export function styleOf(palette: Palette): Style {
  return {
    syntax: { ...SYNTAX, ...palette.style?.syntax },
    italicComments: palette.style?.italicComments ?? true,
    italicKeywords: palette.style?.italicKeywords ?? true,
  }
}
