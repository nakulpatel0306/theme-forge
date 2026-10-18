import { useState } from 'react'
import type { Palette } from '../../core/palette'
import { LazygitScene } from './scenes/LazygitScene'
import { TmuxScene } from './scenes/TmuxScene'
import { VSCodeScene } from './scenes/VSCodeScene'
import './Preview.css'
import './scenes/Scenes.css'

const SCENES = [
  { id: 'tmux', label: 'Terminal' },
  { id: 'vscode', label: 'VS Code' },
  { id: 'lazygit', label: 'lazygit' },
] as const
type SceneId = (typeof SCENES)[number]['id']

// Machado, Oliveira & Fernandes (2009) simulation matrices at full severity,
// applied in linear RGB (the SVG filter default)
const VISION = {
  none: { label: 'Typical color vision' },
  protanopia: {
    label: 'Red-blind (protanopia)',
    matrix: '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
  },
  deuteranopia: {
    label: 'Green-blind (deuteranopia)',
    matrix: '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
  },
  tritanopia: {
    label: 'Blue-blind (tritanopia)',
    matrix: '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.148296 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
  },
  grayscale: { label: 'No color', matrix: '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0' },
} as const
type Vision = keyof typeof VISION

export function Preview({ palette }: { palette: Palette }) {
  const [scene, setScene] = useState<SceneId>('tmux')
  const [vision, setVision] = useState<Vision>('none')

  return (
    <div className="preview">
      <div className="preview-bar">
        <div className="scene-tabs" role="tablist" aria-label="Preview">
          {SCENES.map((s) => (
            <button key={s.id} role="tab" aria-selected={scene === s.id} onClick={() => setScene(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <select
          className="vision"
          value={vision}
          onChange={(e) => setVision(e.target.value as Vision)}
          aria-label="Simulate color vision"
        >
          {Object.entries(VISION).map(([id, v]) => (
            <option key={id} value={id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        {Object.entries(VISION).map(([id, v]) =>
          'matrix' in v ? (
            <filter key={id} id={`vision-${id}`}>
              <feColorMatrix type="matrix" values={v.matrix} />
            </filter>
          ) : null,
        )}
      </svg>

      <figure
        className="scene"
        aria-label={`Preview of ${palette.name}`}
        style={{ filter: vision === 'none' ? undefined : `url(#vision-${vision})` }}
      >
        {scene === 'tmux' && <TmuxScene palette={palette} />}
        {scene === 'vscode' && <VSCodeScene palette={palette} />}
        {scene === 'lazygit' && <LazygitScene />}
      </figure>
    </div>
  )
}
