import { useEffect, useState, type DragEvent } from 'react'
import { isLight } from '../core/color'
import { fromImage, fromSeed, randomName, shuffle, type Mode } from '../core/generate'
import type { Palette, Slot } from '../core/palette'
import './GeneratePanel.css'

type Props = {
  palette: Palette
  locked: ReadonlySet<Slot>
  onGenerate: (palette: Palette) => void
}

// Downscaled so k-means stays fast on huge photos; 96px keeps the color story
async function samplePixels(file: File): Promise<[number, number, number][]> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 96 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: [number, number, number][] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) pixels.push([data[i], data[i + 1], data[i + 2]])
  }
  return pixels
}

const titleCase = (s: string) =>
  s
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || 'From Image'

export function GeneratePanel({ palette, locked, onGenerate }: Props) {
  const [mode, setMode] = useState<Mode>(isLight(palette.colors.bg) ? 'light' : 'dark')
  const [seed, setSeed] = useState(palette.colors.blue)
  const [image, setImage] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const doShuffle = () => onGenerate({ name: randomName(), colors: shuffle(mode, palette.colors, locked) })

  // Space shuffles, like Coolors, but only when nothing else wants the key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || document.activeElement !== document.body) return
      e.preventDefault()
      doShuffle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const loadImage = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(`${file.name} isn't an image`)
      return
    }
    try {
      const pixels = await samplePixels(file)
      if (image) URL.revokeObjectURL(image.url)
      setImage({ url: URL.createObjectURL(file), name: file.name })
      setError(null)
      onGenerate({ name: titleCase(file.name), colors: fromImage(pixels, mode, palette.colors, locked) })
    } catch {
      setError(`Couldn't read ${file.name}`)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    loadImage(e.dataTransfer.files[0])
  }

  return (
    <div className="generate">
      <div className="mode" role="radiogroup" aria-label="Generate a dark or light theme">
        {(['dark', 'light'] as const).map((m) => (
          <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
            {m === 'dark' ? 'Dark' : 'Light'}
          </button>
        ))}
      </div>

      <div className="generate-row">
        <label className="seed-chip" style={{ background: seed }}>
          <input type="color" value={seed} onChange={(e) => setSeed(e.target.value)} aria-label="Starting color" />
        </label>
        <button
          className="button"
          onClick={() => onGenerate({ name: randomName(), colors: fromSeed(seed, mode, palette.colors, locked) })}
        >
          Build from this color
        </button>
      </div>

      <label
        className="drop"
        data-dragging={dragging || undefined}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {image && <img src={image.url} alt="" />}
        <span>{image ? `Using ${image.name}. Drop another to switch.` : 'Drop a wallpaper or screenshot, or click to pick one'}</span>
        <input type="file" accept="image/*" hidden onChange={(e) => loadImage(e.target.files?.[0])} />
      </label>
      {error && <p className="generate-error" role="alert">{error}</p>}

      <div className="generate-row">
        <button className="button primary" onClick={doShuffle}>
          Shuffle
        </button>
        <span className="generate-hint">
          {locked.size ? `${locked.size} locked color${locked.size > 1 ? 's' : ''} stay put` : 'Press space to shuffle'}
        </span>
      </div>
    </div>
  )
}
