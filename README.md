# Auralis v2

Multi-brand voice AI agent platform with self-serve creation. Any brand can deploy a voice agent in minutes by pasting a URL — no integration project, no API setup.

## Overview

Auralis v2 extends the original pilot into a full self-serve platform. The core insight: existing voice AI tools (Bland, Vapi, Retell) stop at the API layer. Auralis owns the consumer-facing layer — persona design, guardrails, brand control, premium UI, and a zero-setup creation flow.

## Features

- **Self-serve agent creation** — URL input → site crawl → knowledge extraction → system prompt generation → shareable link
- **Full-duplex voice sessions** — Real-time audio via Gemini Live, sub-second latency
- **Live transcript** — Streaming conversation visible to the user during the session
- **Named personas** — Each agent has a name, avatar, and brand voice distinct from generic AI
- **Conversation starters** — Pre-call lobby surfaces suggested topics from the knowledge base
- **Session history** — Transcripts and AI-generated summaries persisted locally
- **Shareable links** — Generated agents accessible at `/agent/:id`

## Tech Stack

- React 18 + React Router 7 + Vite
- Tailwind CSS (dark/glass design system)
- Google Gemini Live API
- Cheerio (web crawler)
- Redis KV (agent persistence)
- Vercel (deployment)

## Routes

| Route | Description |
|---|---|
| `/` | Home — browse demo brands and created agents |
| `/create` | Self-serve agent creation from URL |
| `/agent/:id` | Agent entry point (shareable) |
| `/lobby` | Pre-call lobby with knowledge preview |
| `/session` | Live voice session |
| `/summary` | Post-session transcript |
| `/history` | Session history list |
| `/history/:id` | Individual transcript view |

## Setup

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY and REDIS_URL to .env.local
npm run dev
```
