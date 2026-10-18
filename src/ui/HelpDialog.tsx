import { useRef } from 'react'
import './HelpDialog.css'

const REPO = 'https://github.com/nakulpatel0306/theme-forge'

// A native <dialog>: Esc, focus trapping and the backdrop come for free
export function HelpDialog() {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button className="button small" onClick={() => dialog.current?.showModal()}>
        How to use
      </button>
      <dialog
        ref={dialog}
        className="help"
        aria-labelledby="help-title"
        // A click on the backdrop lands on the dialog element itself
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <div className="help-body">
          <header>
            <h2 id="help-title">How to use theme-forge</h2>
            <button className="button small" onClick={() => dialog.current?.close()} autoFocus>
              Close
            </button>
          </header>

          <p className="help-lede">
            You choose twelve colors. theme-forge turns them into a matching theme for every tool you use: your
            terminal, your editor and your command-line tools.
          </p>

          <ol className="help-steps">
            <li>
              <h3>Pick a starting point</h3>
              <p>
                Click any theme under <b>Start from</b>. Already have a terminal theme you like? <b>Open a theme file</b>{' '}
                or <b>Paste a theme</b> from Ghostty, Kitty, Alacritty, WezTerm, iTerm2 or Xresources.
              </p>
              <p>
                Or generate one: <b>Build from this color</b> makes a palette around any color, dropping in a
                wallpaper makes one that matches it, and <b>Shuffle</b> (or the space bar) rolls a new one.
              </p>
            </li>
            <li>
              <h3>Make it yours</h3>
              <p>
                Click a color square to change it, or type a hex value. Hover a row and click the lock to keep that color
                when you shuffle or generate.
              </p>
              <p>
                The number next to each color is how readable it is on the background. If it turns into a{' '}
                <b>Fix</b> button, the color is too faint; one click adjusts it just enough.
              </p>
              <p>
                <b>Syntax</b> sets which color keywords, strings, functions and the rest get, and whether comments and
                keywords are italic. Click the big title to rename your theme. <b>Undo</b> and <b>Redo</b> (⌘Z, ⇧⌘Z)
                cover everything.
              </p>
            </li>
            <li>
              <h3>Check it</h3>
              <p>
                The preview switches between a terminal, VS Code and lazygit. The color vision menu shows how the theme
                looks to people with color blindness, which is a good check for red and green diffs.
              </p>
            </li>
            <li>
              <h3>Install it</h3>
              <p>
                Scroll to <b>Use it</b> and pick your tool. You'll see the file, where it goes, and the one line to add
                to that tool's config. <b>Download</b> grabs one file; <b>Download all</b> grabs every tool as a zip,
                with instructions inside. For VS Code and Cursor you get an extension (.vsix) to install.
              </p>
              <p>
                Your theme lives in the page's address, so <b>Copy share link</b> sends it to anyone. It's also saved in
                this browser, so it's here next time.
              </p>
            </li>
          </ol>

          <section className="help-cli">
            <h3>Prefer the terminal?</h3>
            <p>
              Clone the <a href={REPO}>repo</a> and the command-line tool installs themes for you, and can recolor your
              running Neovim and tmux live while you edit here.
            </p>
            <pre>
              {`bun install
bun cli/index.ts apply my-theme.json        # see what would be installed
bun cli/index.ts apply my-theme.json --yes  # install it
bun cli/index.ts live                       # edit with live preview in your tools`}
            </pre>
            <p>
              The <a href={`${REPO}/blob/main/docs/GUIDE.md`}>full guide</a> covers every command and tool.
            </p>
          </section>
        </div>
      </dialog>
    </>
  )
}
