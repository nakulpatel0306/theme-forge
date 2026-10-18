import { expect, test } from 'bun:test'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { contrast } from '../src/core/color'
import { parsePalette, slugify } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'

// The gate for community pull requests: every file in themes/ must load,
// be readable, be named after itself, and not clash with another theme
const dir = join(import.meta.dir, '../themes')
const files = (await readdir(dir)).filter((f) => f.endsWith('.json'))

test.each(files)('%s', async (file) => {
  const raw = await Bun.file(join(dir, file)).json()
  const palette = parsePalette(raw)
  expect(file).toBe(`${slugify(palette.name)}.json`)
  expect(typeof raw.author).toBe('string')
  expect(contrast(palette.colors.fg, palette.colors.bg)).toBeGreaterThanOrEqual(4.5)
  expect(PRESETS.map((p) => slugify(p.name))).not.toContain(slugify(palette.name))
})
