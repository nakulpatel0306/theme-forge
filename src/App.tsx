import { PRESETS } from './core/presets'
import { SLOTS } from './core/palette'

export default function App() {
  return (
    <main>
      {PRESETS.map((p) => (
        <div key={p.name} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {SLOTS.map((s) => (
            <span key={s} style={{ width: 24, height: 24, background: p.colors[s] }} />
          ))}
          <span>{p.name}</span>
        </div>
      ))}
    </main>
  )
}
