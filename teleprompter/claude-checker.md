# Claude Code Review Checklist — Teleprompt

When asked to review code or after completing implementation work, run through this checklist thoroughly.

## Pre-Flight

```bash
# Always run these first
cd teleprompter && npx tsc --noEmit 2>&1 | head -30
cd teleprompter && npx vite build 2>&1 | tail -10
```

---

# ERRORS (Must Fix)

These issues block the workflow and must be resolved.

## 1. Security

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] User input is sanitized/validated before use
- [ ] No XSS vulnerabilities (check `dangerouslySetInnerHTML`, unsanitized user content)
- [ ] No command injection in any shell/exec calls
- [ ] Sensitive data not logged to console in production
- [ ] No exposed internal paths or system information in error responses
- [ ] Fetched file content (tabs, scores) treated as untrusted text — never injected as HTML

## 2. TypeScript

- [ ] `npx tsc --noEmit` passes (zero errors)
- [ ] No `any` types unless absolutely necessary (and documented why)
- [ ] Proper null/undefined handling (no unsafe optional chaining assumptions)
- [ ] No `@ts-ignore` or `@ts-nocheck` without justification

## 3. Build

- [ ] `npx vite build` succeeds with no errors
- [ ] Bundle size is reasonable (JS < 150KB gzipped for an AR glasses companion app)

---

# WARNINGS (Should Review)

These issues should be reviewed but don't block the workflow.

## 4. Code Quality

### No Overcoding
- [ ] Only changes requested were made (no extra "improvements")
- [ ] No unnecessary abstractions for one-time operations
- [ ] No premature optimization
- [ ] Comments only where logic isn't self-evident

### No Duplicate Code
- [ ] Types aren't defined in multiple places
- [ ] Utilities aren't reimplemented when they exist elsewhere
- [ ] Components don't duplicate existing functionality

### Clean Code
- [ ] No unused imports, variables, or functions
- [ ] No commented-out code blocks
- [ ] No `console.log` statements beyond intentional tagged logging (`[Init]`, `[SDK]`, etc.)
- [ ] No deprecated APIs (e.g., `substr` → `substring`)

## 5. Preact / Signals Patterns

- [ ] Signal subscriptions (`effect()`) have proper cleanup when needed
- [ ] `effect()` dispose functions captured when used in contexts that may re-run (HMR, re-init)
- [ ] No stale signal reads — computed values derive from signals, not cached locals
- [ ] No unnecessary re-renders from inline object/function creation in JSX
- [ ] `useSignal` used for local component state, global `signal()` for shared state
- [ ] Keys on list items are stable and unique (not array index unless static)

## 6. Even Hub SDK

- [ ] Bridge singleton pattern maintained — never create multiple `EvenAppBridge` instances
- [ ] `createStartUpPageContainer` called once at init; `rebuildPageContainer` for state changes
- [ ] Display updates are rate-limited (min 100ms between `textContainerUpgrade` calls)
- [ ] Exactly 1 container has `isEventCapture=1`
- [ ] Max 4 containers total
- [ ] Event listener filters by container ID / event type (global listener, manual filtering)
- [ ] `app.json` fields (`package_id`, `edition`, `version`) are correct for current release
- [ ] Container dimensions respect 576x288 canvas

## 7. Glasses Display

- [ ] Content fits within 576x288 pixel canvas
- [ ] Monospace text stays within ~48 chars per line at 12px font
- [ ] Fragment/window splitting respects tab section boundaries (blank-line breaks)
- [ ] No content truncation — all windows are reachable via scroll
- [ ] Playback engine stops at end of content (no infinite loop)
- [ ] BPM clamped to valid range (40–300)

## 8. Edge Cases

- [ ] Empty arrays/objects handled (show empty state, not broken UI)
- [ ] Null/undefined values handled (no file selected, no content loaded)
- [ ] Loading states handled where applicable
- [ ] Error states handled (SDK init failure, file load failure)
- [ ] Network failures handled gracefully (fixture fetch, SDK bridge)
- [ ] Boundary values tested (0 BPM, empty tab file, single-line content, max-length content)
- [ ] App works in browser without glasses connected (graceful SDK fallback)

## 9. Performance

- [ ] Display update throttling is working (not flooding SDK with calls)
- [ ] `setInterval` timers are cleaned up on stop/unmount
- [ ] No memory leaks from unsubscribed effects or event listeners
- [ ] Tab parsing and fragmentation don't block the main thread for large files
- [ ] Bundle size impact considered for new dependencies

## 10. Accessibility (Phone UI)

- [ ] Interactive elements (buttons, links) have descriptive text or `aria-label`
- [ ] Clickable `<div>` elements use `role="button"` + `tabIndex={0}` + keyboard handler, or are actual `<button>`s
- [ ] Form inputs have associated labels
- [ ] Focus states are visible
- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [ ] Progress indicators have `role="progressbar"` + `aria-valuenow`

## 11. Testing

- [ ] Pure functions (`fragmentTabContent`, `parseTabFile`) have test coverage
- [ ] Edge cases identified (null, empty, boundary values)
- [ ] Error paths tested, not just happy path
- [ ] State store actions tested for expected signal mutations

---

# Git Rules

**NEVER do these automatically:**
- `git push` — User always pushes manually
- `git commit` — Only commit when explicitly asked
- `git push --force` — Never
- Modify `.env` files with real credentials
- Stage/commit Claude-related files (claude-checker.md, CLAUDE.md)

---

# Quick Commands

```bash
# TypeScript check
cd teleprompter && npx tsc --noEmit

# Build check
cd teleprompter && npx vite build

# Dev server
cd teleprompter && npm run dev

# Check git status
git status

# Check for console.logs in source
grep -rn "console\." teleprompter/src/

# Find TODO/FIXME comments
grep -rn "TODO\|FIXME" teleprompter/src/

# Check bundle contents
cd teleprompter && npx vite build --report
```

---

# When Issues Are Found

1. **Fix immediately** if it's a clear bug, security issue, or type error
2. **Ask the user** if it's a design decision or unclear requirement
3. **Document** if it's a known limitation or future TODO

---

# Report Format

After review, summarize findings:

```
## Code Review Summary

### Pre-Flight
- TypeScript: ✅ passed / ❌ X errors
- Build: ✅ passed / ❌ failed

### Errors (must fix)
- [file:line] Description of issue and fix

### Warnings (should review)
- [file:line] Description of potential issue

### Suggestions (optional improvements)
- [file:line] Description of enhancement

### Pre-existing Issues (not from this change)
- [file:line] Description (separate from current work)
```
