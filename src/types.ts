export type FontSource = 'preset' | 'upload'

export type FontOption = {
  id: string
  name: string
  family: string
  source: FontSource
  fileName?: string
  objectUrl?: string
}
