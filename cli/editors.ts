import { realpathSync } from 'node:fs'

type Editor = { name: string; bin: string }

// `code` on PATH is often Cursor's shim, so check the app bundles first and
// dedupe by real path to avoid installing into the same editor twice
const CANDIDATES: Editor[] = [
  { name: 'VS Code', bin: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' },
  { name: 'Cursor', bin: '/Applications/Cursor.app/Contents/Resources/app/bin/cursor' },
  { name: 'VS Code', bin: Bun.which('code') ?? '' },
  { name: 'Cursor', bin: Bun.which('cursor') ?? '' },
]

export function findEditors(): Editor[] {
  const seen = new Set<string>()
  const found: Editor[] = []
  for (const editor of CANDIDATES) {
    if (!editor.bin) continue
    let real: string
    try {
      real = realpathSync(editor.bin)
    } catch {
      continue
    }
    // Cursor's bundle ships both `code` and `cursor`; they resolve to one app
    const app = real.split('/Contents/')[0]
    if (seen.has(app)) continue
    seen.add(app)
    found.push({ name: app.includes('Cursor') ? 'Cursor' : editor.name, bin: editor.bin })
  }
  return found
}

export function installExtension(editor: Editor, vsixPath: string): boolean {
  const proc = Bun.spawnSync([editor.bin, '--install-extension', vsixPath, '--force'], {
    stdout: 'ignore',
    stderr: 'ignore',
  })
  return proc.exitCode === 0
}
