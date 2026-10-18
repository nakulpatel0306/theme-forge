import { useState } from 'react'
import { contrast, isHex, normalizeHex } from '../core/color'
import { fixContrast } from '../core/generate'
import { SLOT_INFO, SLOTS, type Colors, type Slot } from '../core/palette'
import './SwatchEditor.css'

type Props = {
  colors: Colors
  locked: ReadonlySet<Slot>
  onChange: (slot: Slot, hex: string) => void
  onToggleLock: (slot: Slot) => void
}

// Text needs 4.5:1 to read comfortably; accents and comments can live at 3:1
const TARGET: Partial<Record<Slot, number>> = { fg: 4.5 }

export function SwatchEditor({ colors, locked, onChange, onToggleLock }: Props) {
  return (
    <ul className="swatches">
      {SLOTS.map((slot) => (
        <Swatch
          key={slot}
          slot={slot}
          value={colors[slot]}
          bg={colors.bg}
          locked={locked.has(slot)}
          onChange={onChange}
          onToggleLock={onToggleLock}
        />
      ))}
    </ul>
  )
}

type SwatchProps = {
  slot: Slot
  value: string
  bg: string
  locked: boolean
  onChange: Props['onChange']
  onToggleLock: Props['onToggleLock']
}

function Swatch({ slot, value, bg, locked, onChange, onToggleLock }: SwatchProps) {
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
  const target = TARGET[slot] ?? 3
  const { label, hint } = SLOT_INFO[slot]

  return (
    <li className="swatch" data-locked={locked || undefined}>
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
      {ratio === null ? (
        <span />
      ) : ratio < target ? (
        <button
          className="swatch-contrast swatch-fix"
          onClick={() => onChange(slot, fixContrast(value, bg, target))}
          title={`Only ${ratio.toFixed(2)}:1 against the background. Click to lighten or darken it to ${target}:1, keeping its hue.`}
        >
          Fix
        </button>
      ) : (
        <span className="swatch-contrast" title={`Contrast against the background: ${ratio.toFixed(2)} to 1`}>
          {ratio.toFixed(1)}
        </span>
      )}
      <button
        className="swatch-lock"
        aria-pressed={locked}
        aria-label={`${locked ? 'Unlock' : 'Lock'} ${label}`}
        title={locked ? 'Locked: generators leave this color alone' : 'Lock so generators leave this color alone'}
        onClick={() => onToggleLock(slot)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d={locked ? 'M5.5 7V5a2.5 2.5 0 0 1 5 0v2' : 'M5.5 7V5a2.5 2.5 0 0 1 4.9-.7'} />
        </svg>
      </button>
    </li>
  )
}
