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
export const fileListIndex = signal(0)

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

/** Jump to the start of the current song */
export function jumpToStart() {
  isPlaying.value = false
  windowIndex.value = 0
}

/** Move file list cursor down */
export function fileListNext() {
  const len = files.value.length
  if (len > 0 && fileListIndex.value < len - 1) {
    fileListIndex.value++
  }
}

/** Move file list cursor up */
export function fileListPrev() {
  if (fileListIndex.value > 0) {
    fileListIndex.value--
  }
}

/** Select the file at the current cursor */
export function fileListSelect() {
  const list = files.value
  const idx = fileListIndex.value
  if (idx >= 0 && idx < list.length) {
    selectFile(list[idx].id)
  }
}

/** Render file list for glasses display */
export function renderFileListForGlasses(): string {
  const list = files.value
  if (list.length === 0) return 'Teleprompt\n\nNo files loaded.'
  const idx = fileListIndex.value
  const header = 'Select a song:\n'
  const items = list.map((f, i) => {
    const cursor = i === idx ? '>' : ' '
    const bpmStr = f.bpm ? ` ${f.bpm}bpm` : ''
    return `${cursor} ${f.title}${bpmStr}`
  })
  return header + items.join('\n')
}

/** Deselect current file, return to file list */
export function deselectFile() {
  isPlaying.value = false
  currentFileId.value = null
  windowIndex.value = 0
  windows.value = []
}

/**
 * Double-tap state machine:
 * 1. Mid-song (windowIndex > 0) → jump to start
 * 2. At start of song (windowIndex === 0, file selected) → deselect, go to file list
 * 3. At file list (no file selected) → request app close
 * Returns 'jump' | 'deselect' | 'close'
 */
export function handleDoubleTap(): 'jump' | 'deselect' | 'close' {
  if (currentFileId.value) {
    if (windowIndex.value > 0) {
      jumpToStart()
      return 'jump'
    } else {
      deselectFile()
      return 'deselect'
    }
  }
  return 'close'
}

export function addFile(file: TabFile) {
  files.value = [...files.value, file]
}
