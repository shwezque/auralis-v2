# Copy Deck — Auralis

**Version:** 0.2
**Date:** 2026-03-31
**Tone:** Warm, confident, premium. Concierge-level — knowledgeable specialist, not a chatbot.
**Note:** All agent names, brand names, and roles are dynamic. Copy samples use {agentName} and {brandName} as placeholders.

---

## Brand Voice Rules

- **Speak like a trusted specialist** — specific, warm, never generic
- **No robotic UI language** — never "Please enter," "Submit," "Processing your request"
- **No AI self-reference** — agents are named specialists. Full stop.
- **Contractions always** — "we'll" not "we will," "you're" not "you are"
- **Short over long** — if it can be said in four words, don't use eight
- **Confident over hedging** — no "might," "try to," "hopefully"
- **Dynamic over hardcoded** — never hardcode an agent or brand name in copy

---

## Screen 1 — Home

### Product wordmark
```
Auralis
```

### Demo section label
```
Try a demo
```

### Agent card format
```
{agentName}
{brandName} · {agentRole}
```

### Create CTA
```
Create your agent
```

### Your agents section label
```
Your agents
```

---

## Screen 2 — CreateAgent

### Screen heading
```
Build your agent
```

### URL input label
```
Website URL
```

### URL placeholder
```
https://yourbrand.com
```

### Submit CTA
```
Build agent
```

### Progress states
```
Crawling your site…
Enriching knowledge base…
Building your agent…
```

### Error state
```
Couldn't build an agent from that URL. Try a different page.
```

### Review CTA
```
Save agent
```

---

## Screen 3 — Lobby

### Agent identity block
- **Name:** `{agentName}`
- **Role line:** `{agentRole} · {brandName}`
- **Availability:** `Available now`

### Talk CTA
```
Talk to {agentName}
```

### Mic permission note
*(small, below CTA)*
```
Tap to start · microphone required
```

### Knowledge base sheet heading
```
{agentName}'s knowledge base
```

---

## Screen 4 — Session

### Session header
- Brand mark: `{brandName}`
- End button: `End`

### State labels (below avatar)

| State | Label |
|---|---|
| Connecting | `Connecting…` |
| Listening | `Listening` |
| User speaking | `Hearing you…` |
| Agent speaking | `{agentName} is speaking` |
| Muted (overlay) | `Muted` |

### Transcript speaker labels
- Agent turns: `{agentName}`
- User turns: `You`

### Transcript empty state
*(centered placeholder, before first turn)*
```
Your conversation will appear here.
```

### End confirmation
*(inline prompt, minimal)*

**Heading:**
```
End this conversation?
```

**Confirm:**
```
Yes, end
```

**Cancel:**
```
Keep talking
```

### Error messages

**Connection failed:**
```
Couldn't connect. Check your internet and try again.
```
*Action: `Try Again` · `End`*

**Connection lost mid-session:**
```
Connection lost. Check your internet and try again.
```
*Action: `Try Again` · `End`*

**Generic / unknown error:**
```
Something went wrong. Tap to try again.
```
*Action: `Try Again` · `End`*

**Mic permission denied:**
```
Microphone access is required to talk to {agentName}.
Please allow mic access in your browser settings.
```
*Action: `End`*

---

## Screen 5 — Summary

### Header
- Brand mark: `{brandName}`
- Screen subtitle: `Conversation ended`

### Transcript section label
```
Your conversation with {agentName}
```

### Empty transcript state
*(if session ended before any turns)*
```
Nothing was captured in this conversation.
```

### Restart CTA (primary)
```
Talk to {agentName} Again
```

### Back link (secondary)
```
Back to Home
```

---

## Screen 6 — History

### Screen heading
```
History
```

### Empty state
```
No conversations yet. Start talking to see your history here.
```

---

## Screen 7 — HistoryDetail

### Summary section label
```
Summary
```

### Transcript section label
```
Transcript
```

---

## Agent System Prompt Voice Guidelines
*(For reference when reviewing or updating system prompts in `src/lib/brands.js` or generated agents)*

Agent spoken responses should always:

- Open with warmth and usefulness, not a preamble ("Oh, that's a great choice — the Best of Europe tour covers 14 countries…" not "Sure, I can help you with that.")
- Match the user's energy — excited customer gets excited agent; methodical customer gets precise agent
- Keep turns short — this is voice, not email. Two to four sentences per turn maximum.
- Never start a response with "I" — it sounds robotic
- Never use lists — flow through information in natural spoken sentences
- Redirect off-topic questions warmly: *"That's a bit outside my area — but if you've got a question about [topic], I'm exactly the right person."*
- Respond in the language the user is speaking — switch mid-conversation if they do
- Never invent specific prices, dates, or availability — acknowledge uncertainty and direct to confirmation
