# Auralis Bug Log

**Last updated:** 2026-03-30
**Build state:** All initial QA bugs resolved

---

## Priority Reference

- **P1** — Blocking: breaks the demo or produces visibly wrong output for all users
- **P2** — Significant: degrades experience or creates a failure mode under realistic conditions
- **P3** — Minor / polish: low user impact, cosmetic or edge-case

---

## P1 — Blocking

### BUG-001 — Mic error message hardcoded to "Aria" for all brands

**Status: Resolved**
**Fix:** `useGeminiLive` now accepts an `agentName` parameter (default `'the agent'`). Session passes `selectedBrand.agentName`. Error message reads: `"Microphone access is required to talk to [agentName]."` — correct for all brands.
**File:** [src/hooks/useGeminiLive.js](src/hooks/useGeminiLive.js#L23)

---

### BUG-002 — Gemini Live model ID likely incorrect

**Status: Resolved**
**Fix:** Model changed from `gemini-3.1-flash-live-preview` to `gemini-2.0-flash-live-001` (stable GA release). Extracted to a named constant `GEMINI_LIVE_MODEL` at the top of the hook file for easy future updates.
**File:** [src/hooks/useGeminiLive.js](src/hooks/useGeminiLive.js#L16)

---

### BUG-003 — API key hardcoded in client-side source

**Status: Resolved**
**Fix:** Key moved to `.env` as `VITE_GEMINI_API_KEY`. `AppContext` reads it via `import.meta.env.VITE_GEMINI_API_KEY`. `.gitignore` created to exclude `.env` from version control. Key rotation no longer requires a code deploy.
**Note:** `.env` must be created manually (create it in project root). The Vite build will embed the key in the bundle — this is expected for a client-side demo app.
**Files:** [src/context/AppContext.jsx](src/context/AppContext.jsx), `.env`, `.gitignore`

---

## P2 — Significant

### BUG-004 — Page refresh resets all state with no recovery path

**Status: Resolved**
**Fix:** `selectedBrand` is now persisted to `sessionStorage` via a wrapper setter in `AppContext`. On refresh, the brand is rehydrated from `sessionStorage`. Session transcript is intentionally not persisted (session-scoped data). A page refresh within a tab now returns the user to their lobby, not BrandPicker.
**File:** [src/context/AppContext.jsx](src/context/AppContext.jsx)

---

### BUG-005 — Orphaned `Onboarding.jsx` references non-existent context method

**Status: Resolved**
**Fix:** `src/pages/Onboarding.jsx` deleted. Also deleted `src/lib/systemPrompt.js` (also orphaned — system prompts are now in `brands.js`).

---

### BUG-006 — Summary screen ignores `sessionEndedWithError` flag

**Status: Resolved**
**Fix:** Summary now reads `sessionEndedWithError` from context and renders a contextual error note below the "Conversation ended" heading: "Session ended due to a connection issue. Try starting a new conversation."
**File:** [src/pages/Summary.jsx](src/pages/Summary.jsx)

---

### BUG-007 — Browser back button from Session bypasses end confirmation and loses transcript

**Status: Resolved**
**Fix:** Added `useBlocker` (React Router v7) to Session. Blocks any navigation away from `/session` when a session is active, EXCEPT navigation to `/summary` (the intentional exit). When blocked, surfaces the existing `EndConfirm` dialog. On confirm: saves transcript, calls `blocker.reset()`, then navigates to `/summary`. On cancel: resets the blocker and stays in session.
**File:** [src/pages/Session.jsx](src/pages/Session.jsx)

---

### BUG-009 — `pt-safe`/`pb-safe` Tailwind utilities non-standard — iPhone behavior unverified

**Status: Resolved**
**Fix:**
1. Added `viewport-fit=cover` to the `<meta name="viewport">` tag in `index.html` — required for `env(safe-area-inset-*)` to return non-zero values on iPhone.
2. Replaced the conflicting `pt-safe pt-X` pattern with compound `pt-safe-or-X` utilities defined in `tailwind.config.js`. Each utility uses CSS `max()`: `max(env(safe-area-inset-top, 0px), Xrem)`. This ensures the correct value wins on all devices — safe area on notched iPhones, fixed padding on non-notched devices.
3. Applied consistently across all four screens.
**Files:** [index.html](index.html), [tailwind.config.js](tailwind.config.js), all page files

---

## P3 — Minor / Polish

### BUG-008 — Summary timestamps are computed from message index, not real duration

**Status: Resolved**
**Fix:** `useGeminiLive` now records `sessionStartRef.current = Date.now()` when `onopen` fires. Each new transcript entry receives a `ts` field (milliseconds elapsed since session start). `Summary.jsx` uses a `formatTimestamp(ms)` helper to display `M:SS` format.
**Files:** [src/hooks/useGeminiLive.js](src/hooks/useGeminiLive.js), [src/pages/Summary.jsx](src/pages/Summary.jsx)

---

### BUG-010 — `BrandLogo` component duplicated across four files

**Status: Resolved**
**Fix:** Extracted to `src/components/BrandLogo.jsx` with a `fontSize` prop to handle the different size contexts. All four page files now import from the shared component.
**File:** [src/components/BrandLogo.jsx](src/components/BrandLogo.jsx)

---

### BUG-011 — Unused component files in `src/components/`

**Status: Resolved**
**Fix:** Deleted `ApiKeyGate.jsx`, `AgentInterface.jsx`, `Header.jsx`, `VoiceButton.jsx`, `StatusIndicator.jsx`, `TranscriptPanel.jsx`.

---

## Additional fixes (found during resolution pass)

### FIX-012 — `index.html` title still read "Lumia Journeys — Travel Concierge"

**Status: Resolved**
**Fix:** Updated to `Auralis — Voice AI`.
**File:** [index.html](index.html)

### FIX-013 — `navy-400` color used in components but not defined in Tailwind config

**Status: Resolved**
**Fix:** Added `navy-400: '#2E5CA8'` to the color palette in `tailwind.config.js`.
**File:** [tailwind.config.js](tailwind.config.js)

---

## Open

_No open bugs._
