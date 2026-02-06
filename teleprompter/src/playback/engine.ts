import { signal, effect } from '@preact/signals'
import { isPlaying, bpm, windowIndex, windows } from '../state/store'
import { updateGlasses } from '../glasses/display'

/** Toggles true/false on every beat — drives visual metronome */
export const beatTick = signal(false)

/** Counts beats 0-3 within the current measure */
export const beatCount = signal(0)

let scrollTimerId: ReturnType<typeof setInterval> | null = null
let beatTimerId: ReturnType<typeof setInterval> | null = null

function startBeat() {
  if (beatTimerId) return

  const msPerBeat = 60_000 / bpm.value
  beatCount.value = 0
  beatTick.value = true

  beatTimerId = setInterval(() => {
    beatTick.value = !beatTick.value
    beatCount.value = (beatCount.value + 1) % 4

    // Advance window on beat 0 (every measure)
    if (beatCount.value === 0) {
      const idx = windowIndex.value
      const wins = windows.value
      if (idx < wins.length - 1) {
        windowIndex.value = idx + 1
        updateGlasses(wins[idx + 1])
      } else {
        console.log('[Playback] Reached end of content')
        isPlaying.value = false
      }
    }
  }, msPerBeat)
}

function stopBeat() {
  if (beatTimerId) {
    clearInterval(beatTimerId)
    beatTimerId = null
  }
  beatTick.value = false
  beatCount.value = 0
}

/** Initialize playback engine — watches isPlaying & bpm signals */
export function initPlaybackEngine(): () => void {
  const dispose = effect(() => {
    const playing = isPlaying.value
    const _bpm = bpm.value // subscribe to BPM changes
    stopBeat()
    if (playing) startBeat()
  })
  return dispose
}
