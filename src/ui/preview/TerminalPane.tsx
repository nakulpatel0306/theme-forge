import type { ReactNode } from 'react'

// ANSI index: 0 black 1 red 2 green 3 yellow 4 blue 5 magenta 6 cyan 7 white, +8 for bright
const a = (index: number, text: ReactNode, bold = false) => (
  <span style={{ color: `var(--ansi-${index})`, fontWeight: bold ? 700 : undefined }}>{text}</span>
)

function Prompt({ children }: { children?: ReactNode }) {
  return (
    <>
      <div>
        {a(4, '~/dev/theme-forge', true)} on {a(5, 'main', true)} {a(1, '[!]', true)} via {a(3, 'bun 1.3')}
      </div>
      <div>
        {a(2, '❯', true)} {children}
      </div>
    </>
  )
}

export function TerminalPane() {
  return (
    <div className="pane terminal">
      <Prompt>git diff src/core/color.ts</Prompt>
      <div className="diff-hunk">{a(6, '@@ -3,6 +3,7 @@')} export function mix</div>
      <div className="diff-line del">-  return rgbToHex(x)</div>
      <div className="diff-line add">+  if (t &lt; 0 || t &gt; 1) throw new RangeError()</div>
      <div className="diff-line add">+  return rgbToHex({'{'} r, g, b {'}'})</div>

      <Prompt>bun test</Prompt>
      <div>
        {a(2, '✓', true)} color › mix endpoints {a(8, '[0.08ms]')}
      </div>
      <div>
        {a(1, '✗', true)} palette › ansi brights {a(8, '[0.21ms]')}
      </div>
      <div>
        {' '}
        {a(2, '9 pass', true)} {a(1, '1 fail', true)}
      </div>

      <Prompt>colors</Prompt>
      <div className="ansi-rows" aria-label="The 16 terminal colors">
        {[0, 8].map((offset) => (
          <div key={offset}>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ background: `var(--ansi-${offset + i})` }} />
            ))}
          </div>
        ))}
      </div>

      <Prompt>
        <span className="cursor"> </span>
      </Prompt>
    </div>
  )
}
