import type { FontOption } from '../types'

const supportedFontExtensions = ['.ttf', '.otf', '.woff', '.woff2']

export function isSupportedFontFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return supportedFontExtensions.some((extension) => lowerName.endsWith(extension))
}

export function buildUploadedFontName(fileName: string) {
  const withoutExtension = fileName.replace(/\.(ttf|otf|woff2?)$/i, '')
  return withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export async function loadUploadedFont(file: File): Promise<FontOption> {
  if (!isSupportedFontFile(file)) {
    throw new Error(`${file.name} is not a supported font file. Use .ttf, .otf, .woff, or .woff2.`)
  }

  const objectUrl = URL.createObjectURL(file)
  const fontName = buildUploadedFontName(file.name)
  const family = `UploadedFont-${crypto.randomUUID()}`

  try {
    const fontFace = new FontFace(family, `url(${objectUrl})`)
    await fontFace.load()
    document.fonts.add(fontFace)

    return {
      id: `upload-${family}`,
      name: fontName,
      family,
      source: 'upload',
      fileName: file.name,
      objectUrl,
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}
