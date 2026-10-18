import { SLOTS, type Palette } from '../core/palette'
import { PRESETS } from '../core/presets'
import './PresetPicker.css'

type Props = {
  current: string
  onPick: (palette: Palette) => void
}

export function PresetPicker({ current, onPick }: Props) {
  return (
    <div className="presets" role="list">
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          role="listitem"
          className="preset"
          aria-pressed={preset.name === current}
          onClick={() => onPick(preset)}
          style={{ background: preset.colors.bg, color: preset.colors.fg }}
        >
          <span className="preset-strip" aria-hidden>
            {SLOTS.slice(5).map((slot) => (
              <span key={slot} style={{ background: preset.colors[slot] }} />
            ))}
          </span>
          {preset.name}
        </button>
      ))}
    </div>
  )
}
