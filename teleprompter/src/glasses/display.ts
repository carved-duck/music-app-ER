import { TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { createPage, updateTextThrottled } from '../sdk/containers'

const CONTAINER_ID = 1
const CONTAINER_NAME = 'tab_content'

// Approximate chars per line on 576px display with padding=8 and monospace font
const CHARS_PER_LINE = 60

let lastContent = ''
let lastBeatOn = false

/** Create a single full-screen TEXT container for tab display */
export async function initGlassesDisplay(initialContent = 'No content loaded') {
  const container = new TextContainerProperty({
    containerID: CONTAINER_ID,
    containerName: CONTAINER_NAME,
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 0,
    borderColor: 0,
    borderRdaius: 0,
    paddingLength: 8,
    isEventCapture: 1,
    content: initialContent,
  })

  const result = await createPage([container])
  console.log('[Glasses] Display initialized, result:', result)
  return result
}

/** Inject a beat dot (●) at the top-right of the first line */
function withBeatDot(content: string, beatOn: boolean): string {
  if (!beatOn) return content
  const lines = content.split('\n')
  const firstLine = lines[0] || ''
  const dotChar = '●'
  const pad = Math.max(1, CHARS_PER_LINE - firstLine.length - 1)
  lines[0] = firstLine + ' '.repeat(pad) + dotChar
  return lines.join('\n')
}

/** Send new content to the glasses display (throttled) */
export async function updateGlasses(content: string) {
  lastContent = content
  await updateTextThrottled(CONTAINER_ID, CONTAINER_NAME, withBeatDot(content, lastBeatOn))
}

/** Update just the beat indicator without changing content */
export async function updateBeatIndicator(beatOn: boolean) {
  if (beatOn === lastBeatOn && lastContent) return
  lastBeatOn = beatOn
  if (lastContent) {
    await updateTextThrottled(CONTAINER_ID, CONTAINER_NAME, withBeatDot(lastContent, beatOn))
  }
}
