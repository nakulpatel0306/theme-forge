import { useState } from 'react'
import { contrast, isHex, normalizeHex } from '../core/color'
import { SLOT_INFO, SLOTS, type Colors, type Slot } from '../core/palette'
import './SwatchEditor.css'

type Props = {
  colors: Colors
  onChange: (slot: Slot, hex: string) => void
}

export function SwatchEditor({ colors, onChange }: Props) {
  return (
    <ul className="swatches">
      {SLOTS.map((slot) => (
        <Swatch key={slot} slot={slot} value={colors[slot]} bg={colors.bg} onChange={onChange} />
      ))}
    </ul>
  )
}

type SwatchProps = {
  slot: Slot
  value: string
  bg: string
  onChange: Props['onChange']
}

function Swatch({ slot, value, bg, onChange }: SwatchProps) {
  // Keep a draft so half-typed hex like "#c47" doesn't get rejected mid-keystroke
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  const commit = (next: string) => {
    if (isHex(next)) onChange(slot, normalizeHex(next))
    else setDraft(value)
  }

  // Background-ish slots aren't read as text, so a contrast score would be noise
  const ratio = slot === 'bg' || slot === 'surface' || slot === 'overlay' ? null : contrast(value, bg)
  const { label, hint } = SLOT_INFO[slot]

  return (
    <li className="swatch">
      <label className="swatch-chip" style={{ background: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(slot, e.target.value)}
          aria-label={`${label} color picker`}
        />
      </label>
      <div className="swatch-text">
        <span className="swatch-label">{label}</span>
        <span className="swatch-hint">{hint}</span>
      </div>
      <input
        className="swatch-hex"
        value={draft}
        spellCheck={false}
        aria-label={`${label} hex value`}
        onChange={(e) => {
          setDraft(e.target.value)
          if (isHex(e.target.value) && e.target.value.replace('#', '').length === 6) {
            onChange(slot, normalizeHex(e.target.value))
          }
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit(e.currentTarget.value)}
      />
      {ratio !== null && (
        <span
          className="swatch-contrast"
          data-low={ratio < 3 || undefined}
          title={`Contrast against the background: ${ratio.toFixed(2)} to 1`}
        >
          {ratio.toFixed(1)}
        </span>
      )}
    </li>
  )
}
