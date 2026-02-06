import { effect } from '@preact/signals'
import { isPlaying, bpm, windowIndex, windows } from '../state/store'
import { updateGlasses } from '../glasses/display'

let timerId: ReturnType<typeof setInterval> | null = null

function start() {
  if (timerId) return

  // 4 beats per window advance (one measure at 4/4 time)
  const beatsPerWindow = 4
  const msPerBeat = 60_000 / bpm.value
  const interval = msPerBeat * beatsPerWindow

  console.log(`[Playback] Starting at ${bpm.value} BPM (${Math.round(interval)}ms/window)`)

  timerId = setInterval(() => {
    const idx = windowIndex.value
    const wins = windows.value

    if (idx < wins.length - 1) {
      windowIndex.value = idx + 1
      updateGlasses(wins[idx + 1])
    } else {
      // Reached end — stop
      console.log('[Playback] Reached end of content')
      isPlaying.value = false
    }
  }, interval)
}

function stop() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
    console.log('[Playback] Stopped')
  }
}

/** Initialize playback engine — watches isPlaying & bpm signals */
export function initPlaybackEngine(): () => void {
  const dispose = effect(() => {
    const playing = isPlaying.value
    const _bpm = bpm.value // subscribe to BPM changes
    stop()
    if (playing) start()
  })
  return dispose
}
