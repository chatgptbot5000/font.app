import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { exportFontsAsPng } from './lib/exportImage'

vi.mock('./lib/exportImage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/exportImage')>()
  return {
    ...actual,
    exportFontsAsPng: vi.fn().mockResolvedValue(undefined),
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function installFontUploadStubs() {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:font'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  })
  vi.stubGlobal(
    'FontFace',
    class {
      constructor(
        public family: string,
        public source: string,
      ) {}

      async load() {
        return this
      }
    },
  )

  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      add: vi.fn(),
      ready: Promise.resolve(),
    },
  })
}

describe('Font App', () => {
  it('shows the Font Finder brand with the Niagara Laser logo', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Font Finder' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Niagara Laser logo' })).toBeInTheDocument()
  })

  it('renders requested bundled font samples', () => {
    render(<App />)

    expect(screen.getByText('Lato')).toBeInTheDocument()
    expect(screen.getByText('Goudy Old Style')).toBeInTheDocument()
    expect(screen.getByText('Stardos Stencil')).toBeInTheDocument()
    expect(screen.queryByText('System Sans')).not.toBeInTheDocument()
  })

  it('updates shared sample text in every visible row', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.clear(screen.getByLabelText('Sample text'))
    await user.type(screen.getByLabelText('Sample text'), 'Maple & Stone')

    expect(screen.getAllByText('Maple & Stone').length).toBeGreaterThan(1)
  })

  it('does not render the old display-count slider', () => {
    render(<App />)

    expect(screen.queryByLabelText('Fonts to display')).not.toBeInTheDocument()
  })

  it('selects only fancy fonts with the Fancy preset', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fancy' }))

    expect(screen.getByText('8 visible')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Show Black Jack' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Show Brush Script MT' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Show Lato' })).not.toBeChecked()
    expect(screen.queryByText('Lato')).not.toBeInTheDocument()
    expect(screen.getByText('Black Jack')).toBeInTheDocument()
  })

  it('selects only simple fonts with the Simple preset', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Simple' }))

    expect(screen.getByText('9 visible')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Show Lato' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Show Agency FB' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Show Black Jack' })).not.toBeChecked()
    expect(screen.queryByText('Black Jack')).not.toBeInTheDocument()
    expect(screen.getByText('Lato')).toBeInTheDocument()
  })

  it('selects all and clears all font visibility', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByText('0 visible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export visible/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getByText('19 visible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export visible/i })).toBeEnabled()
  })

  it('enables export when at least one font is visible', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /export visible/i })).toBeEnabled()
    expect(screen.getByText('19 visible')).toBeInTheDocument()
  })

  it('explains why export is disabled without visible fonts', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const checkbox of screen.getAllByRole('checkbox', { name: /^Show / })) {
      await user.click(checkbox)
    }

    expect(screen.getByRole('button', { name: /export visible/i })).toHaveAccessibleDescription(
      'Show at least one font to export.',
    )
  })

  it('shows a clear message for unsupported font uploads', async () => {
    const user = userEvent.setup()
    render(<App />)

    fireEvent.change(screen.getByLabelText('Import fonts'), {
      target: { files: [new File(['brief'], 'brief.pdf', { type: 'application/pdf' })] },
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      'brief.pdf is not a supported font file. Use .ttf, .otf, .woff, or .woff2.',
    )
  })

  it('adds uploaded fonts to the visible lineup', async () => {
    render(<App />)
    installFontUploadStubs()

    fireEvent.change(screen.getByLabelText('Import fonts'), {
      target: { files: [new File(['font-data'], 'north-star-display.woff2', { type: 'font/woff2' })] },
    })

    expect(await screen.findByRole('checkbox', { name: 'Show North Star Display' })).toBeChecked()
    expect(screen.getByText('north-star-display.woff2')).toBeInTheDocument()
  })

  it('uses lineup checkboxes as the only visibility control', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: 'Show Lato' }))

    expect(screen.queryByText('Lato')).not.toBeInTheDocument()
    expect(screen.getByText('Goudy Old Style')).toBeInTheDocument()
  })

  it('renders lineup names in the font they represent', () => {
    render(<App />)

    expect(screen.getByText('Show Great Vibes')).toHaveStyle({
      fontFamily: 'Great Vibes',
    })
  })

  it('does not render per-row export selection checkboxes', () => {
    render(<App />)

    expect(screen.queryByRole('checkbox', { name: /^Select / })).not.toBeInTheDocument()
  })

  it('exports every visible font', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: 'Show Lato' }))
    await user.click(screen.getByRole('button', { name: /export visible/i }))

    expect(exportFontsAsPng).toHaveBeenCalledTimes(1)
    const [exportedFonts, sampleText, logoUrl] = vi.mocked(exportFontsAsPng).mock.calls[0]

    expect(exportedFonts.map((font) => font.name)).toContain('Goudy Old Style')
    expect(exportedFonts.map((font) => font.name)).not.toContain('Lato')
    expect(sampleText).toBe('Maple & Stone Studio')
    expect(logoUrl).toContain('.png')
  })
})
