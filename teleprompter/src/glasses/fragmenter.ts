/**
 * Split tab content into windows that fit the glasses display.
 *
 * 576x288 canvas, monospace ~12px font, ~14px line height → ~18 usable lines.
 * Smart splitting: prefer breaking at blank lines (between tab sections)
 * rather than mid-measure.
 */

const DEFAULT_LINES_PER_WINDOW = 18

export function fragmentTabContent(
  content: string,
  linesPerWindow = DEFAULT_LINES_PER_WINDOW,
): string[] {
  const lines = content.split('\n')
  if (lines.length === 0) return ['']

  const windows: string[] = []
  let start = 0

  while (start < lines.length) {
    let end = Math.min(start + linesPerWindow, lines.length)

    // Try to find a blank line near the end to break cleanly
    if (end < lines.length) {
      const searchFrom = Math.max(start + Math.floor(linesPerWindow * 0.6), start + 1)
      let bestBreak = -1
      for (let i = end - 1; i >= searchFrom; i--) {
        if (lines[i].trim() === '') {
          bestBreak = i
          break
        }
      }
      if (bestBreak > start) {
        end = bestBreak + 1 // include the blank line
      }
    }

    const windowLines = lines.slice(start, end)
    windows.push(windowLines.join('\n'))
    start = end
  }

  return windows.length > 0 ? windows : ['']
}
