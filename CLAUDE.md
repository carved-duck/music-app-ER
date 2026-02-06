# CLAUDE.md — music-app-ER

## Project Overview

Teleprompter-style music score reader for Even Realities G2 AR glasses. Displays guitar tabs and sheet music on the glasses display with BPM-based auto-scrolling. Forked from EH-InNovel (novel reader reference app).

**Repo:** `carved-duck/music-app-ER`
**Upstream:** `even-realities/EH-InNovel` (reference only)

## Product Vision

A musician wears G2 glasses and sees their music scrolling hands-free while they play. No page turns, no music stand — just the score in your field of view.

### Input Formats (phased)
1. **Phase 1:** Plain text guitar tabs (ASCII, like Ultimate Guitar) — rendered in TEXT containers
2. **Phase 2:** PDF sheet music / tab books — rendered as image strips in IMAGE containers
3. **Future:** MusicXML / Guitar Pro — parsed for structured playback with beat-aware cursor

### Scroll Modes (phased)
1. **Now:** BPM-based auto-scroll + ring gesture manual control (swipe up/down to adjust speed, tap to start/pause)
2. **Future (when mic API ships):** Audio-follow mode — pitch detection tracks position in the score automatically

### Key UX Concepts
- **Playback cursor:** A marker that advances through the score at the set BPM, showing current position
- **Ring scroll is for practice:** Impossible to use ring while playing an instrument, so ring is for rehearsing specific sections
- **Auto-scroll is for performance:** Set BPM, tap to start, play hands-free

## Even Hub Platform Constraints

- **G2 display canvas:** 576 x 288 pixels (wide letterbox)
- **Container types:** LIST (gesture capture), TEXT, IMAGE — max 4 containers, exactly 1 must have `isEventCapture=1`
- **SDK:** `@evenrealities/even_hub_sdk` (npm), bridge via `waitForEvenAppBridge()`
- **Key methods:** `createStartUpPageContainer()`, `rebuildPageContainer()`, `textContainerUpgrade()`, `updateImageRawData()`
- **Events:** click(0), scroll_bottom(1), scroll_top(2), foreground_enter(4), foreground_exit(5)
- **Dev flow:** local server → QR scan from EvenHub app → glasses render
- **Emulator:** [even_hub_emu](https://github.com/aegray/even_hub_emu) (Flutter, for testing without hardware)
- **Mic API:** NOT available yet (P0 in pilot feedback) — blocks audio-follow mode

### SDK Gotchas
- Multiple SDK instances cause instability — use singleton pattern
- `createStartUpPageContainer` vs `rebuildPageContainer` is confusing — call create once at init, rebuild for state changes
- Image flow is fragmented: create container first, then send image data separately
- Error codes are generic (`Result: 1`) — no verbose messages
- Global event listener only — manually filter by container ID
- Need manual rate-limiting for display updates

## Tech Stack (planned)

Targeting **plain TS + Vite** (like stillness-plugin), NOT KMP/Compose. Reasons:
- Single web target, no need for multiplatform
- Fastest iteration, simplest build
- Matches the pattern of the simplest working Even Hub app (stillness)
- InNovel KMP code stays as SDK integration reference

## Existing Codebase (from InNovel fork)

The KMP/Compose novel reader code is still in the repo as reference for SDK integration patterns. The new teleprompter app will be built separately.

### InNovel Reference Structure
```
composeApp/src/
├── commonMain/        # Shared theme
├── webMain/           # Shared web logic — SDK bridge, models, views
├── jsMain/            # Kotlin/JS platform implementations
├── wasmJsMain/        # Kotlin/Wasm platform implementations
└── webTest/           # Tests
```

### InNovel Build & Run (reference)
```bash
./gradlew :composeApp:wasmJsBrowserDevelopmentRun  # port 2000
```

## Reference Apps

- **stillness-plugin** ([repo](https://github.com/azmosis25/stillness-plugin-phase1)): Breathing app, pure JS+Vite, text-only rendering with Unicode glyphs. Best reference for simple Even Hub app architecture.
- **even_hub_emu** ([repo](https://github.com/aegray/even_hub_emu)): Flutter emulator for testing without glasses.
- **powerslides** ([repo](https://github.com/jappyjan/powerslides)): Presentation remote, React+TS+Vite monorepo, WebSocket relay, uses community "Even Better SDK".

## Git Commit Rules

- Do NOT include `Co-Authored-By` or any Claude/AI attribution in commit messages

## Open Questions

- How much text / how many tab lines fit legibly on 576x288?
- For PDF rendering: how many measures of single-staff music (trumpet) fit at readable size?
- Figma design guidelines (incoming from user)
- TestFlight access pending for on-device testing
