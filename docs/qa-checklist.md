# Auralis QA Checklist

**Version:** 0.2
**Date:** 2026-03-31
**Build:** Multi-brand voice AI platform (Home, CreateAgent, Lobby, Session, Summary, History)
**Scope:** Pre-external-share review

---

## Summary

| Area | Status | Notes |
|---|---|---|
| Home / Entry | NEEDS TEST | New screen — agent picker + create CTA |
| Agent Creation (URL → Agent) | NEEDS TEST | Crawl + enrich + generate pipeline |
| Happy Path (Home → Lobby → Session → Summary) | NEEDS TEST | Core flow |
| Session History | NEEDS TEST | Persist, list, replay, AI summary |
| Shareable Agent Links | NEEDS TEST | /agent/:id KV lookup |
| State & Persistence | NEEDS TEST | selectedBrand in sessionStorage; session history in localStorage |
| Navigation (forward) | NEEDS TEST | All forward paths |
| Navigation (back/browser) | NEEDS TEST | useBlocker on Session verified? |
| Empty States | NEEDS TEST | Route guards, empty history, no custom agents |
| Error States | NEEDS TEST | Crawl failures, connection errors, bad model ID |
| Mobile Responsiveness | NEEDS TEST | pt-safe/pb-safe on iPhone Safari |
| Copy | NEEDS TEST | No hardcoded agent names; all dynamic |
| Visual Polish | NEEDS TEST | Consistent across all 7 screens |
| Performance | NEEDS TEST | Gemini Live latency |

---

## Area-by-Area Detail

### 1. Home / Entry

**Checklist:**
- [ ] Auralis wordmark renders correctly
- [ ] Three demo agent cards present (Rajah/Rayah, Jollibee/Joy, Globe/Glenda)
- [ ] Tapping a demo agent sets context and routes to /lobby
- [ ] "Your agents" section hidden when no custom agents exist
- [ ] "Your agents" section appears after creating a custom agent
- [ ] Swipe-to-delete on custom agent cards works; agent removed from localStorage
- [ ] "Create your agent" CTA routes to /create
- [ ] History icon routes to /history
- [ ] No placeholder text visible

---

### 2. Agent Creation (URL → Agent)

**Checklist:**
- [ ] URL input accepts a valid URL and submits on CTA tap
- [ ] Progress states cycle in order: Crawling → Enriching → Generating
- [ ] Generated agent preview shows: name, role, brand, color, starters
- [ ] Saving the agent adds it to "Your agents" on Home
- [ ] After save, app navigates directly to the new agent's Lobby
- [ ] Agent gets a shareable link (accessible at /agent/:id)
- [ ] Invalid URL shows human-readable error (not a blank or frozen screen)
- [ ] Crawl failure (unreachable URL) shows human-readable error with retry

---

### 3. Happy Path (Home → Lobby → Session → Summary)

**Checklist:**
- [ ] Full forward flow completes without dead ends for all three demo brands
- [ ] Each brand's Lobby shows the correct agent name, role, logo, starters, and brand colors
- [ ] "Talk to {agentName}" CTA text is correct for all brands (not hardcoded)
- [ ] Mic permission fires only after CTA tap (not on page load)
- [ ] Session connects within ~2 seconds of mic permission granted
- [ ] Agent speaks an opening turn; transcript appears; state indicators transition correctly
- [ ] User can speak; barge-in works (speaking while agent is speaking stops agent audio)
- [ ] "End" → confirmation → transcript saved → Summary screen loads
- [ ] Summary shows correct agent name, full transcript, and timestamps in M:SS format
- [ ] "Talk to {agentName} Again" returns to Lobby with clean state
- [ ] "Back to Home" returns to Home

---

### 4. Session History

**Checklist:**
- [ ] After a completed session, the session appears in /history
- [ ] Session card shows: agent name, brand, date, duration
- [ ] Tapping a session card opens /history/:id
- [ ] HistoryDetail shows: agent name, date, duration, AI summary, full transcript
- [ ] Sessions persist across page refresh
- [ ] History empty state shown when no sessions exist

---

### 5. Shareable Agent Links

**Checklist:**
- [ ] After creating an agent, a shareable URL exists at /agent/:id
- [ ] Opening the shareable URL (in a fresh browser / incognito) loads the agent and routes to Lobby
- [ ] Shared agents work for users who have not created the agent themselves
- [ ] Invalid or expired share links redirect gracefully (to Home or an error state)

---

### 6. State & Persistence

**Checklist:**
- [ ] Refreshing the page within a tab returns the user to the correct brand Lobby (selectedBrand in sessionStorage)
- [ ] Custom agents persist across full page reload (agentStore in localStorage)
- [ ] Session history persists across full page reload (sessionHistory in localStorage)
- [ ] Session transcript is NOT persisted — refresh during a session clears it (by design)

---

### 7. Navigation (Forward)

**Checklist:**

| Route | Trigger | Expected |
|---|---|---|
| / → /lobby | Tap agent card | Correct brand loaded |
| / → /create | Tap "Create your agent" | CreateAgent screen |
| /create → /lobby | Save new agent | New agent's Lobby |
| /agent/:id → /lobby | Open share link | Correct agent Lobby |
| /lobby → /session | Tap "Talk to" + mic granted | Session starts |
| /session → /summary | End + confirm | Summary with transcript |
| /summary → /lobby | "Talk Again" | Lobby, clean state |
| /summary → / | "Back to Home" | Home |
| / → /history | History icon | History list |
| /history → /history/:id | Tap session card | Session detail |
| /session (no brand) | Direct URL | Redirect to / |
| /summary (no transcript) | Direct URL | Redirect to /lobby |

---

### 8. Navigation (Browser Back / System Back)

**Checklist:**
- [ ] Browser back from active Session surfaces the end confirmation dialog (useBlocker active)
- [ ] Confirming "Yes, end" saves transcript and navigates to Summary
- [ ] Cancelling "Keep talking" resumes the session
- [ ] Browser back from Lobby navigates cleanly to Home (no broken state)
- [ ] Browser back from Summary navigates cleanly to Lobby or Home

---

### 9. Empty States

**Checklist:**
- [ ] /session with no brand in context: redirects to /
- [ ] /summary with no transcript in context: redirects to /lobby
- [ ] /history with no saved sessions: empty state shown
- [ ] Session transcript zone before first turn: "Your conversation will appear here."
- [ ] Summary with no transcript turns: "Nothing was captured in this conversation."
- [ ] Home with no custom agents: "Your agents" section hidden

---

### 10. Error States

**Checklist:**
- [ ] Session connection failure: error state UI shown (red avatar tint, human-readable message)
- [ ] "Try Again" in error state re-initiates session
- [ ] "End" in error state navigates to Summary
- [ ] Summary after error-ended session: error note is shown above transcript
- [ ] Mic permission denied: human-readable error with dynamic agent name (not hardcoded "Aria")
- [ ] CreateAgent crawl failure: human-readable error, not blank screen
- [ ] /agent/:id with invalid ID: graceful redirect, not broken screen

---

### 11. Mobile Responsiveness

**Checklist:**
- [ ] All screens unbroken at 390px viewport (iPhone 14 width)
- [ ] `viewport-fit=cover` present in index.html meta tag
- [ ] `pt-safe-or-X` and `pb-safe-or-X` utilities defined in tailwind.config.js
- [ ] Content does not render behind notch or home indicator on iPhone Safari
- [ ] CTA buttons reachable with one thumb (bottom-docked controls)
- [ ] Transcript zone scrollable without triggering page scroll

---

### 12. Copy

**Checklist:**
- [ ] No hardcoded "Aria", "Lumia", or "Lumia Journeys" visible anywhere in the UI
- [ ] All agent names, brand names, and role lines are dynamic from agent config
- [ ] Mic error message uses dynamic agent name for all brands
- [ ] State labels dynamically reference agent name where applicable ("{agentName} is speaking")
- [ ] No placeholder text visible in any screen's normal state
- [ ] No emoji in UI copy

---

### 13. Visual Polish

**Checklist:**
- [ ] Typography hierarchy consistent: Space Grotesk for headings/agent names, Inter for body
- [ ] Dark atmospheric background on all screens (not flat white or generic grey)
- [ ] Glass surfaces on elevated cards and panels
- [ ] Brand colors applied consistently per agent (avatar gradient, ring, borders)
- [ ] Avatar animations transition correctly between all 5 states
- [ ] No developer-facing text or console errors visible in UI

---

## Pre-Share Blockers

The following must be confirmed before sharing the link externally:

1. Gemini Live model ID confirmed correct (currently `gemini-2.0-flash-live-001`)
2. All agent names are dynamic in mic error message and state labels — no "Aria" hardcoding
3. `pt-safe`/`pb-safe` utilities configured and tested on a physical iPhone
4. Agent creation pipeline (crawl → enrich → generate) tested with at least one real URL
5. Shareable link flow tested in an incognito/fresh browser session
