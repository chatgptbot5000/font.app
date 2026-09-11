import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FontOption } from '../types'
import { exportFontsAsPng, getSelectedFontsForExport, validateExportRequest, wrapCanvasText } from './exportImage'

const fonts: FontOption[] = [
  { id: 'one', name: 'One', family: 'Arial', source: 'preset' },
  { id: 'two', name: 'Two', family: 'Georgia', source: 'preset' },
]

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('export helpers', () => {
  it('rejects empty selections', () => {
    expect(() => validateExportRequest([], 'Sample')).toThrow('Show at least one font')
  })

  it('rejects empty sample text', () => {
    expect(() => validateExportRequest(fonts, '   ')).toThrow('Enter sample text')
  })

  it('keeps selected fonts in library order', () => {
    expect(getSelectedFontsForExport(fonts, new Set(['two', 'one'])).map((font) => font.id)).toEqual([
      'one',
      'two',
    ])
  })

  it('wraps long sample text for canvas export', () => {
    const context = {
      measureText: (value: string) => ({ width: value.length * 10 }),
    } as CanvasRenderingContext2D

    expect(wrapCanvasText(context, 'Maple Stone Studio Extended Wordmark', 150)).toEqual([
      'Maple Stone',
      'Studio Extended',
      'Wordmark',
    ])
  })

  it('draws the logo in the export header when a logo URL is provided', async () => {
    const drawImage = vi.fn()
    const context = {
      measureText: (value: string) => ({ width: value.length * 10 }),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      drawImage,
      set fillStyle(_value: string) {},
      set font(_value: string) {},
    } as unknown as CanvasRenderingContext2D
    const originalCreateElement = document.createElement.bind(document)

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => context,
          toDataURL: () => 'data:image/png;base64,logo',
        } as unknown as HTMLCanvasElement
      }

      if (tagName === 'a') {
        return { click: vi.fn() } as unknown as HTMLAnchorElement
      }

      return originalCreateElement(tagName)
    })
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        set src(_value: string) {
          this.onload?.()
        }
      },
    )
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    })

    await exportFontsAsPng(fonts, 'Sample', '/logo.png')

    expect(drawImage).toHaveBeenCalled()
  })
})
