import type { Slot } from './palette'

// One source of truth for "what color is a keyword". The live preview and the
// editor targets both read this, so what you see is what you export.
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
