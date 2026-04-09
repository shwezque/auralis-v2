# PRD — Auralis Voice AI Platform

**Version:** 0.2 — Current Build
**Date:** 2026-03-31
**Status:** Active

---

## 1. Target User and Core Problem

The end user is a consumer visiting a brand's site who wants help — resolving an issue, comparing options, or getting a quick answer. They are not thinking about AI. They want to talk to someone competent and warm who can help them move forward.

Every existing support surface fails them the same way: chat widgets are generic and slow, IVR trees are disorienting, email is invisible. Voice AI can solve this — but every current platform stops at the API layer and leaves the consumer-facing experience completely unaddressed. No branded agent identity. No live transcript. No premium UI.

Auralis solves the consumer-facing layer. The platform ships with three pre-built demo agents on real Philippine brands, and a self-serve creation flow that turns any website URL into a deployed voice agent.

---

## 2. Features

### F1 — Home Screen / Agent Picker

The default entry point. Shows pre-built demo agents and any user-created agents. Primary CTA creates a new agent.

**Acceptance criteria**
- Pre-built demo agents (Rajah Travel/Rayah, Jollibee/Joy, Globe Telecom/Glenda) are displayed and selectable
- User-created agents appear in a separate "Your agents" section; persisted in localStorage
- User-created agents can be deleted via swipe-to-reveal delete action
- Tapping any agent navigates to its Lobby
- "Create your agent" CTA navigates to /create

---

### F2 — Agent Creation (URL → Agent)

User pastes any website URL; the system crawls the page, enriches the knowledge via web search, and generates a full agent configuration.

**Acceptance criteria**
- User enters a URL and submits; system crawls the page and extracts content
- Enrichment via web search fills in gaps and adds depth to the knowledge base
- A full agent config is generated: name, role, brand, color, starters, system prompt
- User can review the generated agent before saving
- Saved agent appears in the "Your agents" list on Home
- Agent gets a shareable link via KV storage (accessible at /agent/:id)
- Invalid URL or crawl failure shows a human-readable error

---

### F3 — Pre-Call Lobby Screen

A full-viewport screen introducing the agent before the microphone permission prompt fires.

**Acceptance criteria**
- Screen displays agent name, role, brand, and a single "Talk to {agentName}" CTA
- Availability indicator ("Available now") is shown
- 3 conversation starters are shown as muted, non-interactive examples
- A knowledge base info sheet is accessible (reveals system prompt context)
- Browser mic permission prompt does not fire before the user taps the CTA
- Layout is unbroken on a 390px viewport (iPhone 14 width)

---

### F4 — Live Voice Conversation

Full-duplex voice session between the user and the agent via Gemini Live API.

**Acceptance criteria**
- Agent audio response plays back within 2 seconds of session start after mic permission is granted
- Barge-in is active: user can speak while the agent is speaking and the agent stops
- Invalid API key or connection failure shows a human-readable error message, not a blank or frozen screen

---

### F5 — Real-Time Transcript

Live scrolling transcript rendered on-screen during the session, attributed to each speaker.

**Acceptance criteria**
- Each turn is labeled ("You" or the agent name) and appended as it streams
- In-progress agent turns show a streaming animation (bouncing dots) until complete
- Transcript auto-scrolls to the latest entry; user can scroll up to review without the view snapping back mid-read
- Transcript is visible during the active session — no separate tap or mode switch required

---

### F6 — Conversation State Indicators

Persistent visual indicator showing the current session state at all times.

**Acceptance criteria**
- Five states display and transition correctly: Connecting / Listening / Hearing you / {Agent} is speaking / Error
- Avatar animation changes per state: breathing ring (listening), fast pulse (user speaking), expanding rings (agent speaking), red tint (error)
- Muted state overlays on any active state with a visible badge
- Error state shows a specific non-technical message and a recovery action (retry or end)

---

### F7 — Session End and Transcript Readback

Clean end-of-session flow that confirms the conversation is over and shows the full transcript.

**Acceptance criteria**
- "End" button is accessible at all times during an active session
- Tapping "End" shows an inline confirmation ("End this conversation?" / "Yes, end" / "Keep talking")
- After ending, user sees the full session transcript in a scrollable view with speaker labels and timestamps
- "Talk to {agentName} Again" returns the user to the Lobby with clean session state
- "Back to Home" navigates to the Home screen

---

### F8 — Session History

All completed sessions are saved locally and browsable across conversations.

**Acceptance criteria**
- Completed sessions are saved to localStorage with transcript, timestamps, agent info, and duration
- History screen shows a list of past sessions with agent name, date, and duration
- Tapping a session shows the full transcript in a read-only replay view
- Each session detail view shows an AI-generated summary of the conversation
- Sessions persist across page refreshes

---

### F9 — Shareable Agent Links

User-created agents can be shared via a public URL that loads the agent directly.

**Acceptance criteria**
- Each created agent gets a unique ID stored in KV
- Navigating to /agent/:id loads the agent config and routes to its Lobby
- Shared link works for anyone with the URL — no account required

---

## 3. Non-Goals

- **Multi-agent routing** — each brand has one agent; no escalation or handoff layer
- **Server-side session infrastructure** — no database, no session persistence server-side
- **Authentication or user accounts** — no login, no persistent identity across devices
- **Admin dashboard or analytics** — no call logs, usage metrics, or operator config UI
- **Booking or transaction functionality** — agents answer questions; they do not complete bookings or integrate with CRMs
- **Non-English language support** — English only (agents respond in user's language by convention, but no formal i18n)
- **Native mobile app** — mobile web only
- **Accessibility audit** — WCAG compliance is post-validation
- **Widget or embeddable mode** — full-viewport only

---

## 4. Routes

| Route | Screen | Entry condition |
|---|---|---|
| `/` | Home | Always |
| `/create` | CreateAgent | From Home CTA |
| `/demos` | BrandPicker | Legacy demo picker |
| `/agent/:id` | AgentRoute | Shareable link |
| `/lobby` | Lobby | Agent selected |
| `/session` | Session | Mic permission granted |
| `/summary` | Summary | Session ended |
| `/history` | History | From Home or Summary |
| `/history/:id` | HistoryDetail | From History list |
