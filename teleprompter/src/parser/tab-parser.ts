import type { TabFile } from '../state/types'

/** Parse an ASCII guitar tab file, extracting metadata from header lines */
export function parseTabFile(content: string, filename: string): TabFile {
  const lines = content.split('\n')

  let title = filename.replace(/\.(txt|tab)$/i, '').replace(/[-_]/g, ' ')
  let artist = 'Unknown'
  let tuning = 'Standard'
  let bpm: number | null = null

  // Scan first 15 lines for metadata
  for (const line of lines.slice(0, 15)) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(Title|Song|Name)\s*:\s*(.+)/i)
    if (match) {
      title = match[2].trim()
      continue
    }
    const artistMatch = trimmed.match(/^(Artist|By|Band)\s*:\s*(.+)/i)
    if (artistMatch) {
      artist = artistMatch[2].trim()
      continue
    }
    const tuningMatch = trimmed.match(/^Tuning\s*:\s*(.+)/i)
    if (tuningMatch) {
      tuning = tuningMatch[1].trim()
      continue
    }
    const bpmMatch = trimmed.match(/^(BPM|Tempo)\s*:\s*(\d+)/i)
    if (bpmMatch) {
      bpm = parseInt(bpmMatch[2], 10)
      continue
    }
  }

  return {
    id: `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    title,
    artist,
    tuning,
    bpm,
    content,
    createdAt: Date.now(),
  }
}
