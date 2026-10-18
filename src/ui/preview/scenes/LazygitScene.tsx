import type { ReactNode } from 'react'

function Box({ title, active, children }: { title: string; active?: boolean; children: ReactNode }) {
  return (
    <section className="lg-box" data-active={active || undefined}>
      <h4>{title}</h4>
      {children}
    </section>
  )
}

const a = (index: number, text: string) => <span style={{ color: `var(--ansi-${index})` }}>{text}</span>

// Mirrors the colors the lazygit export sets (src/targets/lazygit.ts)
export function LazygitScene() {
  return (
    <div className="window lazygit">
      <div className="lg-grid">
        <div className="lg-side">
          <Box title="[1] Status">
            <div>
              {a(2, '✓')} theme-forge → {a(5, 'main')}
            </div>
          </Box>
          <Box title="[2] Files" active>
            <div className="lg-row is-selected">
              {a(1, ' M')} src/core/color.ts
            </div>
            <div className="lg-row">{a(2, 'A ')} src/core/oklch.ts</div>
            <div className="lg-row">{a(1, '??')} notes.md</div>
          </Box>
          <Box title="[3] Local branches">
            <div className="lg-row">{a(2, '* main')}</div>
            <div className="lg-row">
              {'  '}feat/live-sync {a(3, '↑2')}
            </div>
          </Box>
          <Box title="[4] Commits">
            {[
              ['e41c9a2', 'Add live sync to Neovim and tmux'],
              ['9b03f7d', 'Add palette generators'],
              ['51aa0c4', 'Add VS Code and Cursor export'],
              ['c27e8b1', 'Add CLI for installing themes'],
            ].map(([sha, msg]) => (
              <div key={sha} className="lg-row">
                {a(3, sha)} {a(6, 'NP')} {msg}
              </div>
            ))}
          </Box>
        </div>
        <Box title="Unstaged changes">
          <div>{a(4, 'src/core/color.ts')}</div>
          <div>{a(6, '@@ -3,6 +3,7 @@')} export function mix</div>
          <div className="diff-line del">-  return rgbToHex(x)</div>
          <div className="diff-line add">+  if (t &lt; 0 || t &gt; 1) throw new RangeError()</div>
          <div className="diff-line add">+  return rgbToHex({'{'} r, g, b {'}'})</div>
          <div> {'}'}</div>
        </Box>
      </div>
      <div className="lg-options">
        Commit: c | Stash: s | Push: P | Pull: p | Keybindings: ?
      </div>
    </div>
  )
}
