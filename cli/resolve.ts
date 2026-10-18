import { parsePalette, slugify, type Palette } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { TARGETS, type Target } from '../src/targets'

// Accepts a preset name in any casing ("kanagawa-dragon", "Kanagawa Dragon")
// or a path to a palette.json exported from the web app
export async function resolvePalette(input: string | undefined): Promise<Palette> {
  if (!input) throw new Error('Pass a preset name or a palette.json path. Run `themeforge list` to see presets.')

  if (input.endsWith('.json')) {
    const file = Bun.file(input)
    if (!(await file.exists())) throw new Error(`No such file: ${input}`)
    try {
      return parsePalette(await file.json())
    } catch (e) {
      throw new Error(`${input}: ${(e as Error).message}`)
    }
  }

  const preset = PRESETS.find((p) => slugify(p.name) === slugify(input))
  if (!preset) {
    const names = PRESETS.map((p) => slugify(p.name)).join(', ')
    throw new Error(`Unknown preset "${input}". Available: ${names}`)
  }
  return preset
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
