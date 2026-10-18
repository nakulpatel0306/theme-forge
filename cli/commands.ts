import { mkdir, rename } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { hexToRgb } from '../src/core/color'
import { SLOT_INFO, SLOTS, slugify, type Palette } from '../src/core/palette'
import { PRESETS } from '../src/core/presets'
import { paletteJson, renderAll, setupNotes } from '../src/targets/bundle'
import { TARGETS, type Target } from '../src/targets'
import { communityThemes } from './resolve'
import { findEditors, installExtension } from './editors'

const swatch = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  return `\x1b[48;2;${r};${g};${b}m    \x1b[0m`
}
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`

export function list() {
  const row = (p: Palette) =>
    console.log(`  ${SLOTS.slice(5).map((s) => swatch(p.colors[s]).replace('    ', '  ')).join('')}  ${slugify(p.name)}`)
  console.log(bold('Presets'))
  PRESETS.forEach(row)
  console.log(`\n${bold('Community')}`)
  communityThemes().forEach(row)
  console.log(`\n${bold('Targets')}`)
  for (const t of TARGETS) console.log(`  ${t.id.padEnd(10)} ${dim(`~/${t.path('<theme>')}`)}`)
}

export function preview(palette: Palette) {
  console.log(bold(palette.name))
  for (const slot of SLOTS) {
    console.log(`  ${swatch(palette.colors[slot])}  ${palette.colors[slot]}  ${SLOT_INFO[slot].label}`)
  }
}

// Writes a self-contained folder, mirroring the zip from the web app
export async function exportTo(palette: Palette, targets: Target[], outDir: string | undefined) {
  const dir = outDir ?? slugify(palette.name)
  const files = renderAll(palette, targets)
  await Bun.write(join(dir, 'README.txt'), setupNotes(palette, files))
  await Bun.write(join(dir, 'palette.json'), paletteJson(palette))
  for (const file of files) {
    await Bun.write(join(dir, file.path.replace(/^\.config\//, '')), file.data)
  }
  console.log(`Wrote ${files.length} themes to ${dir}/`)
}

// installEditors is off when --home points somewhere else: editors keep their
// extensions in one global place, so a test install must not touch them
type ApplyOptions = { home: string; yes: boolean; installEditors: boolean }

// Only ever writes the standalone theme files, never a tool's main config.
// Without --yes it prints what it would do and touches nothing.
export async function apply(palette: Palette, targets: Target[], { home, yes, installEditors }: ApplyOptions) {
  const files = renderAll(palette, targets)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  let changed = 0

  for (const file of files) {
    const dest = join(home, file.path)
    const existing = Bun.file(dest)
    const exists = await existing.exists()
    if (exists && sameBytes(new Uint8Array(await existing.arrayBuffer()), file.data)) {
      console.log(`  ${dim('same')}    ~/${file.path}`)
      continue
    }

    changed++
    const backup = `${dest}.bak-${stamp}`
    console.log(`  ${exists ? 'update' : 'create'}  ~/${file.path}${exists ? dim(`  (backup: ${backup.slice(home.length + 1)})`) : ''}`)
    if (!yes) continue

    await mkdir(dirname(dest), { recursive: true })
    if (exists) await rename(dest, backup)
    await Bun.write(dest, file.data)
  }

  if (!yes) {
    console.log(changed ? `\nDry run. Re-run with --yes to write ${changed} file(s).` : '\nNothing to do.')
    return
  }

  const vsix = files.find((f) => f.target.binary && f.path.endsWith('.vsix'))
  if (vsix && installEditors) {
    for (const editor of findEditors()) {
      const ok = installExtension(editor, join(home, vsix.path))
      console.log(`  ${ok ? 'installed' : 'failed  '}  extension in ${editor.name}`)
    }
  }

  console.log(`\nWrote ${changed} file(s). To switch each tool over:\n`)
  for (const file of files) console.log(`  ${bold(file.target.name.padEnd(16))} ${file.setup}`)
}

function sameBytes(a: Uint8Array, b: string | Uint8Array): boolean {
  const other = typeof b === 'string' ? new TextEncoder().encode(b) : b
  return a.length === other.length && a.every((byte, i) => byte === other[i])
}
