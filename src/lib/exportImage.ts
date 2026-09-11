import type { FontOption } from '../types'

export function getSelectedFontsForExport(fonts: FontOption[], selectedFontIds: Set<string>) {
  return fonts.filter((font) => selectedFontIds.has(font.id))
}

export function validateExportRequest(fonts: FontOption[], sampleText: string) {
  if (fonts.length === 0) {
    throw new Error('Show at least one font to export.')
  }

  if (sampleText.trim().length === 0) {
    throw new Error('Enter sample text before exporting.')
  }
}

export function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (context.measureText(testLine).width <= maxWidth || !currentLine) {
      currentLine = testLine
      return
    }

    lines.push(currentLine)
    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load the export logo.'))
    image.src = source
  })
}

export async function exportFontsAsPng(fonts: FontOption[], sampleText: string, logoUrl?: string) {
  validateExportRequest(fonts, sampleText)
  await document.fonts.ready
  const logo = logoUrl ? await loadImage(logoUrl) : null

  const width = 1400
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = 1

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Image export is not supported in this browser.')
  }

  const rows = fonts.map((font) => {
    context.font = `52px ${font.family}`
    const lines = wrapCanvasText(context, sampleText, width - 152)
    return {
      font,
      lines,
      height: 78 + lines.length * 58,
    }
  })

  const height = 180 + rows.reduce((total, row) => total + row.height, 0)
  canvas.height = height

  context.fillStyle = '#fbf7ef'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#092231'
  context.fillRect(48, 34, width - 96, 110)
  context.fillStyle = '#5ff28b'
  context.fillRect(48, 138, width - 96, 6)
  if (logo) {
    context.drawImage(logo, 72, 48, 78, 78)
  }
  context.fillStyle = '#ffffff'
  context.font = '700 40px ui-sans-serif, system-ui, sans-serif'
  context.fillText('Niagara Laser Font Options', 174, 86)
  context.fillStyle = '#b8ffd0'
  context.font = '600 22px ui-sans-serif, system-ui, sans-serif'
  context.fillText('Visible options from the font lineup', 176, 118)

  let top = 168
  rows.forEach(({ font, lines, height: rowHeight }, index) => {
    context.fillStyle = index % 2 === 0 ? '#ffffff' : '#f4efe6'
    context.fillRect(48, top, width - 96, rowHeight - 20)
    context.fillStyle = '#736455'
    context.font = '600 24px ui-sans-serif, system-ui, sans-serif'
    context.fillText(font.name, 76, top + 38)
    context.fillStyle = '#1d1a16'
    context.font = `52px ${font.family}`
    lines.forEach((line, lineIndex) => {
      context.fillText(line, 76, top + 92 + lineIndex * 58)
    })
    top += rowHeight
  })

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = 'font-options.png'
  link.click()
}
