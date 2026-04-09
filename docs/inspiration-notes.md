# Inspiration Notes — Auralis Voice AI Platform

**Date:** 2026-03-29
**Purpose:** Synthesize research findings into actionable design and product decisions for the Auralis prototype (Lumia Journeys / Aria pilot)

---

## 1. Table Stakes

These patterns appear across three or more reference products and must be present to be credible.

**Real-time, low-latency voice response**
Sub-700ms end-to-end response is the baseline consumer expectation, set by ChatGPT Voice and matched by Vapi and Retell. Any perceptible pause longer than ~1 second breaks the conversational illusion. Gemini Live API's native audio-to-audio architecture is the right foundation — do not introduce STT/LLM/TTS pipeline latency on top of it.

**Barge-in / interruption handling**
Users expect to speak while the agent is speaking. An agent that forces the user to wait sounds like a 2015 IVR. This must be active by default.

**Conversation transcript**
Every consumer-facing AI interface surfaces a readable transcript. Voice alone is not sufficient — users need text to verify, re-read, and trust. Aria must show a live scrolling transcript during and after the conversation.

**Named agent identity**
Anonymous voice experiences feel like spam calls. "Aria from Lumia Journeys" should be visible before the user speaks a word.

**Clear microphone state indicators**
Users need to know what the system is doing at all times: idle, listening, thinking, speaking, call ended. Unclear state is the biggest source of voice UI abandonment.

---

## 2. Differentiators

**Live consumer-facing transcript (not just operator dashboard)**
No direct competitor ships a real-time scrolling transcript visible to the end customer during the voice call. ChatGPT Voice does it post-conversation; Auralis does it live. This is a trust signal, an accessibility feature, and a visual design element that fills the screen purposefully.

**A fully branded agent persona**
Competitors offer voice selection and a logo color. None build the concept of a named agent character into the consumer UI meaningfully. Aria should have: a name, a visual identity, a voice consistent with the brand, and copy that matches the brand's tone. This transforms "AI voice widget" into "Lumia Journeys' concierge."

**Premium ambient visual environment**
The default for every competitor is a white or grey widget on whatever the host site looks like. Auralis takes over the full screen with a designed environment — rich background, ambient motion — that communicates brand and experience quality before the user says a word.

**Warm pre-call lobby screen**
A designed "lobby" screen for Aria communicates "a competent, friendly person is ready" rather than "press button to connect to AI." No competitor has this.

---

## 3. UX Patterns Worth Stealing

**Animated ambient state indicator (ChatGPT Voice orb)**
The morphing, breathing orb that represents AI state (listening, thinking, speaking) is a learned pattern. Adapt it — not a generic orb, but a centrally placed animated element tied to Aria's identity that changes behavior by state.

**One focal element + transcript below (Typeform spatial grammar)**
Centered, single-focus layout with generous whitespace feels premium in a conversation context. Aria's agent visual takes the upper ~35% of the screen; the live transcript scrolls in the lower ~60%. No sidebars, no navigation during the active call.

**Named agent + availability line + CTA on the pre-call screen (Intercom)**
Pre-call screen template: Aria's name, a short positioning line ("Aria can help you plan your trip, explore destinations, or get answers before you book"), and a large tap-to-speak button.

**Post-conversation transcript readback (ChatGPT Voice)**
After the call ends, show the full conversation as a readable transcript. Gives users a record, reduces anxiety, and creates a natural re-engagement moment.

**Deep color + slow ambient motion for audio-active states (Calm)**
While Aria is speaking, the background does something subtle: a slow gradient shift, a soft breathing pulse. Communicates "live audio is active" without aggressive waveforms.

**Mute and end-call controls visible but not dominant**
Persistent at the bottom but sized so they do not dominate — the transcript and agent visual are the primary content.

---

## 4. Anti-Patterns to Avoid

**Generic waveform as the only visual**
A grey audio waveform bar communicates "dev tool," not "premium support experience." If waveform is used at all, it must be styled, colored, and subordinate to the agent identity visual.

**Unbranded floating button widget**
A small floating circle in the corner says "we are a plugin on someone else's site." Full-screen mobile web means the experience is native to Lumia Journeys, not pasted on top of it.

**Visually static processing states**
A dead zone where the UI goes static while the LLM generates a response breaks the conversational illusion. Always show a subtle animation — even a slow breathing pulse — while the system is thinking.

**Dense transcript blocks**
A live transcript that pushes new text aggressively or shows wall-of-text speech becomes unreadable during conversation. Auto-scroll, show the most recent utterance prominently, and visually distinguish speaker turns (alignment, color, or label).

**No context before the mic permission dialog fires**
The user must be primed for why they are about to grant microphone access. The pre-call screen (lobby) must make clear they are starting a voice conversation before the browser permission prompt fires.

**Generic AI voice without named persona**
No name, no avatar, no brand identity = a bot. Named persona + consistent voice + visual identity is what separates a support product from an IVR replacement.

---

## 5. Visual Direction

The Auralis UI for the Lumia Journeys pilot should read as: **premium travel concierge, warm and trustworthy, ambient and calm — not tech-product-grey.**

**Color palette**
- Deep navy or midnight blue as the dominant background (reference: Calm's night mode, not a white SaaS card). Communicates trust, premium, and safety.
- Warm accent — soft gold, amber — for the agent name, CTA button, and active state highlight. Travel luxury visual language — not neon, not clinical blue.
- Transcript text on a dark surface with high contrast.

**Motion**
- Slow (3–5 second cycles), low amplitude ambient motion. Nearly imperceptible when focused on the transcript.
- Agent state animation (listening vs. speaking) should be clearly different but not jarring — a soft pulsing ring that expands when Aria speaks, contracts when listening.

**Typography**
- Humanist or geometric sans-serif with generous line height for the transcript.
- Slightly warmer treatment for Aria's name and greeting — not a generic system font.
- Avoid condensed or ultra-light weights — they read cold and tech-forward, not warm and concierge.

**Spatial grammar**
- Full-bleed viewport. No white card on grey background. The entire screen is the experience.
- Aria's visual identity centered in the upper 35–40% of the screen.
- Transcript in a scrolling region in the lower 55%, with controls docked at the very bottom.

---

## 6. Recommended Directions

**Decision 1: Full viewport mobile experience, not a widget.**
Every direct competitor defaults to a small widget on a third-party page. For the Lumia Journeys pilot, own the full screen. The user opens a dedicated page and the entire viewport becomes Aria's environment. This is the only design approach consistent with a "branded voice concierge" — a widget will always look like a plugin.

**Decision 2: Make the live transcript the primary content surface.**
The transcript should occupy the majority of the active call screen and update in near-real time. It is not a log shown after the fact — it is the visual anchor of the conversation. Agent turns left-aligned (or centered) in a warm color; user turns right-aligned in a secondary style. Auto-scroll to the most recent turn. This differentiates Auralis from every competitor.

**Decision 3: Design a named pre-call lobby screen that establishes Aria's identity before the user taps to speak.**
Do not send the user directly into a live audio session. A pre-call screen with Aria's avatar, her name, a one-line positioning statement, and a large "Talk to Aria" CTA establishes trust before the browser mic permission fires. Model it on Intercom's messenger home screen grammar, but with Calm's deep ambient visual treatment. The lobby screen is where "this is going to be a good experience" is communicated — or not.
