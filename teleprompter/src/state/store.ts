import { signal, computed, effect } from '@preact/signals'
import type { TabFile } from './types'
import { fragmentTabContent } from '../glasses/fragmenter'

// --- Signals ---

export const files = signal<TabFile[]>([])
export const currentFileId = signal<string | null>(null)
export const bpm = signal(120)
export const isPlaying = signal(false)
export const windowIndex = signal(0)
export const windows = signal<string[]>([])
export const isBridgeReady = signal(false)

// --- Computed ---

export const currentFile = computed(() => {
  const id = currentFileId.value
  if (!id) return null
  return files.value.find((f) => f.id === id) ?? null
})

export const currentWindow = computed(() => {
  const w = windows.value
  const i = windowIndex.value
  if (i < 0 || i >= w.length) return ''
  return w[i]
})

export const totalWindows = computed(() => windows.value.length)

export const progress = computed(() => {
  const total = totalWindows.value
  if (total === 0) return 0
  return Math.round(((windowIndex.value + 1) / total) * 100)
})

// --- Actions ---

export function selectFile(fileId: string) {
  const file = files.value.find((f) => f.id === fileId)
  if (!file) return

  isPlaying.value = false
  currentFileId.value = fileId
  windowIndex.value = 0
  windows.value = fragmentTabContent(file.content)

  // Use file's BPM if specified
  if (file.bpm) bpm.value = file.bpm
}

export function setBpm(v: number) {
  bpm.value = Math.max(40, Math.min(300, v))
}

export function togglePlayback() {
  isPlaying.value = !isPlaying.value
}

export function nextWindow() {
  if (windowIndex.value < windows.value.length - 1) {
    windowIndex.value++
  }
}

export function prevWindow() {
  if (windowIndex.value > 0) {
    windowIndex.value--
  }
}

export function addFile(file: TabFile) {
  files.value = [...files.value, file]
}
