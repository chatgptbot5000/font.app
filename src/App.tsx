import { useEffect, useRef, useState } from 'react'
import companyLogoUrl from '../ChatGPT Image Nov 25, 2025, 03_58_04 PMnobackgroud-round.png'
import { presetFonts } from './data/presetFonts'
import { exportFontsAsPng } from './lib/exportImage'
import { loadUploadedFont } from './lib/fontFiles'
import type { FontOption } from './types'

const defaultSampleText = 'Sample Text'
const fancyFontNames = new Set([
  'Black Jack',
  'Alex Brush',
  'Monotype Corsiva',
  'Script MT Bold',
  'Great Vibes',
  'Dancing Script',
  'Italianno',
  'Brush Script MT',
])
const simpleFontNames = new Set([
  'Lato',
  'Goudy Old Style',
  'Perpetua',
  'Book Antiqua',
  'Imprint MT Shadow',
  'Sackers Heavy Gothic',
  'Copperplate Gothic Bold',
  'Elephant',
  'Agency FB',
])

export default function App() {
  const [sampleText, setSampleText] = useState(defaultSampleText)
  const [fonts, setFonts] = useState<FontOption[]>(presetFonts)
  const [visibleFontIds, setVisibleFontIds] = useState<Set<string>>(() => new Set(presetFonts.map((font) => font.id)))
  const [statusMessage, setStatusMessage] = useState('')
  const uploadedFontsRef = useRef<FontOption[]>([])

  const visibleFonts = fonts.filter((font) => visibleFontIds.has(font.id))

  useEffect(() => {
    uploadedFontsRef.current = fonts.filter((font) => font.source === 'upload')
  }, [fonts])

  useEffect(() => {
    return () => {
      uploadedFontsRef.current.forEach((font) => {
        if (font.objectUrl) URL.revokeObjectURL(font.objectUrl)
      })
    }
  }, [])

  const toggleFontVisibility = (fontId: string) => {
    setVisibleFontIds((current) => {
      const next = new Set(current)
      if (next.has(fontId)) {
        next.delete(fontId)
      } else {
        next.add(fontId)
      }
      return next
    })
  }

  const showFontGroup = (fontNames: Set<string>) => {
    setVisibleFontIds(new Set(fonts.filter((font) => fontNames.has(font.name)).map((font) => font.id)))
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const results = await Promise.allSettled(Array.from(files).map(loadUploadedFont))
    const loadedFonts = results
      .filter((result): result is PromiseFulfilledResult<FontOption> => result.status === 'fulfilled')
      .map((result) => result.value)
    const failedMessages = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => (result.reason instanceof Error ? result.reason.message : 'Unable to import one font file.'))

    if (loadedFonts.length > 0) {
      setFonts((current) => [...current, ...loadedFonts])
      setVisibleFontIds((current) => new Set([...Array.from(current), ...loadedFonts.map((font) => font.id)]))
    }

    setStatusMessage(
      [loadedFonts.length ? `${loadedFonts.length} font${loadedFonts.length === 1 ? '' : 's'} imported.` : '', ...failedMessages]
        .filter(Boolean)
        .join(' '),
    )
  }

  const handleExport = async () => {
    try {
      await exportFontsAsPng(visibleFonts, sampleText, companyLogoUrl)
      setStatusMessage('PNG exported with visible font rows.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to export the visible fonts.')
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <div className="hero-brand">
          <img className="brand-logo" src={companyLogoUrl} alt="Niagara Laser logo" />
          <div>
            <h1 id="app-title">Font Finder</h1>
            <p className="hero-copy">
              Compare one phrase across preset and uploaded fonts, then export only the options your client should see.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={visibleFonts.length === 0}
          aria-describedby="export-help"
        >
          Export visible
        </button>
      </section>

      <div className="workspace-grid">
        <aside className="control-panel" aria-label="Font controls">
          <label>
            Sample text
            <input value={sampleText} onChange={(event) => setSampleText(event.target.value)} />
          </label>

          <label>
            Import fonts
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              multiple
              onChange={(event) => {
                const input = event.currentTarget
                void handleUpload(input.files).finally(() => {
                  input.value = ''
                })
              }}
            />
          </label>

          <section className="preset-panel" aria-labelledby="presets-heading">
            <h2 id="presets-heading">Presets</h2>
            <div className="preset-actions">
              <button type="button" onClick={() => showFontGroup(fancyFontNames)}>
                Fancy
              </button>
              <button type="button" onClick={() => showFontGroup(simpleFontNames)}>
                Simple
              </button>
              <button type="button" onClick={() => setVisibleFontIds(new Set(fonts.map((font) => font.id)))}>
                Select all
              </button>
              <button type="button" onClick={() => setVisibleFontIds(new Set())}>
                Clear
              </button>
            </div>
          </section>

          <section className="lineup-panel" aria-labelledby="lineup-heading">
            <h2 id="lineup-heading">Font lineup</h2>
            <div className="lineup-list">
              {fonts.map((font) => (
                <label className="lineup-toggle" key={font.id}>
                  <input
                    type="checkbox"
                    checked={visibleFontIds.has(font.id)}
                    onChange={() => toggleFontVisibility(font.id)}
                  />
                  <span style={{ fontFamily: font.family }}>Show {font.name}</span>
                </label>
              ))}
            </div>
          </section>

          <p className="selection-count">{visibleFonts.length} visible</p>
          <p className="export-help" id="export-help">
            {visibleFonts.length === 0 ? 'Show at least one font to export.' : 'Exports visible rows only.'}
          </p>
          {statusMessage ? (
            <p className="status-message" role="status">
              {statusMessage}
            </p>
          ) : null}
        </aside>

        <section className="font-list" aria-label="Font previews">
          {visibleFonts.map((font) => (
            <article className="font-card" key={font.id}>
              <div>
                <p className="font-name">{font.name}</p>
                <p className="font-source">{font.source === 'upload' ? font.fileName : 'Preset'}</p>
              </div>
              <p className="font-sample" style={{ fontFamily: font.family }}>
                {sampleText}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
