import type { TokenKind } from '../../core/syntax'

export type Token = { kind: TokenKind; text: string }

const KEYWORDS = new Set([
  'export', 'function', 'const', 'let', 'return', 'if', 'else', 'throw', 'new',
  'import', 'from', 'type', 'for', 'of', 'await', 'async',
])

// Good enough for the hand-picked preview snippet; not a general TS lexer
const RULES: [TokenKind | 'ident' | 'space', RegExp][] = [
  ['comment', /^\/\/.*/],
  ['string', /^(['"`])(?:\\.|(?!\1).)*\1/],
  ['number', /^\d+(?:\.\d+)?/],
  ['space', /^\s+/],
  ['ident', /^[A-Za-z_$][\w$]*/],
  ['operator', /^(?:=>|===|!==|[=+\-*/<>!?:&|]+)/],
  ['punctuation', /^[{}()[\],.;]/],
]

export function highlight(line: string): Token[] {
  const tokens: Token[] = []
  let rest = line
  while (rest) {
    const rule = RULES.find(([, re]) => re.test(rest))
    const text = rule ? rest.match(rule[1])![0] : rest[0]
    rest = rest.slice(text.length)

    let kind: TokenKind = rule && rule[0] !== 'ident' && rule[0] !== 'space' ? rule[0] : 'variable'
    if (rule?.[0] === 'ident') {
      if (KEYWORDS.has(text)) kind = 'keyword'
      else if (/^[A-Z]/.test(text)) kind = 'type'
      else if (rest.startsWith('(')) kind = 'function'
    }
    tokens.push({ kind, text })
  }
  return tokens
}
