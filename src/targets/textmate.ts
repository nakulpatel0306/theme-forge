import type { Palette, Slot } from '../core/palette'
import { styleOf, type TokenKind } from '../core/syntax'

export type TokenRule = { name: string; scope: string[]; foreground: string; fontStyle?: string }

// TextMate scopes for each token kind. bat, delta (through bat) and VS Code
// all highlight with these, so they share one list.
const SCOPES: [TokenKind, string[], string?][] = [
  ['comment', ['comment', 'punctuation.definition.comment']],
  ['keyword', ['keyword', 'storage', 'storage.type', 'keyword.control']],
  ['function', ['entity.name.function', 'support.function', 'meta.function-call variable.function']],
  ['string', ['string', 'punctuation.definition.string']],
  ['number', ['constant.numeric', 'constant.language', 'constant.character', 'constant.other']],
  ['type', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class']],
  // Explicit empty style, otherwise operators inherit italics from `keyword`
  ['operator', ['keyword.operator'], ''],
  ['variable', ['variable', 'variable.parameter', 'meta.property']],
  ['punctuation', ['punctuation']],
]

const MARKUP: [Slot, string[], string?][] = [
  ['green', ['markup.inserted']],
  ['red', ['markup.deleted', 'invalid']],
  ['blue', ['markup.changed', 'markup.heading', 'entity.name.section'], 'bold'],
  ['cyan', ['markup.underline.link', 'string.other.link']],
  ['yellow', ['entity.name.tag']],
  ['orange', ['entity.other.attribute-name']],
]

export function tokenRules(palette: Palette): TokenRule[] {
  const { colors } = palette
  const { syntax, italicComments, italicKeywords } = styleOf(palette)
  // Always explicit so turning italics off also overrides inherited styles
  const italic: Partial<Record<TokenKind, string>> = {
    comment: italicComments ? 'italic' : '',
    keyword: italicKeywords ? 'italic' : '',
  }
  return [
    ...SCOPES.map(([kind, scope, fontStyle]) => ({
      name: kind,
      scope,
      foreground: colors[syntax[kind]],
      fontStyle: italic[kind] ?? fontStyle,
    })),
    ...MARKUP.map(([slot, scope, fontStyle]) => ({ name: scope[0], scope, foreground: colors[slot], fontStyle })),
  ]
}
