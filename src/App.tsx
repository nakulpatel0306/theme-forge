import { useState } from 'react'
import type { Slot } from './core/palette'
import { ExportPanel } from './ui/ExportPanel'
import { GeneratePanel } from './ui/GeneratePanel'
import { HelpDialog } from './ui/HelpDialog'
import { LiveBadge } from './ui/LiveBadge'
import { OpenPalette } from './ui/OpenPalette'
import { PresetPicker } from './ui/PresetPicker'
import { Preview } from './ui/preview/Preview'
import { SwatchEditor } from './ui/SwatchEditor'
import { SyntaxEditor } from './ui/SyntaxEditor'
import { usePalette } from './ui/usePalette'
import { usePaletteVars } from './ui/usePaletteVars'
import { useLiveSync } from './ui/useLiveSync'
import './App.css'

export default function App() {
  const { palette, setPalette, undo, redo, canUndo, canRedo } = usePalette()
  usePaletteVars(palette)
  const live = useLiveSync(palette)

  const [locked, setLocked] = useState<ReadonlySet<Slot>>(new Set())

  const setColor = (slot: Slot, hex: string) =>
    setPalette((p) => ({ ...p, colors: { ...p.colors, [slot]: hex } }), `color:${slot}`)
  const toggleLock = (slot: Slot) =>
    setLocked((current) => {
      const next = new Set(current)
      if (!next.delete(slot)) next.add(slot)
      return next
    })

  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">theme-forge</span>
        <input
          className="theme-name"
          value={palette.name}
          onChange={(e) => setPalette((p) => ({ ...p, name: e.target.value }), 'name')}
          aria-label="Theme name"
          spellCheck={false}
        />
        <LiveBadge live={live} />
        <div className="history">
          <HelpDialog />
          <button className="button small" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            Undo
          </button>
          <button className="button small" onClick={redo} disabled={!canRedo} title="Redo (⇧⌘Z)">
            Redo
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <section>
          <h2>Start from</h2>
          <PresetPicker current={palette.name} onPick={setPalette} />
          <OpenPalette current={palette} onOpen={setPalette} />
        </section>
        <section>
          <h2>Generate</h2>
          <GeneratePanel palette={palette} locked={locked} onGenerate={setPalette} />
        </section>
        <section>
          <h2>Colors</h2>
          <SwatchEditor colors={palette.colors} locked={locked} onChange={setColor} onToggleLock={toggleLock} />
        </section>
        <section>
          <h2>Syntax</h2>
          <SyntaxEditor palette={palette} onChange={(style) => setPalette((p) => ({ ...p, style }))} />
        </section>
      </aside>

      <main className="stage">
        <Preview palette={palette} />
        <ExportPanel palette={palette} />
      </main>
    </div>
  )
}
