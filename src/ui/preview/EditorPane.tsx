import type { Palette } from '../../core/palette'
import { CodeView, CURSOR_LINE, FILE } from './CodeView'

export function EditorPane({ palette }: { palette: Palette }) {
  return (
    <div className="pane editor">
      <div className="tabline">
        <span className="tab is-active">color.ts</span>
        <span className="tab">palette.ts</span>
      </div>

      <CodeView palette={palette} relativeNumbers blockCursor />
      <div className="code-line eob">~</div>

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
