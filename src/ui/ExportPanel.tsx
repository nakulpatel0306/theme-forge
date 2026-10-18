import { useMemo, useState } from 'react'
import type { Palette } from '../core/palette'
import { encodeShare } from '../core/share'
import { paletteJson, renderAll } from '../targets/bundle'
import { downloadText, downloadZip } from './download'
import './ExportPanel.css'

const KIND_LABEL = { terminal: 'Terminals', editor: 'Editors', tool: 'CLI tools' } as const

export function ExportPanel({ palette }: { palette: Palette }) {
  const files = useMemo(() => renderAll(palette), [palette])
  const [selectedId, setSelectedId] = useState(files[0].target.id)
  const [copied, setCopied] = useState<string | null>(null)
  const file = files.find((f) => f.target.id === selectedId) ?? files[0]

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(what)
    setTimeout(() => setCopied((current) => (current === what ? null : current)), 1500)
  }

  const shareLink = () => `${location.origin}${location.pathname}#${encodeShare(palette)}`
  const filename = file.path.split('/').pop()!

  return (
    <section className="export" aria-labelledby="export-title">
      <header className="export-head">
        <h2 id="export-title">Use it</h2>
        <div className="export-actions">
          <button className="button primary" onClick={() => downloadZip(palette)}>
            Download all {files.length} files
          </button>
          <button className="button" onClick={() => downloadText(paletteJson(palette), 'palette.json')}>
            Download palette.json
          </button>
          <button className="button" onClick={() => copy(shareLink(), 'link')}>
            {copied === 'link' ? 'Link copied' : 'Copy share link'}
          </button>
        </div>
      </header>

      <div className="export-body">
        <nav className="target-list" aria-label="Tools">
          {(['terminal', 'editor', 'tool'] as const).map((kind) => (
            <div key={kind} className="target-group">
              <h3>{KIND_LABEL[kind]}</h3>
              {files
                .filter((f) => f.target.kind === kind)
                .map((f) => (
                  <button
                    key={f.target.id}
                    className="target"
                    aria-current={f.target.id === file.target.id || undefined}
                    onClick={() => setSelectedId(f.target.id)}
                  >
                    {f.target.name}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="target-file">
          <div className="file-bar">
            <code className="file-path">~/{file.path}</code>
            <button className="button small" onClick={() => copy(file.contents, file.target.id)}>
              {copied === file.target.id ? 'Copied' : 'Copy'}
            </button>
            <button className="button small" onClick={() => downloadText(file.contents, filename)}>
              Download
            </button>
          </div>
          <p className="file-setup">{file.setup}</p>
          <pre className="file-contents">{file.contents}</pre>
        </div>
      </div>
    </section>
  )
}
