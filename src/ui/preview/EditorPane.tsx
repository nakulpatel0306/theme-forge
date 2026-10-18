import { SYNTAX } from '../../core/syntax'
import { highlight } from './highlight'

const FILE = 'src/core/color.ts'

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

const CURSOR_LINE = 8
const GIT_SIGNS: Record<number, 'add' | 'change' | 'delete'> = { 3: 'change', 6: 'add', 14: 'add' }
const DIAGNOSTICS: Record<number, { level: 'warn' | 'error'; text: string }> = {
  14: { level: 'warn', text: "'accent' is declared but never read" },
}

export function EditorPane() {
  return (
    <div className="pane editor">
      <div className="tabline">
        <span className="tab is-active">color.ts</span>
        <span className="tab">palette.ts</span>
      </div>

      <div className="code">
        {CODE.map((line, i) => {
          const n = i + 1
          const sign = GIT_SIGNS[n]
          const diag = DIAGNOSTICS[n]
          const tokens = highlight(line)
          const cursorAt = n === CURSOR_LINE ? tokens.findIndex((t) => t.text.trim()) : -1
          return (
            <div key={n} className="code-line" data-cursor={n === CURSOR_LINE || undefined}>
              <span className="git-sign" data-sign={sign} />
              <span className="line-nr">{n === CURSOR_LINE ? n : Math.abs(n - CURSOR_LINE)}</span>
              <span className="line-text">
                {tokens.map((t, j) => (
                  <span key={j} className={`tok-${t.kind}`} style={{ color: `var(--c-${SYNTAX[t.kind]})` }}>
                    {j === cursorAt ? <Cursor text={t.text} /> : t.text}
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
        <div className="code-line eob">~</div>
      </div>

      <div className="statusline">
        <span className="mode">NORMAL</span>
        <span className="branch">main</span>
        <span className="file">{FILE}</span>
        <span className="spacer" />
        <span className="diag-count">▲ 1</span>
        <span className="ft">typescript</span>
        <span className="pos">{CURSOR_LINE}:5</span>
      </div>
    </div>
  )
}

// Block cursor sits on the first non-blank character, like after pressing ^
function Cursor({ text }: { text: string }) {
  return (
    <>
      <span className="cursor">{text[0]}</span>
      {text.slice(1)}
    </>
  )
}
