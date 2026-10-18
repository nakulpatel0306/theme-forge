import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { importTheme } from '../src/core/importTheme'
import { parsePalette, slugify, type Palette } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { TARGETS, type Target } from '../src/targets'

const THEMES_DIR = join(import.meta.dir, '../themes')

export function communityThemes(): Palette[] {
  return readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => parsePalette(JSON.parse(readFileSync(join(THEMES_DIR, f), 'utf8'))))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const isFile = (path: string) => {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

// Accepts a preset or community theme name in any casing ("kanagawa-dragon",
// "Kanagawa Dragon"), a palette.json from the web app, or any terminal theme
// file theme-forge can import (Ghostty, Kitty, Alacritty, WezTerm, iTerm2...)
export async function resolvePalette(input: string | undefined): Promise<Palette> {
  if (!input) throw new Error('Pass a theme name or a file path. Run `themeforge list` to see themes.')

  if (input.endsWith('.json') || isFile(input)) {
    const file = Bun.file(input)
    if (!(await file.exists())) throw new Error(`No such file: ${input}`)
    const text = await file.text()
    try {
      return input.endsWith('.json') ? parsePalette(JSON.parse(text)) : importTheme(text, nameFromPath(input)).palette
    } catch (e) {
      throw new Error(`${input}: ${(e as Error).message}`)
    }
  }

  const all = [...PRESETS, ...communityThemes()]
  const preset = all.find((p) => slugify(p.name) === slugify(input))
  if (!preset) {
    const names = all.map((p) => slugify(p.name)).join(', ')
    throw new Error(`Unknown theme "${input}". Available: ${names}`)
  }
  return preset
}

function nameFromPath(path: string): string {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function resolveTargets(only: string | undefined): Target[] {
  if (!only) return TARGETS
  const ids = only.split(',').map((s) => s.trim().toLowerCase())
  const unknown = ids.filter((id) => !TARGETS.some((t) => t.id === id))
  if (unknown.length) {
    throw new Error(`Unknown target ${unknown.join(', ')}. Available: ${TARGETS.map((t) => t.id).join(', ')}`)
  }
  return TARGETS.filter((t) => ids.includes(t.id))
}
