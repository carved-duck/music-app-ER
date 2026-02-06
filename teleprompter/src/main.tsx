import { render } from 'preact'
import { effect } from '@preact/signals'
import { App } from './phone/App'
import { bridge } from './sdk/bridge'
import { initGlassesDisplay, updateGlasses, updateBeatIndicator } from './glasses/display'
import { setupGlassesEvents } from './glasses/events'
import { initPlaybackEngine, beatTick } from './playback/engine'
import { parseTabFile } from './parser/tab-parser'
import {
  addFile,
  currentWindow,
  isBridgeReady,
  nextWindow,
  prevWindow,
  togglePlayback,
  renderFileListForGlasses,
} from './state/store'

const FIXTURES = [
  'simple-progression.txt',
  'minor-riff.txt',
  'fingerpicking-pattern.txt',
]

async function loadFixtures() {
  for (const name of FIXTURES) {
    try {
      const res = await fetch(`/fixtures/${name}`)
      if (!res.ok) {
        console.warn(`[Init] Failed to load ${name}: HTTP ${res.status}`)
        continue
      }
      const text = await res.text()
      addFile(parseTabFile(text, name))
      console.log(`[Init] Loaded fixture: ${name}`)
    } catch (err) {
      console.warn(`[Init] Failed to load ${name}:`, err)
    }
  }
}

let cleanupSDK: (() => void) | null = null

async function initSDK() {
  try {
    await bridge.init()
    isBridgeReady.value = true

    // Create glasses display with file list
    await initGlassesDisplay(renderFileListForGlasses())

    // Wire ring gesture events
    const unsubEvents = setupGlassesEvents()

    // Watch current window and push to glasses
    const disposeContent = effect(() => {
      const content = currentWindow.value
      if (content) updateGlasses(content)
    })

    // Watch beat tick and flash indicator dot on glasses
    const disposeBeat = effect(() => {
      updateBeatIndicator(beatTick.value)
    })

    cleanupSDK = () => {
      unsubEvents()
      disposeContent()
      disposeBeat()
    }

    console.log('[Init] SDK + glasses ready')
  } catch (err) {
    console.warn('[Init] SDK not available (running in browser?):', err)
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        nextWindow()
        break
      case 'ArrowUp':
        e.preventDefault()
        prevWindow()
        break
      case ' ':
        e.preventDefault()
        togglePlayback()
        break
    }
  })
  console.log('[Init] Keyboard shortcuts: ↑↓ scroll, Space play/pause')
}

async function main() {
  console.log('[Init] Teleprompt starting...')

  // Load test fixtures
  await loadFixtures()

  // Init playback engine (signal subscriptions)
  const disposePlayback = initPlaybackEngine()

  // Desktop keyboard shortcuts
  setupKeyboardShortcuts()

  // Render phone UI
  const el = document.getElementById('app')
  if (el) render(<App />, el)

  // Init SDK (non-blocking — app works in browser without glasses)
  initSDK()

  console.log('[Init] App ready')
}

main()
