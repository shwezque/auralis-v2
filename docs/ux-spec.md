# UX Spec — Auralis

**Version:** 0.2
**Date:** 2026-03-31
**Maps to:** prd.md features F1–F9

---

## Navigation Model

**Multi-entry, stateful, no persistent chrome.**

The app supports multiple entry points (Home, shareable agent link, direct URL) but converges into a single directed voice flow: Lobby → Session → Summary. Each screen owns the full viewport. No bottom nav, no hamburger menu, no back button visible during an active session.

**Primary flow:**
```
Home → (select agent) → Lobby → Session → Summary → Lobby or Home
```

**Secondary flows:**
```
Home → Create Agent → (agent saved) → Lobby
Shareable link → /agent/:id → Lobby
Home → History → HistoryDetail
```

**Navigation rules:**
- Session requires a brand in context — direct URL redirects to Home
- Summary requires a transcript in context — direct URL redirects to Lobby
- Browser back from an active Session is blocked (useBlocker); surfaces end confirmation

---

## Visual Tone Direction

**Reference:** ElevenLabs (color restraint) × Linear (dark mode precision) × Luma AI (atmospheric gradients)

- **Background:** Deep near-black with violet undertone (`#07060F`–`#0E0C1A`) — full-bleed, atmospheric radial gradient overlay
- **Surfaces:** Glass — `rgba(255,255,255,0.04–0.08)` + `1px solid rgba(255,255,255,0.08)` + `backdrop-filter: blur(12–16px)`
- **Accent:** Aurora gradient — violet → indigo → blue → cyan — for CTAs, glows, and brand highlights
- **Text:** `#F2F0FF` primary; opacity variants for secondary (60%) and muted (30–40%)
- **Brand colors:** Each agent has its own gradient pair (e.g. Rajah: burgundy, Jollibee: red, Globe: blue); applied to avatar, rings, card borders
- **Motion:** Meaningful, not decorative. State changes animate (200–300ms); voice states breathe and pulse (1.8–4s cycles)
- **Typography:** Space Grotesk (display, brand text, agent names, CTAs) + Inter (all UI text, transcript). Never a single font throughout.
- **Spatial grammar:** Centered focal element (avatar) in upper zone. Transcript in scrollable middle zone. Controls docked at bottom. Generous vertical padding with safe area compliance.

---

## Screen Specifications

---

### Screen 1 — Home
**PRD feature:** F1
**Route:** `/`
**Purpose:** Entry point. Agent discovery and selection. Create new agent.

**Layout zones (top to bottom):**
1. **Product header** — "Auralis" wordmark (top-left) + History icon link (top-right)
2. **Demo agents section** — "Try a demo" label + agent cards (3 pre-built brands)
3. **Your agents section** — shown only if user has created agents; swipeable cards with delete action
4. **Create CTA** — "Create your agent" — full-width or prominent, navigates to `/create`

**Agent card anatomy:**
- Agent avatar (circular, brand gradient, agent initial or photo)
- Agent name (Space Grotesk, semibold)
- Role line: `{brandName} · {agentRole}` (muted, truncated)
- Chevron right

**States:**
- `default` — demo agents always shown; custom agents section appears if any exist
- `empty-custom` — no custom agents; create CTA is the primary call to action

**Interactions:**
- Tap agent card → sets selectedBrand in context → navigate to `/lobby`
- Tap "Create your agent" → navigate to `/create`
- Swipe left on custom agent card → reveal delete action
- Tap history icon → navigate to `/history`

---

### Screen 2 — CreateAgent
**PRD feature:** F2
**Route:** `/create`
**Purpose:** Turn any website URL into a deployed voice agent.

**Layout zones:**
1. **Header** — back button (top-left) + screen title
2. **URL input** — full-width text input, "Website URL" label, `https://...` placeholder
3. **Build CTA** — "Build agent" — triggers crawl pipeline
4. **Progress states** — sequential loading indicators during crawl → enrich → generate
5. **Review panel** — generated agent preview: name, role, brand, avatar, conversation starters
6. **Save CTA** — "Save agent" — saves to localStorage, navigates to Lobby

**States:**
- `idle` — URL input form, empty
- `crawling` — "Crawling your site…" progress indicator
- `enriching` — "Enriching knowledge base…"
- `generating` — "Building your agent…"
- `review` — generated agent card shown; user can save or discard
- `error` — "Couldn't build an agent from that URL." with retry option

**Interactions:**
- Submit URL → fires crawl + enrich + generate pipeline sequentially
- Review → Save → agent added to agentStore (localStorage), selectedBrand set → navigate to `/lobby`
- Error → shows retry option; back button always available

---

### Screen 3 — Lobby
**PRD feature:** F3
**Route:** `/lobby`
**Purpose:** Introduce the agent. Establish trust. Prime for voice conversation before mic permission fires.

**Layout zones (top to bottom):**
1. **Brand header** — brand logo/wordmark (top-left) + back button (top-right, optional for demo brands)
2. **Agent identity block** — centered:
   - Agent avatar (circular, brand gradient, photo if available, initial fallback)
   - Outer glow ring (brand color, low opacity)
   - Agent name (Space Grotesk, large)
   - Role line: `{agentRole} · {brandName}`
   - Availability indicator: green dot + "Available now"
3. **Conversation starters** — 3 example questions, muted italic, non-interactive (visual context only)
4. **CTA** — full-width: "Talk to {agentName}"
5. **Mic note** — micro-copy below CTA: "Tap to start · microphone required"
6. **Knowledge base button** — icon button (top-right of identity block or near CTA); opens bottom sheet with system prompt context

**States:**
- `default` — ready to connect; knowledge sheet closed
- `knowledge-open` — info sheet expanded showing agent's knowledge and topic scope

**Interactions:**
- "Talk to {agentName}" → triggers browser mic permission → on grant, navigate to `/session`
- Knowledge base button → toggles info sheet
- Back button (demo brands) → clear selectedBrand → navigate to `/`

---

### Screen 4 — Session
**PRD features:** F4, F5, F6
**Route:** `/session`
**Purpose:** Live voice conversation. Agent visual + real-time transcript + session controls.

**Layout zones (top to bottom):**
1. **Session header** — slim bar: brand mark (left) + "End" text button (right, always visible)
2. **Agent visual zone** — upper ~35% of viewport:
   - Agent avatar (same as Lobby, larger variant)
   - State-driven animation (see states below)
   - State label: small text below avatar
3. **Transcript zone** — middle ~50% of viewport, scrollable:
   - Each turn is a message bubble
   - Agent turns: left-aligned, glass surface bubble, agent avatar dot + name label, cream text
   - User turns: right-aligned, darker surface bubble, "You" label, cream text
   - In-progress agent turn: streaming animation (bouncing dots) until complete
   - Auto-scrolls to latest; user can scroll up freely; auto-scroll resumes after 3s inactivity
4. **Controls dock** — bottom ~15%, fixed:
   - Mute toggle (icon button, left) — mic/mic-off icon
   - "End" (text button or icon, right)

**Conversation states:**

| State | Avatar animation | Label |
|---|---|---|
| Connecting | Slow pulse, dimmed | "Connecting…" |
| Listening | Gentle breathing ring | "Listening" |
| User speaking | Fast ring pulse, blue ring | "Hearing you…" |
| Agent speaking | 3 staggered expanding rings (brand color) | "{agentName} is speaking" |
| Muted | Dims avatar, badge overlay | "Muted" |
| Error | Red background tint, "!" initial | Human-readable error message |

**Error state:**
- Avatar dims to red tint, initial changes to "!"
- Error message replaces state label
- Two actions: "Try Again" (re-initiates session) and "End" (goes to summary with whatever transcript exists)

**End confirmation:**
- Inline prompt (not a full modal): "End this conversation?"
- "Yes, end" / "Keep talking"
- Prevents accidental taps; keeps it minimal

**Interactions:**
- Barge-in: handled by Gemini Live VAD — no UI interaction required
- Mute: toggles mic capture off/on; avatar dims; label shows "Muted"
- "End" tap → shows inline confirmation → on confirm: closes session, navigate to `/summary`
- Browser back → blocked by useBlocker → surfaces end confirmation dialog

---

### Screen 5 — Summary
**PRD feature:** F7
**Route:** `/summary`
**Purpose:** Confirm session ended. Show full transcript. Offer restart.

**Layout zones (top to bottom):**
1. **Session end header** — brand mark + "Conversation ended" subtitle
2. **Error note** — shown only if session ended with error: "Session ended due to a connection issue."
3. **Transcript readback** — full scrollable conversation, same bubble style as Session (static, read-only)
   - Timestamp on each turn (duration into call format: `M:SS`)
4. **Actions** — bottom, fixed:
   - Primary: "Talk to {agentName} Again" — clears session state, navigate to `/lobby`
   - Secondary: "Back to Home" — navigate to `/`

**States:**
- `default` — transcript present
- `empty` — session ended before any turns: "Nothing was captured in this conversation."
- `error-ended` — same layout + error note above transcript

---

### Screen 6 — History
**PRD feature:** F8
**Route:** `/history`
**Purpose:** Browse all saved sessions.

**Layout zones:**
1. **Header** — back button + "History" title
2. **Session list** — chronological list of completed sessions
   - Each card: agent name + brand, date, duration
3. **Empty state** — "No conversations yet."

**Interactions:**
- Tap session → navigate to `/history/:id`
- Back → navigate to previous screen

---

### Screen 7 — HistoryDetail
**PRD feature:** F8
**Route:** `/history/:id`
**Purpose:** Full replay of a completed session with AI summary.

**Layout zones:**
1. **Header** — back button + agent name
2. **Session metadata** — date + total duration
3. **AI Summary** — generated summary of the conversation (collapsible or always visible)
4. **Transcript** — static read-only transcript with speaker labels and timestamps

---

## Core Interaction Loop

```
[User speaks]
     ↓
[VAD detects speech — state: User speaking]
     ↓
[Audio streams to Gemini Live]
     ↓
[Gemini processes — state: Listening (brief)]
     ↓
[Agent audio streams back — state: Agent speaking]
[Transcript appends simultaneously]
     ↓
[Agent finishes turn — state: Listening]
     ↓
[User can speak again or barge in at any point]
```

Barge-in:
```
[Agent speaking]
     ↓
[User begins speaking]
     ↓
[Gemini VAD interrupts — state: User speaking]
[Agent audio stops]
     ↓
[Normal loop resumes]
```

---

## States Summary

| Screen | States |
|---|---|
| Home | Default, empty-custom |
| CreateAgent | Idle, crawling, enriching, generating, review, error |
| Lobby | Default, knowledge-open |
| Session | Connecting, Listening, User speaking, Agent speaking, Muted (overlay), Error |
| Summary | Default, empty, error-ended |
| History | Default, empty |
| HistoryDetail | Default |
