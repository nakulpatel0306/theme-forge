import { strToU8, zipSync } from 'fflate'
import { slugify, type Palette } from '../core/palette'
import { paletteJson, renderAll, setupNotes } from '../targets/bundle'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: 'text/plain' }), filename)
}

// Inside the zip, ".config/" is dropped from paths: dot-folders are hidden in
// Finder, which makes an unzipped bundle look empty
export function downloadZip(palette: Palette) {
  const slug = slugify(palette.name)
  const files = renderAll(palette)
  const entries: Record<string, Uint8Array> = {
    [`${slug}/README.txt`]: strToU8(setupNotes(palette, files)),
    [`${slug}/palette.json`]: strToU8(paletteJson(palette)),
  }
  for (const file of files) {
    entries[`${slug}/${file.path.replace(/^\.config\//, '')}`] = strToU8(file.contents)
  }
  const zip = zipSync(entries)
  downloadBlob(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }), `${slug}.zip`)
}
