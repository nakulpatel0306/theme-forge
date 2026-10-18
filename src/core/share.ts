import { parsePalette, SLOTS, type Palette } from './palette'
import { TOKEN_KINDS, type TokenKind } from './syntax'

// Compact, human-readable hash: #n=Kanagawa%20Dragon&c=181616-282727-...
// Colors are in SLOTS order so the link stays short. Style overrides, when
// there are any, ride along as s=keyword.red,string.cyan and i=0- (italic
// comments off, italic keywords left at the default).
export function encodeShare(palette: Palette): string {
  const params = new URLSearchParams({
    n: palette.name,
    c: SLOTS.map((slot) => palette.colors[slot].slice(1)).join('-'),
  })
  const { syntax, italicComments, italicKeywords } = palette.style ?? {}
  if (syntax && Object.keys(syntax).length) {
    params.set('s', Object.entries(syntax).map(([kind, slot]) => `${kind}.${slot}`).join(','))
  }
  if (italicComments !== undefined || italicKeywords !== undefined) {
    const flag = (v: boolean | undefined) => (v === undefined ? '-' : v ? '1' : '0')
    params.set('i', flag(italicComments) + flag(italicKeywords))
  }
  return params.toString()
}

export function decodeShare(hash: string): Palette | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const values = params.get('c')?.split('-')
  if (!values || values.length !== SLOTS.length) return null

  const syntax = Object.fromEntries(
    (params.get('s') ?? '')
      .split(',')
      .map((pair) => pair.split('.'))
      .filter(([kind]) => TOKEN_KINDS.includes(kind as TokenKind)),
  )
  const italics = params.get('i') ?? '--'
  const flag = (c: string | undefined) => (c === '1' ? true : c === '0' ? false : undefined)
  try {
    return parsePalette({
      name: params.get('n') ?? 'Shared theme',
      colors: Object.fromEntries(SLOTS.map((slot, i) => [slot, values[i]])),
      style: {
        syntax,
        italicComments: flag(italics[0]),
        italicKeywords: flag(italics[1]),
      },
    })
  } catch {
    return null
  }
}
