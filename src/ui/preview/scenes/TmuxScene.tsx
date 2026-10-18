import type { Palette } from '../../../core/palette'
import { EditorPane } from '../EditorPane'
import { TerminalPane } from '../TerminalPane'

// Neovim on top, a shell underneath, tmux's bar at the bottom
export function TmuxScene({ palette }: { palette: Palette }) {
  return (
    <div className="window tmux-scene">
      <div className="titlebar">
        <span className="lights" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="title">nvim src/core/color.ts</span>
      </div>
      <div className="panes">
        <EditorPane palette={palette} />
        <TerminalPane />
      </div>
      <div className="tmux-bar">
        <span className="session">forge</span>
        <span className="win is-active">1:nvim*</span>
        <span className="win">2:zsh</span>
        <span className="spacer" />
        <span className="host">16:02</span>
      </div>
    </div>
  )
}
