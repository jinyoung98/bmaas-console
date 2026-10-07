import type { Region } from './types'

export const regions: Region[] = [
  { id: 'kr-seoul-1', city: 'Seoul', code: 'seoul' },
  { id: 'kr-gwangju-1', city: 'Gwangju', code: 'gwangju' },
  { id: 'kr-busan-1', city: 'Busan', code: 'busan' },
  { id: 'jp-tokyo-1', city: 'Tokyo', code: 'tokyo' },
]

export const regionById = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<Region['id'], Region>
