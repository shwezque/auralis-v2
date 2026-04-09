# Content Map — Auralis

**Version:** 0.2
**Date:** 2026-03-31
**Content is dynamic — agent names, roles, brands, and starters are driven by agent config, not hardcoded**

---

## Content Categories

### 1. Brand Identity

Auralis ships with three pre-built demo agents. User-created agents generate their own identity from the source URL.

| Brand | Agent Name | Agent Role | Tagline |
|---|---|---|---|
| Rajah Travel | Rayah | Travel Consultant | Europe tours & packages from the Philippines |
| Jollibee | Joy | Customer Experience | Orders, menu, delivery & more |
| Globe Telecom | Glenda | Customer Care | Plans, billing, connectivity & support |

User-created agents: name, role, brand, and starters are generated from the crawled website.

---

### 2. Home Screen (S1)

| Item | Type | Notes |
|---|---|---|
| Product wordmark | UI text | "Auralis" |
| Section label — demos | Section header | Pre-built demo agents |
| Section label — custom | Section header | "Your agents" (only shown if user has created agents) |
| Agent card: name | UI text | Dynamic — from agent config |
| Agent card: role line | UI text | Dynamic — "{brandName} · {agentRole}" |
| Create agent CTA | Button label | Primary action |
| History nav link | Link | Navigates to /history |

---

### 3. CreateAgent Screen (S2)

| Item | Type | Notes |
|---|---|---|
| Screen heading | Heading | Agent creation framing |
| URL input label | Form label | Website URL prompt |
| URL placeholder | Input placeholder | "https://..." |
| Submit CTA | Button label | Initiates crawl |
| Progress states | Status text | Crawling / Enriching / Generating |
| Review: agent name | UI text | Generated — editable |
| Review: agent role | UI text | Generated |
| Review: conversation starters | UI text | Generated — 3 examples |
| Save CTA | Button label | Saves agent, navigates to Lobby |
| Error message | Error text | Human-readable crawl or generation failure |

---

### 4. Lobby Screen (S5)

| Item | Type | Notes |
|---|---|---|
| Brand logo / wordmark | UI image + text | Dynamic — from agent config |
| Agent name | UI text | Dynamic — from agent config |
| Agent role line | UI text | Dynamic — "{agentRole} · {brandName}" |
| Availability indicator | Status text | "Available now" |
| Conversation starters (×3) | Example copy | Dynamic — from agent config; muted italic, non-interactive |
| Talk CTA | Button label | "Talk to {agentName}" |
| Mic permission note | Micro-copy | "Tap to start · microphone required" |
| Knowledge base button | Icon button | Opens system prompt info sheet |
| Knowledge base sheet heading | Sheet header | Agent name + "Knowledge base" |

---

### 5. Session Screen (S6)

| Item | Type | Notes |
|---|---|---|
| Brand mark | UI text | Dynamic — from agent config |
| End button | Button label | Top-right header |
| State label: Connecting | Status text | Below avatar |
| State label: Listening | Status text | Below avatar |
| State label: User speaking | Status text | "Hearing you…" — below avatar |
| State label: Agent speaking | Status text | "{agentName} is speaking" — dynamic |
| State label: Muted | Status text | Overlay on active state |
| Transcript placeholder | Empty state | "Your conversation will appear here." |
| Transcript speaker label — agent | Label | Dynamic — agent name |
| Transcript speaker label — user | Label | "You" |
| End confirmation heading | Dialog copy | "End this conversation?" |
| End confirmation: confirm | Button label | "Yes, end" |
| End confirmation: cancel | Button label | "Keep talking" |
| Error: connection failed | Error message | Human-readable |
| Error: mic denied | Error message | Human-readable — references agent name dynamically |
| Retry action | Button label | In error state |

---

### 6. Summary Screen (S7)

| Item | Type | Notes |
|---|---|---|
| Brand mark | UI text | Dynamic — from agent config |
| Screen subtitle | Status text | "Conversation ended" |
| Transcript header | Section label | "Your conversation with {agentName}" — dynamic |
| Empty transcript message | Empty state | "Nothing was captured in this conversation." |
| Timestamp per turn | UI text | Duration format "m:ss" |
| Restart CTA | Button label | "Talk to {agentName} Again" — dynamic |
| Back to Home link | Link | "Back to Home" |

---

### 7. History Screen (S8)

| Item | Type | Notes |
|---|---|---|
| Screen heading | Heading | "History" or similar |
| Session card: agent name | UI text | Saved from session |
| Session card: date | UI text | Formatted date |
| Session card: duration | UI text | Total session length |
| Empty state | Empty state text | If no sessions saved |

---

### 8. HistoryDetail Screen (S9)

| Item | Type | Notes |
|---|---|---|
| Agent name | Heading | From saved session |
| Session date + duration | Metadata | From saved session |
| AI summary | Body copy | Generated post-session |
| Transcript readback | Static list | Speaker labels + timestamps |

---

### 9. Agent System Prompts

Each agent has a system prompt defining persona, knowledge domain, guardrails, and conversation style. Pre-built agents have hand-crafted prompts with real brand knowledge. User-created agents have AI-generated prompts from crawled content.

Key rules across all agents:
- Voice-first: no bullet points spoken aloud; 2-4 sentence turns
- Never start a response with "I"
- Respond in the language the user speaks
- Stay within topic scope; redirect off-topic queries warmly
- Do not invent prices, availability, or specific data not in the prompt

---

## Content Principles

1. **No placeholder text** — every string is real, representative, and on-brand
2. **Voice-first copy** — all UI strings should feel comfortable spoken aloud, not just readable on screen
3. **Warm but not chatty** — concierge tone: helpful, warm, precise. Not effusive or over-explanatory.
4. **No AI self-reference** — agents do not describe themselves as AI, chatbots, or language models in the UI
5. **Confidence over hedging** — avoid "try to," "might," "I'll do my best." Write for a system that works.
6. **Dynamic over hardcoded** — never hardcode an agent name or brand name in UI strings; always pull from agent config
