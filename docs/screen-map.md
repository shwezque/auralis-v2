# Screen Map — Auralis

**Version:** 0.2
**Date:** 2026-03-31

---

## Screen Inventory

| # | Screen | Route | PRD Feature | Entry condition |
|---|---|---|---|---|
| S1 | Home | `/` | F1 | Always — default entry point |
| S2 | CreateAgent | `/create` | F2 | From Home "Create your agent" CTA |
| S3 | BrandPicker | `/demos` | — | Legacy demo picker (direct URL) |
| S4 | AgentRoute | `/agent/:id` | F9 | Shareable link |
| S5 | Lobby | `/lobby` | F3 | Agent selected from Home, BrandPicker, or AgentRoute |
| S6 | Session | `/session` | F4, F5, F6 | Mic permission granted from Lobby |
| S7 | Summary | `/summary` | F7 | Session ended (any reason) |
| S8 | History | `/history` | F8 | From Home nav or Summary |
| S9 | HistoryDetail | `/history/:id` | F8 | From History list |

---

## Flow Diagram

```
[App Load]
    │
    └──→ [S1: Home]
              │
    ┌─────────┼──────────────────────┐
    │         │                      │
"Create    Tap demo              Tap "Your
 agent"    brand/agent          agents" item
    │         │                      │
    ▼         │                      │
[S2: CreateAgent]                    │
    │         │                      │
    │         └──────────────────────┘
    │                    │
    │            [S5: Lobby]
    │                    │
    │         "Talk to {agent}" tapped
    │          mic permission granted
    │                    │
    │            [S6: Session]
    │                    │
    │         ┌──────────┴──────────┐
    │    "End" tapped          error occurs
    │         │                      │
    │         └──────────┬──────────┘
    │                    │
    │            [S7: Summary]
    │                    │
    │        ┌───────────┴───────────┐
    │   "Talk again"          "Back to Home"
    │        │                       │
    │    [S5: Lobby]            [S1: Home]
    │
    └──→ [S8: History]
              │
         Tap session
              │
         [S9: HistoryDetail]

[Shareable link] → [S4: AgentRoute] → [S5: Lobby]
```

---

## Screen-to-Feature Mapping

| PRD Feature | Screen(s) | Notes |
|---|---|---|
| F1 — Home / Agent Picker | S1 | Demo brands + user-created agents + create CTA |
| F2 — Agent Creation | S2 | URL input → crawl → enrich → generate → save |
| F3 — Pre-Call Lobby | S5 | Agent intro, conversation starters, knowledge base sheet |
| F4 — Live Voice Conversation | S6 | Full-duplex audio via Gemini Live |
| F5 — Real-Time Transcript | S6 | Rendered inside Session, both speaker turns |
| F6 — Conversation State Indicators | S6 | Avatar animation + state label |
| F7 — Session End + Transcript Readback | S6 (End button) + S7 | S6 triggers end; S7 displays result |
| F8 — Session History | S8 + S9 | S8 lists sessions; S9 shows transcript + summary |
| F9 — Shareable Agent Links | S4 | KV lookup → loads agent → routes to S5 |

---

## State Inventory per Screen

### S1 — Home
- `default` — shows demo brands + user-created agents (if any)
- `empty-custom` — no user-created agents; shows create prompt

### S2 — CreateAgent
- `idle` — URL input form
- `crawling` — fetching and extracting page content
- `enriching` — web search enrichment in progress
- `generating` — building agent config
- `review` — generated agent shown for user confirmation
- `error` — crawl or generation failed

### S5 — Lobby
- `default` — ready to connect, knowledge base sheet closed
- `knowledge-open` — system prompt info sheet expanded

### S6 — Session
- `connecting` — session initializing
- `listening` — idle, mic active, waiting for speech
- `user-speaking` — VAD detected user input
- `agent-speaking` — agent audio streaming
- `muted` — mic capture paused (overlay on any active state)
- `error` — connection lost or API error

### S7 — Summary
- `default` — transcript present
- `empty` — session ended with no turns captured

### S8 — History
- `default` — list of past sessions
- `empty` — no sessions saved yet

### S9 — HistoryDetail
- `default` — transcript + AI-generated summary

---

## Navigation Rules

- **S1 → S2:** "Create your agent" CTA
- **S1 → S5:** Tap any agent card (demo or user-created)
- **S2 → S5:** Agent saved; routes to Lobby for new agent
- **S4 → S5:** KV lookup resolves agent; routes to Lobby
- **S5 → S6:** After mic permission granted
- **S6 → S7:** On explicit "End" confirmation OR unrecoverable error
- **S7 → S5:** "Talk to {agentName} Again" — clears session state
- **S7 → S1:** "Back to Home"
- **S1/S7 → S8:** History nav link
- **S8 → S9:** Tap session in list
- **Direct URL to S6:** Redirect to S5 if no active session
- **Direct URL to S7:** Redirect to S5 if no transcript in state
