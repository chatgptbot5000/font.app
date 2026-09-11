import { describe, expect, it } from 'vitest'
import { buildUploadedFontName, isSupportedFontFile } from './fontFiles'

describe('font file helpers', () => {
  it('accepts common browser font files', () => {
    expect(isSupportedFontFile(new File([], 'brand.ttf'))).toBe(true)
    expect(isSupportedFontFile(new File([], 'brand.otf'))).toBe(true)
    expect(isSupportedFontFile(new File([], 'brand.woff'))).toBe(true)
    expect(isSupportedFontFile(new File([], 'brand.woff2'))).toBe(true)
  })

  it('rejects unsupported files', () => {
    expect(isSupportedFontFile(new File([], 'brief.pdf'))).toBe(false)
    expect(isSupportedFontFile(new File([], 'image.png'))).toBe(false)
  })

  it('turns file names into readable uploaded font names', () => {
    expect(buildUploadedFontName('north-star-display.woff2')).toBe('North Star Display')
  })
})
