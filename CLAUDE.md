# CLAUDE.md — music-app-ER

## Project Overview

Teleprompter-style music score reader for Even Realities G2 AR glasses. Displays music on the glasses display with BPM-based auto-scrolling. Forked from EH-InNovel (novel reader reference app).

**Repo:** `carved-duck/music-app-ER`
**Upstream:** `even-realities/EH-InNovel` (reference only)

## Product Vision

A musician wears G2 glasses and sees their music scrolling hands-free while they play. No page turns, no music stand — just the score in your field of view.

### Input Formats (phased)
1. **Phase 1 (current):** Plain text guitar tabs (ASCII) — rendered in TEXT containers
2. **Phase 2 (next):** Sheet music (PDF/images) — rendered as image strips in IMAGE containers. User wants to skip to this soon.
3. **Future:** MusicXML / Guitar Pro — parsed for structured playback with beat-aware cursor

### Scroll Modes (phased)
1. **Now:** BPM-based auto-scroll + ring gesture manual control
2. **Future (when mic API ships):** Audio-follow mode — pitch detection tracks position in the score automatically

### Key UX Concepts
- **Ring scroll is for practice:** Impossible to use ring while playing an instrument, so ring is for rehearsing specific sections
- **Auto-scroll is for performance:** Set BPM, tap to start, play hands-free

## What's Built (Phase 1)

The teleprompter app lives in `/teleprompter/`. Tech stack: TypeScript + Vite + Preact + @preact/signals.

### Teleprompter Structure
```
teleprompter/
├── src/
│   ├── main.tsx              # Init: load fixtures → engine → keyboard shortcuts → render → SDK
│   ├── sdk/
│   │   ├── bridge.ts         # Singleton SDK wrapper
│   │   ├── containers.ts     # Helpers: createPage, updateText, shutdown (100ms throttle)
│   │   └── types.ts          # TS types
│   ├── state/
│   │   ├── store.ts          # Preact Signals: files, bpm, isPlaying, windowIndex, fileListIndex
│   │   └── types.ts          # TabFile interface
│   ├── glasses/
│   │   ├── display.ts        # Single full-screen TEXT container (576x288), beat dot indicator
│   │   ├── fragmenter.ts     # Split content into ~18-line windows at blank lines
│   │   └── events.ts         # Ring gesture handler with mode-aware routing
│   ├── phone/
│   │   ├── App.tsx           # Router: list ↔ playback
│   │   ├── FileListScreen.tsx
│   │   ├── PlaybackScreen.tsx # BPM control, metronome dots, glasses preview
│   │   └── styles.css        # Figma design tokens
│   ├── parser/
│   │   └── tab-parser.ts     # Parse ASCII tabs: Title/Artist/Tuning/BPM from header
│   └── playback/
│       └── engine.ts         # Per-beat timer, beatTick/beatCount signals, window advance every measure
├── public/fixtures/           # 3 sample guitar tab files
├── app.json                   # Even Hub manifest
├── package.json
├── vite.config.ts             # port 3000, host: true
└── tsconfig.json
```

### Ring Controls (current implementation)
**File list mode** (no song selected):
- Swipe down → move cursor down in file list
- Swipe up → move cursor up in file list
- Single tap → select highlighted song
- Double tap → show "End this feature?" prompt

**Playback mode** (song selected):
- Swipe down → next window (page moves down)
- Swipe up → prev window (page moves up)
- Single tap → start/stop playback
- Double tap mid-song → jump to start
- Double tap at start → return to file list

**Close prompt:**
- Tap or double-tap → confirms shutdown
- Swipe → cancels, returns to file list

### Glasses Display Features
- File list with `>` cursor indicator
- Tab content in monospace text
- Beat indicator dot (●) blinks in top-right corner during playback
- Beat bar flash in phone's glasses preview panel

### Phone UI Features
- File list with search, song cards (title, artist, BPM)
- Playback screen: BPM +/- controls, Play/Pause button
- 4-dot metronome indicator (blue active, red downbeat)
- Glasses preview panel (dark monospace box, 2:1 aspect ratio)
- Progress bar (window N of M)
- Figma design system tokens (12px screen margin, 16px card, 6px radius)

### Known Issues / In Progress
- **Single tap may not register on glasses** — click events handled in both textEvent and sysEvent as fallback, but needs more testing
- **Swipe direction mapping** — SCROLL_BOTTOM = swipe down, SCROLL_TOP = swipe up. Mapped as: down→next, up→prev. Needs on-device confirmation
- **shutdown() closes immediately** — SDK's shutDownPageContainer doesn't show a dialog. Custom text prompt implemented instead
- Guitar tabs are limited — user wants to move to sheet music (Phase 2) next

## Even Hub Platform Constraints

- **G2 display canvas:** 576 x 288 pixels (wide letterbox)
- **Container types:** LIST (gesture capture), TEXT, IMAGE — max 4 containers, exactly 1 must have `isEventCapture=1`
- **SDK:** `@evenrealities/even_hub_sdk` (npm ^0.0.6), bridge via `waitForEvenAppBridge()`
- **Key methods:** `createStartUpPageContainer()`, `rebuildPageContainer()`, `textContainerUpgrade()`, `updateImageRawData()`
- **Events:** click(0), scroll_bottom(1), scroll_top(2), double_click(3), foreground_enter(4), foreground_exit(5)
- **Dev flow:** local server → QR scan from EvenHub app → glasses render
- **Emulator:** [even_hub_emu](https://github.com/aegray/even_hub_emu) (Flutter, for testing without hardware)
- **Mic API:** NOT available yet (P0 in pilot feedback) — blocks audio-follow mode

### SDK Gotchas
- Multiple SDK instances cause instability — use singleton pattern
- `createStartUpPageContainer` vs `rebuildPageContainer` — call create once at init, rebuild for state changes
- Image flow is fragmented: create container first, then send image data separately
- Error codes are generic (`Result: 1`) — no verbose messages
- Global event listener only — manually filter by container ID
- Need manual rate-limiting for display updates (100ms throttle with trailing edge)
- Click events may come via textEvent or sysEvent — handle both
- `shutDownPageContainer()` closes immediately, no built-in confirmation dialog

## Reference Apps

- **stillness-plugin** ([repo](https://github.com/azmosis25/stillness-plugin-phase1)): Breathing app, pure JS+Vite, text-only rendering with Unicode glyphs
- **even_hub_emu** ([repo](https://github.com/aegray/even_hub_emu)): Flutter emulator for testing without glasses
- **powerslides** ([repo](https://github.com/jappyjan/powerslides)): Presentation remote, React+TS+Vite monorepo, WebSocket relay

## Dev Workflow Rules

- After every code change, display the QR code in the terminal so the user can re-scan: `npx qrcode 'http://192.168.86.204:3000'`
- Dev server: `cd teleprompter && npm run dev` (port 3000, LAN: `http://192.168.86.204:3000`)
- Use `127.0.0.1:3000` in browser (localhost resolves to IPv6 which Vite doesn't bind)

## Git Commit Rules

- Do NOT include `Co-Authored-By` or any Claude/AI attribution in commit messages

## Next Steps

1. **Fix ring controls** — confirm tap/swipe behavior on actual glasses hardware
2. **Phase 2: Sheet music** — render PDF/image-based sheet music instead of ASCII tabs
3. **Longer/real songs** — current fixtures are short practice tabs
4. **Audio-follow mode** — blocked on mic API from Even Realities
