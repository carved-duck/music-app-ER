import {
  CreateStartUpPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  type StartUpPageCreateResult,
} from '@evenrealities/even_hub_sdk'
import { bridge } from './bridge'

/** Create the initial page container layout (call once at startup) */
export async function createPage(
  textContainers: TextContainerProperty[],
): Promise<StartUpPageCreateResult> {
  const page = new CreateStartUpPageContainer({
    containerTotalNum: textContainers.length,
    textObject: textContainers,
  })
  const result = await bridge.sdk.createStartUpPageContainer(page)
  console.log('[SDK] createStartUpPageContainer result:', result)
  return result
}

/** Update the text content of an existing container */
export async function updateText(
  containerID: number,
  containerName: string,
  content: string,
): Promise<boolean> {
  const upgrade = new TextContainerUpgrade({
    containerID,
    containerName,
    content,
  })
  return bridge.sdk.textContainerUpgrade(upgrade)
}

/** Shutdown the page container */
export async function shutdown(exitMode = 0): Promise<boolean> {
  return bridge.sdk.shutDownPageContainer(exitMode)
}

/** Rate-limited text update with trailing edge — last update always fires */
let lastUpdate = 0
let pendingTimer: ReturnType<typeof setTimeout> | null = null
const THROTTLE_MS = 100

export async function updateTextThrottled(
  containerID: number,
  containerName: string,
  content: string,
): Promise<void> {
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }

  const now = Date.now()
  const elapsed = now - lastUpdate

  if (elapsed >= THROTTLE_MS) {
    lastUpdate = now
    await updateText(containerID, containerName, content)
  } else {
    // Schedule trailing-edge update so the last call always fires
    pendingTimer = setTimeout(async () => {
      pendingTimer = null
      lastUpdate = Date.now()
      await updateText(containerID, containerName, content)
    }, THROTTLE_MS - elapsed)
  }
}
