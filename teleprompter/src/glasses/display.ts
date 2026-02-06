import { TextContainerProperty } from '@evenrealities/even_hub_sdk'
import { createPage, updateTextThrottled } from '../sdk/containers'

const CONTAINER_ID = 1
const CONTAINER_NAME = 'tab_content'

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

/** Send new content to the glasses display (throttled) */
export async function updateGlasses(content: string) {
  await updateTextThrottled(CONTAINER_ID, CONTAINER_NAME, content)
}
