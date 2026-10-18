import { useState } from 'react'
import { importTheme } from '../core/importTheme'
import { parsePalette, type Palette } from '../core/palette'

type Props = {
  current: Palette
  onOpen: (palette: Palette) => void
}

const nameFrom = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

// palette.json from this app, or any terminal theme we know how to read
function load(text: string, name: string): { palette: Palette; note: string } {
  const trimmed = text.trim()
  if (trimmed.startsWith('{')) {
    try {
      return { palette: parsePalette(JSON.parse(trimmed)), note: 'Opened palette' }
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e
    }
  }
  const { palette, format } = importTheme(text, name)
  return { palette, note: `Imported from ${format}. Orange is estimated, since terminal themes don't have one.` }
}

export function OpenPalette({ current, onOpen }: Props) {
  // Remember which palette was showing when the message appeared, so picking
  // anything else makes it disappear
  const [message, setMessage] = useState<{ text: string; error: boolean; during: Palette } | null>(null)
  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')

  const attempt = (text: string, name: string) => {
    try {
      const { palette, note } = load(text, name)
      onOpen(palette)
      setMessage({ text: note, error: false, during: palette })
      return true
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true, during: current })
      return false
    }
  }

  return (
    <div className="open-palette">
      <div className="open-actions">
        <label className="button small">
          Open a theme file
          <input
            type="file"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) attempt(await file.text(), nameFrom(file.name))
            }}
          />
        </label>
        <button className="button small" aria-expanded={pasting} onClick={() => setPasting(!pasting)}>
          Paste a theme
        </button>
      </div>
      {pasting && (
        <form
          className="paste"
          onSubmit={(e) => {
            e.preventDefault()
            if (attempt(pasted, 'Imported Theme')) {
              setPasting(false)
              setPasted('')
            }
          }}
        >
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste a Ghostty, Kitty, Alacritty, WezTerm, iTerm2 or Xresources theme, or a palette.json"
            spellCheck={false}
            rows={6}
          />
          <button className="button small primary" disabled={!pasted.trim()}>
            Import
          </button>
        </form>
      )}
      {message?.during === current && (
        <p role={message.error ? 'alert' : 'status'} data-error={message.error || undefined}>
          {message.text}
        </p>
      )}
    </div>
  )
}
