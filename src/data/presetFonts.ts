import type { FontOption } from '../types'

type PresetFontDefinition = {
  id: string
  name: string
  family: string
  fileName: string
}

const fontDefinitions: PresetFontDefinition[] = [
  { id: 'preset-lato', name: 'Lato', family: 'Lato', fileName: 'Lato Regular.ttf' },
  { id: 'preset-goudy-old-style', name: 'Goudy Old Style', family: 'Goudy Old Style', fileName: 'GOUDOS.TTF' },
  { id: 'preset-perpetua', name: 'Perpetua', family: 'Perpetua', fileName: 'PER_____.TTF' },
  { id: 'preset-book-antiqua', name: 'Book Antiqua', family: 'Book Antiqua', fileName: 'BKANT.TTF' },
  { id: 'preset-imprint-mt-shadow', name: 'Imprint MT Shadow', family: 'Imprint MT Shadow', fileName: 'IMPRISHA.TTF' },
  { id: 'preset-black-jack', name: 'Black Jack', family: 'Black Jack', fileName: 'Black Jack Regular.ttf' },
  { id: 'preset-alex-brush', name: 'Alex Brush', family: 'Alex Brush', fileName: 'AlexBrush Regular.ttf' },
  { id: 'preset-monotype-corsiva', name: 'Monotype Corsiva', family: 'Monotype Corsiva', fileName: 'MTCORSVA.TTF' },
  { id: 'preset-script-mt-bold', name: 'Script MT Bold', family: 'Script MT Bold', fileName: 'SCRIPTBL.TTF' },
  { id: 'preset-great-vibes', name: 'Great Vibes', family: 'Great Vibes', fileName: 'GreatVibes-Wmr4.ttf' },
  { id: 'preset-dancing-script', name: 'Dancing Script', family: 'Dancing Script', fileName: 'Dancing Script OT Regular.otf' },
  { id: 'preset-italianno', name: 'Italianno', family: 'Italianno', fileName: 'Italianno-Regular.ttf' },
  { id: 'preset-brush-script-mt', name: 'Brush Script MT', family: 'Brush Script MT', fileName: 'BRUSHSCI.TTF' },
  {
    id: 'preset-sackers-heavy-gothic',
    name: 'Sackers Heavy Gothic',
    family: 'Sackers Heavy Gothic',
    fileName: 'Sackers Gothic Heavy.ttf',
  },
  {
    id: 'preset-copperplate-gothic-bold',
    name: 'Copperplate Gothic Bold',
    family: 'Copperplate Gothic Bold',
    fileName: 'COPRGTB.TTF',
  },
  { id: 'preset-elephant', name: 'Elephant', family: 'Elephant', fileName: 'ELEPHNT.TTF' },
  { id: 'preset-college-block', name: 'College Block', family: 'College Block', fileName: 'College Block.otf' },
  { id: 'preset-agency-fb', name: 'Agency FB', family: 'Agency FB', fileName: 'AGENCYR.TTF' },
  { id: 'preset-stardos-stencil', name: 'Stardos Stencil', family: 'Stardos Stencil', fileName: 'STENCIL.TTF' },
]

function fontUrl(fileName: string) {
  return `/fonts/${encodeURIComponent(fileName)}`
}

function registerPresetFonts() {
  if (typeof document === 'undefined' || document.getElementById('preset-font-faces')) return

  const style = document.createElement('style')
  style.id = 'preset-font-faces'
  style.textContent = fontDefinitions
    .map(
      (font) => `@font-face {
  font-family: "${font.family}";
  src: url("${fontUrl(font.fileName)}");
  font-display: swap;
}`,
    )
    .join('\n\n')
  document.head.appendChild(style)
}

registerPresetFonts()

export const presetFonts: FontOption[] = fontDefinitions.map((font) => ({
  id: font.id,
  name: font.name,
  family: font.family,
  source: 'preset',
}))
