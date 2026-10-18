import type { Palette } from '../../core/palette'
import { styleOf } from '../../core/syntax'
import { highlight } from './highlight'

export const FILE = 'src/core/color.ts'

const CODE = [
  `import { hexToRgb, rgbToHex } from './hex'`,
  ``,
  `// Blend two colors in sRGB space`,
  `export function mix(a: string, b: string, t = 0.5): string {`,
  `  const [x, y] = [hexToRgb(a), hexToRgb(b)]`,
  `  if (t < 0 || t > 1) throw new RangeError('t must be 0..1')`,
  `  return rgbToHex({`,
  `    r: x.r + (y.r - x.r) * t,`,
  `    g: x.g + (y.g - x.g) * t,`,
  `    b: x.b + (y.b - x.b) * t,`,
  `  })`,
  `}`,
  ``,
  `const accent = mix('#c4746e', '#8ba4b0', 0.25)`,
]

export const CURSOR_LINE = 8
const GIT_SIGNS: Record<number, 'add' | 'change' | 'delete'> = { 3: 'change', 6: 'add', 14: 'add' }
const DIAGNOSTICS: Record<number, { level: 'warn' | 'error'; text: string }> = {
  14: { level: 'warn', text: "'accent' is declared but never read" },
}

type Props = {
  palette: Palette
  // Neovim users mostly run relative numbers; VS Code shows absolute ones
  relativeNumbers?: boolean
  blockCursor?: boolean
}

export function CodeView({ palette, relativeNumbers = false, blockCursor = false }: Props) {
  const { syntax, italicComments, italicKeywords } = styleOf(palette)
  const italic: Record<string, boolean> = { comment: italicComments, keyword: italicKeywords }

  return (
    <div className="code">
      {CODE.map((line, i) => {
        const n = i + 1
        const diag = DIAGNOSTICS[n]
        const tokens = highlight(line)
        const cursorAt = blockCursor && n === CURSOR_LINE ? tokens.findIndex((t) => t.text.trim()) : -1
        return (
          <div key={n} className="code-line" data-cursor={n === CURSOR_LINE || undefined}>
            <span className="git-sign" data-sign={GIT_SIGNS[n]} />
            <span className="line-nr">{relativeNumbers && n !== CURSOR_LINE ? Math.abs(n - CURSOR_LINE) : n}</span>
            <span className="line-text">
              {tokens.map((t, j) => (
                <span
                  key={j}
                  style={{ color: `var(--c-${syntax[t.kind]})`, fontStyle: italic[t.kind] ? 'italic' : undefined }}
                >
                  {j === cursorAt ? (
                    <>
                      <span className="cursor">{t.text[0]}</span>
                      {t.text.slice(1)}
                    </>
                  ) : (
                    t.text
                  )}
                </span>
              ))}
              {diag && (
                <span className="virtual-text" data-level={diag.level}>
                  ● {diag.text}
                </span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
