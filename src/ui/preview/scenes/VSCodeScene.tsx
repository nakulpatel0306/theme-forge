import type { Palette } from '../../../core/palette'
import { CodeView } from '../CodeView'

type Entry = { depth: number; name: string; folder?: 'open' | 'closed'; git?: 'M' | 'A' | 'U'; selected?: true }

const TREE: Entry[] = [
  { depth: 0, name: 'src', folder: 'open' },
  { depth: 1, name: 'core', folder: 'open' },
  { depth: 2, name: 'color.ts', git: 'M', selected: true },
  { depth: 2, name: 'oklch.ts', git: 'A' },
  { depth: 2, name: 'palette.ts' },
  { depth: 1, name: 'targets', folder: 'closed' },
  { depth: 1, name: 'ui', folder: 'closed' },
  { depth: 0, name: 'notes.md', git: 'U' },
  { depth: 0, name: 'package.json' },
  { depth: 0, name: 'README.md' },
]

// Mirrors the workbench colors the VS Code export writes (src/targets/vscode.ts)
export function VSCodeScene({ palette }: { palette: Palette }) {
  return (
    <div className="window vscode">
      <div className="vs-title">color.ts — theme-forge</div>
      <div className="vs-body">
        <nav className="vs-activity" aria-hidden>
          <i className="is-active" />
          <i />
          <i />
          <i />
        </nav>
        <aside className="vs-sidebar">
          <div className="vs-sidebar-title">EXPLORER</div>
          {TREE.map((e) => (
            <div
              key={e.name}
              className="vs-entry"
              data-git={e.git}
              data-selected={e.selected}
              style={{ paddingLeft: `${0.6 + e.depth * 0.9}rem` }}
            >
              <span className="vs-chevron">{e.folder === 'open' ? '▾' : e.folder === 'closed' ? '▸' : ''}</span>
              <span className="vs-name">{e.name}</span>
              {e.git && <span className="vs-git">{e.git}</span>}
            </div>
          ))}
        </aside>
        <main className="vs-editor">
          <div className="vs-tabs">
            <span className="vs-tab is-active">color.ts</span>
            <span className="vs-tab">palette.ts</span>
          </div>
          <div className="vs-breadcrumb">src › core › color.ts › mix</div>
          <CodeView palette={palette} />
          <div className="vs-panel">
            <div className="vs-panel-tabs">
              <span className="is-active">TERMINAL</span>
              <span>PROBLEMS</span>
            </div>
            <div>
              <span style={{ color: 'var(--ansi-2)' }}>❯</span> bun test
            </div>
            <div>
              <span style={{ color: 'var(--ansi-2)' }}>84 pass</span> <span style={{ color: 'var(--ansi-8)' }}>0 fail</span>
            </div>
          </div>
        </main>
      </div>
      <div className="vs-status">
        <span className="vs-remote">⌁</span>
        <span>main</span>
        <span>⊗ 0 ⚠ 1</span>
        <span className="spacer" />
        <span>Ln 8, Col 5</span>
        <span>UTF-8</span>
        <span>TypeScript</span>
      </div>
    </div>
  )
}
