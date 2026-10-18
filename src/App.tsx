import type { Slot } from './core/palette'
import { ExportPanel } from './ui/ExportPanel'
import { OpenPalette } from './ui/OpenPalette'
import { PresetPicker } from './ui/PresetPicker'
import { Preview } from './ui/preview/Preview'
import { SwatchEditor } from './ui/SwatchEditor'
import { usePalette } from './ui/usePalette'
import { usePaletteVars } from './ui/usePaletteVars'
import './App.css'

export default function App() {
  const [palette, setPalette] = usePalette()
  usePaletteVars(palette)

  const setColor = (slot: Slot, hex: string) =>
    setPalette((p) => ({ ...p, colors: { ...p.colors, [slot]: hex } }))

  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">theme-forge</span>
        <input
          className="theme-name"
          value={palette.name}
          onChange={(e) => setPalette((p) => ({ ...p, name: e.target.value }))}
          aria-label="Theme name"
          spellCheck={false}
        />
      </header>

      <aside className="sidebar">
        <section>
          <h2>Start from</h2>
          <PresetPicker current={palette.name} onPick={setPalette} />
          <OpenPalette current={palette} onOpen={setPalette} />
        </section>
        <section>
          <h2>Colors</h2>
          <SwatchEditor colors={palette.colors} onChange={setColor} />
        </section>
      </aside>

      <main className="stage">
        <Preview name={palette.name} />
        <ExportPanel palette={palette} />
      </main>
    </div>
  )
}
