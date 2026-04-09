# Auralis — Product Brief

## Primary Users

**The business (deploying brand)**
A customer-facing company — travel agency, hospitality brand, retail service, telco — that wants to deploy a branded voice support agent without a six-month integration project. They define the persona, the knowledge base, and the behavioral guardrails. They do not need to be technical — Auralis can build the agent from a URL.

**The end customer (voice caller)**
A consumer visiting a brand's site or app who has a question or wants help. They are not thinking about AI — they want their question answered. They will tolerate a lot from a human voice that feels competent and warm; they will abandon immediately if they sense they're being stalled or scripted.

---

## Problem

Customer support in 2026 is still painful in ways that feel unacceptable given available technology.

Live agents are expensive, inconsistent, and capped at business hours. Chat widgets are low-resolution — most are FAQ glorified with a text box, and customers know it. Voice IVR systems are despised universally. Every existing voice AI platform stops at the API layer and leaves the consumer-facing experience completely unaddressed.

The deeper problem is not operational — it is experiential. Every support touchpoint signals to the customer how much the brand values their time. A bad support experience is a brand damage event, not just a cost line.

---

## Promise

Auralis gives any brand a voice — a real one.

A conversational AI agent that sounds like a person, thinks like a specialist, operates inside strict brand guardrails, and can be live on the brand's site within days. Customers ask questions by voice and get answers by voice. No hold time. No transfer. No scripted dead ends. Just a warm, intelligent conversation that resolves the issue and reflects well on the brand.

For the business: lower support cost, higher customer satisfaction, 24/7 coverage, full brand control.
For the customer: the fastest, most natural support experience available.

---

## Positioning

**One sentence:**
Auralis is the voice AI platform that lets any brand deploy a human-quality support agent — branded, intelligent, and live — in minutes, not months.

**Category frame:**
This is not a chatbot. It is not a phone system. It is a deployable voice presence. The closest analog is hiring a very good support agent who never sleeps, never goes off-script, and scales to every customer simultaneously.

---

## What the Platform Includes

**Pre-built demo agents (3 brands)**
Working voice agents built on real Philippine brands, demonstrating the full Auralis experience out of the box:
- **Rajah Travel / Rayah** — Europe tour packages and travel consulting for Filipino travelers
- **Jollibee / Joy** — Menu, ordering, delivery, and customer experience
- **Globe Telecom / Glenda** — Plans, billing, connectivity, and technical support

**Self-serve agent creation**
Any user can paste a website URL and generate a custom branded agent:
1. Auralis crawls the URL and extracts knowledge
2. Enriches the knowledge base via web search
3. Generates a system prompt with persona, role, guardrails, and brand tone
4. Creates a shareable agent link

**Session history**
Completed conversations are saved locally with full transcripts, timestamps, and AI-generated summaries. Users can review past sessions and replay transcripts.

---

## MVP Boundaries

### In scope
- Gemini Live API integration (audio-to-audio, real-time, full-duplex)
- 3 pre-built brand personas with real knowledge bases
- URL-to-agent creation flow (web crawl + enrichment)
- Shareable agent links via KV storage
- Voice input via browser microphone
- Audio output (HD voice)
- Live transcript synchronized with voice
- System prompt with persona definition and topic guardrails
- Session history with transcript readback and AI summaries
- Premium mobile-first UI
- Deployed to Vercel as a public URL

### Out of scope
- Operator dashboard or configuration interface
- User authentication or accounts
- Booking or CRM integrations
- Admin analytics
- Accessibility compliance (WCAG)
- Native mobile app
- Multi-language support

---

## Key Assumptions

1. Gemini Live API latency and voice quality are convincing enough to demo without post-processing.
2. Browser mic access is reliable in controlled demo environments.
3. System prompt guardrails are sufficient for topic control at prototype stage — no RAG or fine-tuning needed.
4. Mobile web is the right delivery format — shareable by URL, no install friction.
5. Web crawling produces sufficient knowledge base depth for a useful agent without manual curation.
