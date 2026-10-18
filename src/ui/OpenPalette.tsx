import { useState } from 'react'
import { parsePalette, type Palette } from '../core/palette'

type Props = {
  current: Palette
  onOpen: (palette: Palette) => void
}

export function OpenPalette({ current, onOpen }: Props) {
  // Remember which palette was showing when the error happened, so picking
  // anything else makes the stale message disappear
  const [error, setError] = useState<{ message: string; during: Palette } | null>(null)

  const open = async (file: File | undefined) => {
    if (!file) return
    try {
      onOpen(parsePalette(JSON.parse(await file.text())))
      setError(null)
    } catch (e) {
      const message = e instanceof SyntaxError ? `${file.name} isn't valid JSON` : (e as Error).message
      setError({ message, during: current })
    }
  }

  return (
    <div className="open-palette">
      <label className="button small">
        Open palette.json
        <input
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            open(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      {error?.during === current && <p role="alert">{error.message}</p>}
    </div>
  )
}
