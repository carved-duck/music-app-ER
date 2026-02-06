import { OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { bridge } from '../sdk/bridge'
import { nextWindow, prevWindow, togglePlayback } from '../state/store'

/** Wire ring gesture events to state actions */
export function setupGlassesEvents(): () => void {
  return bridge.onEvent((event) => {
    // Handle text container events (our main container)
    if (event.textEvent) {
      switch (event.textEvent.eventType) {
        case OsEventTypeList.SCROLL_BOTTOM_EVENT:
          console.log('[Event] Scroll bottom → next window')
          nextWindow()
          break
        case OsEventTypeList.SCROLL_TOP_EVENT:
          console.log('[Event] Scroll top → prev window')
          prevWindow()
          break
        case OsEventTypeList.CLICK_EVENT:
          console.log('[Event] Click → toggle playback')
          togglePlayback()
          break
      }
    }

    // Handle system events (foreground, double-click)
    if (event.sysEvent) {
      switch (event.sysEvent.eventType) {
        case OsEventTypeList.DOUBLE_CLICK_EVENT:
          console.log('[Event] Double click → toggle playback')
          togglePlayback()
          break
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
