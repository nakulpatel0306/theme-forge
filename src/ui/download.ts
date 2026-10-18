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

export function downloadFile(data: string | Uint8Array, filename: string) {
  if (typeof data === 'string') return downloadText(data, filename)
  downloadBlob(new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' }), filename)
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
    const data = typeof file.data === 'string' ? strToU8(file.data) : file.data
    entries[`${slug}/${file.path.replace(/^\.config\//, '')}`] = data
  }
  const zip = zipSync(entries)
  downloadBlob(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }), `${slug}.zip`)
}
