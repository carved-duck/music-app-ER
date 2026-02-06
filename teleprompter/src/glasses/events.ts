import { OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { bridge } from '../sdk/bridge'
import {
  currentFileId,
  currentWindow,
  nextWindow,
  prevWindow,
  togglePlayback,
  handleDoubleTap,
  fileListNext,
  fileListPrev,
  fileListSelect,
  renderFileListForGlasses,
} from '../state/store'
import { updateGlasses } from './display'
import { shutdown } from '../sdk/containers'

let closePromptActive = false
let closePromptUnsub: (() => void) | null = null

function showClosePrompt() {
  closePromptActive = true
  updateGlasses('End this feature?\n\n  > Yes\n    No')

  closePromptUnsub = bridge.onEvent((event) => {
    const clickEvent =
      event.textEvent?.eventType === OsEventTypeList.CLICK_EVENT ||
      event.sysEvent?.eventType === OsEventTypeList.CLICK_EVENT
    const scrollEvent =
      event.textEvent?.eventType === OsEventTypeList.SCROLL_BOTTOM_EVENT ||
      event.textEvent?.eventType === OsEventTypeList.SCROLL_TOP_EVENT
    const doubleTapEvent =
      event.sysEvent?.eventType === OsEventTypeList.DOUBLE_CLICK_EVENT

    if (clickEvent || doubleTapEvent) {
      console.log('[Event] Close confirmed → shutdown')
      cleanupClosePrompt()
      shutdown()
    } else if (scrollEvent) {
      console.log('[Event] Close cancelled')
      cleanupClosePrompt()
      updateGlasses(renderFileListForGlasses())
    }
  })
}

function cleanupClosePrompt() {
  closePromptActive = false
  if (closePromptUnsub) {
    closePromptUnsub()
    closePromptUnsub = null
  }
}

/** Handle a tap event regardless of source (textEvent or sysEvent) */
function handleTap() {
  const inPlayback = currentFileId.value !== null
  if (inPlayback) {
    console.log('[Event] Tap → toggle playback')
    togglePlayback()
  } else {
    console.log('[Event] Tap → select file')
    fileListSelect()
    // Explicitly push selected file content to glasses
    const content = currentWindow.value
    if (content) {
      updateGlasses(content)
    }
  }
}

/** Wire ring gesture events to state actions */
export function setupGlassesEvents(): () => void {
  return bridge.onEvent((event) => {
    // Skip if close prompt is handling its own events
    if (closePromptActive) return

    const inPlayback = currentFileId.value !== null

    // Handle text container events
    if (event.textEvent) {
      switch (event.textEvent.eventType) {
        case OsEventTypeList.SCROLL_BOTTOM_EVENT:
          if (inPlayback) {
            console.log('[Event] Swipe down → next window')
            nextWindow()
          } else {
            console.log('[Event] Swipe down → file list next')
            fileListNext()
            updateGlasses(renderFileListForGlasses())
          }
          break
        case OsEventTypeList.SCROLL_TOP_EVENT:
          if (inPlayback) {
            console.log('[Event] Swipe up → prev window')
            prevWindow()
          } else {
            console.log('[Event] Swipe up → file list prev')
            fileListPrev()
            updateGlasses(renderFileListForGlasses())
          }
          break
        case OsEventTypeList.CLICK_EVENT:
          handleTap()
          break
      }
    }

    // Handle system events
    if (event.sysEvent) {
      switch (event.sysEvent.eventType) {
        case OsEventTypeList.CLICK_EVENT:
          // Fallback: some devices send click via sysEvent
          handleTap()
          break
        case OsEventTypeList.DOUBLE_CLICK_EVENT: {
          const result = handleDoubleTap()
          console.log(`[Event] Double tap → ${result}`)
          if (result === 'jump') {
            updateGlasses('Back to start')
          } else if (result === 'deselect') {
            updateGlasses(renderFileListForGlasses())
          } else if (result === 'close') {
            showClosePrompt()
          }
          break
        }
        case OsEventTypeList.FOREGROUND_ENTER_EVENT:
          console.log('[Event] Foreground enter')
          break
        case OsEventTypeList.FOREGROUND_EXIT_EVENT:
          console.log('[Event] Foreground exit')
          break
      }
    }
  })
}
