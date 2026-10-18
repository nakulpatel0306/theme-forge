import { SLOT_INFO, type Palette, type Slot } from '../core/palette'
import { styleOf, SYNTAX, TOKEN_KINDS, TOKEN_LABEL, type StyleOverrides, type TokenKind } from '../core/syntax'
import './SyntaxEditor.css'

// Background-ish slots would make code invisible, so they aren't offered
const CHOICES: Slot[] = ['fg', 'muted', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta']

type Props = {
  palette: Palette
  onChange: (style: StyleOverrides | undefined) => void
}

export function SyntaxEditor({ palette, onChange }: Props) {
  const style = styleOf(palette)
  const overrides = palette.style ?? {}

  const setSlot = (kind: TokenKind, slot: Slot) => {
    const syntax = { ...overrides.syntax, [kind]: slot }
    // Store only real changes, so the default mapping can evolve later
    if (SYNTAX[kind] === slot) delete syntax[kind]
    onChange(clean({ ...overrides, syntax }))
  }

  const setItalic = (key: 'italicComments' | 'italicKeywords', on: boolean) =>
    onChange(clean({ ...overrides, [key]: on ? undefined : false }))

  return (
    <div className="syntax">
      {TOKEN_KINDS.map((kind) => (
        <div key={kind} className="syntax-row" role="radiogroup" aria-label={`${TOKEN_LABEL[kind]} color`}>
          <span className="syntax-label" style={{ color: palette.colors[style.syntax[kind]] }}>
            {TOKEN_LABEL[kind]}
          </span>
          <span className="syntax-choices">
            {CHOICES.map((slot) => (
              <button
                key={slot}
                role="radio"
                aria-checked={style.syntax[kind] === slot}
                aria-label={SLOT_INFO[slot].label}
                title={SLOT_INFO[slot].label}
                style={{ background: palette.colors[slot] }}
                onClick={() => setSlot(kind, slot)}
              />
            ))}
          </span>
        </div>
      ))}
      <div className="syntax-toggles">
        <label>
          <input
            type="checkbox"
            checked={style.italicComments}
            onChange={(e) => setItalic('italicComments', e.target.checked)}
          />
          <em>Italic comments</em>
        </label>
        <label>
          <input
            type="checkbox"
            checked={style.italicKeywords}
            onChange={(e) => setItalic('italicKeywords', e.target.checked)}
          />
          <em>Italic keywords</em>
        </label>
        {palette.style && (
          <button className="button small" onClick={() => onChange(undefined)}>
            Reset to defaults
          </button>
        )}
      </div>
    </div>
  )
}

function clean(style: StyleOverrides): StyleOverrides | undefined {
  const out: StyleOverrides = {}
  if (style.syntax && Object.keys(style.syntax).length) out.syntax = style.syntax
  if (style.italicComments === false) out.italicComments = false
  if (style.italicKeywords === false) out.italicKeywords = false
  return Object.keys(out).length ? out : undefined
}
