# Auralis Brand Book
**Version:** 1.0 — 2026-03-30

---

## 1. Brand Concept

**Name:** Auralis
**Tagline:** Voice intelligence, beautifully delivered.
**Category:** B2B voice AI infrastructure — consumer-facing layer

### What "Auralis" means

From *auris* (Latin: ear) + aurora borealis (the northern lights). The name captures two things the product does: it listens acutely (the ear), and it makes invisible signal visible as light (the aurora). Every voice conversation is a signal. Auralis visualizes it.

### Brand personality

| Dimension | Direction |
|---|---|
| Intelligence | Feels knowledgeable, never shows off |
| Warmth | Not clinical — present, attentive |
| Precision | Responds immediately, communicates clearly |
| Premium | Quality is felt, not announced |
| Futuristic | Slightly ahead of familiar, never alienating |

### What Auralis is NOT
- Not playful / chatbot-y
- Not enterprise-sterile
- Not neon-aggressive
- Not heavy or complex

---

## 2. Color System

### Platform palette

Auralis runs on a deep near-black canvas with an iridescent aurora gradient as its accent system. The gradient references both the name (aurora) and the sonic spectrum.

#### Dark surface tokens

| Token | Hex | Usage |
|---|---|---|
| `surface-950` | `#07060F` | Deepest base — full-bleed backgrounds |
| `surface-900` | `#0E0C1A` | Primary screen background |
| `surface-800` | `#141224` | Cards, panels |
| `surface-700` | `#1C1933` | Elevated cards, modals |
| `surface-600` | `#252142` | Interactive borders, hover states |
| `surface-500` | `#312D58` | Active borders, selected states |

#### Aurora accent gradient

The aurora is the singular brand expression. It runs violet → indigo → blue → cyan.

```
Aurora (standard): linear-gradient(135deg, #8B5CF6 0%, #6366F1 30%, #3B82F6 65%, #06B6D4 100%)
Aurora (vibrant):  linear-gradient(135deg, #A78BFA 0%, #818CF8 30%, #60A5FA 65%, #22D3EE 100%)
Aurora (CTA):      linear-gradient(135deg, #7C3AED, #2563EB)
Aurora (subtle):   linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))
```

Individual aurora stops (used for glows, individual accents):

| Name | Hex | Role |
|---|---|---|
| `aurora-violet` | `#8B5CF6` | Primary brand accent |
| `aurora-indigo` | `#6366F1` | Connecting state |
| `aurora-blue` | `#3B82F6` | User-speaking indicator |
| `aurora-cyan` | `#06B6D4` | Active/live indicator |

#### Text tokens

| Token | Value | Usage |
|---|---|---|
| Primary | `#F2F0FF` | Headlines, body text |
| Secondary | `rgba(242, 240, 255, 0.60)` | Subtitles, labels |
| Muted | `rgba(242, 240, 255, 0.30)` | Placeholder, hints |
| Disabled | `rgba(242, 240, 255, 0.15)` | Inactive states |

#### Functional colors

| Name | Hex | Usage |
|---|---|---|
| `status-green` | `#34D399` | Live/connected indicator |
| `status-red` | `#F87171` | Error, muted mic |
| `status-amber` | `#FBBF24` | Warning states |

#### Border & glass

```
border-subtle:  rgba(255, 255, 255, 0.07)
border-default: rgba(255, 255, 255, 0.10)
border-active:  rgba(139, 92, 246, 0.40)

glass surface:  rgba(255, 255, 255, 0.05) + backdrop-filter: blur(16px)
glass hover:    rgba(255, 255, 255, 0.08) + backdrop-filter: blur(16px)
```

### Brand color system (per-brand sessions)

Each brand brings its own accent palette into an Auralis session. The dark background makes every brand color sing — especially saturated reds, blues, and burgundy.

| Brand | Primary | Secondary | Agent | Note |
|---|---|---|---|---|
| Rajah Travel | `#8B1F52` | `#5A1235` | Aria | Burgundy/wine — elegance |
| Jollibee | `#E62020` | `#B71010` | Joy | Vivid red — energy |
| Globe Telecom | `#0066CC` | `#004499` | Gem | True blue — trust |

All brand sessions inherit the Auralis dark canvas. The brand color is expressed through the agent avatar gradient, button CTAs, and accent glows only — not the background.

---

## 3. Typography

### Font stack

| Role | Font | Weights | Usage |
|---|---|---|---|
| **Display** | Space Grotesk | 500, 600, 700 | Brand name, agent name, screen titles, CTA text |
| **UI / Body** | Inter | 400, 500, 600 | All other text — labels, transcript, microcopy |

**Why Space Grotesk for display?**
- Geometric but slightly quirky — feels modern/tech without being sterile
- Excellent at large sizes (headings, agent names)
- Pairs perfectly with Inter (similar x-height, different personality)
- Widely associated with premium AI and product companies in 2025-26

### Type scale

| Level | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `display` | 28–32px | 700 | Space Grotesk | Agent name in lobby, screen hero headings |
| `heading-1` | 22–24px | 600 | Space Grotesk | Section titles, platform wordmark |
| `heading-2` | 18–20px | 600 | Space Grotesk | Card headings |
| `body-lg` | 16px | 400 | Inter | Primary body copy |
| `body` | 14–15px | 400/500 | Inter | Standard UI text |
| `body-sm` | 13px | 400/500 | Inter | Secondary labels |
| `caption` | 11–12px | 500/600 | Inter | Timestamps, section labels (uppercase tracking) |

### Text treatments

- Section labels: `11px / uppercase / letter-spacing 0.08em / weight 600 / muted color`
- Timestamps: `11px / tabular nums / muted color`
- CTA buttons: `15–16px / Space Grotesk 600 / no uppercase`
- Error messages: `12px / Inter 400 / status-red`
- Transcript text: `14px / Inter 400 / line-height 1.6 / white 90%`

---

## 4. Avatar & Agent Visual System

The agent avatar is the emotional center of every session. It must communicate state through motion.

### Avatar anatomy

```
[Outer glow ring — brand color, very low opacity, blur 40px]
  [Ring 1 — animated, brand color, 1px border]
  [Ring 2 — animated, brand color, staggered]
  [Ring 3 — animated, brand color, staggered]
    [Avatar circle — 96px — brand gradient fill]
      [Agent initial — Space Grotesk 700, 36px]
    [Online badge — 20px circle, status-green, brand-bg border]
```

### Avatar states

| State | Avatar | Rings | Label |
|---|---|---|---|
| **Connecting** | Dimmed (opacity 0.7), spinning loader | None | "Connecting…" / muted |
| **Listening** | Full opacity, 4s breathe scale | 1 ring: slow breathe (scale 1.0→1.1, 3s, opacity 0.15→0.30) | "Listening" / muted |
| **User speaking** | Full brightness | 1 ring: fast pulse (0.6s, brand blue tint, opacity 0.5→0.8) | "Hearing you…" / blue |
| **Agent speaking** | Full brightness + subtle breathe | 3 rings: staggered expand outward (1.8s each, delays: 0s / 0.5s / 1.0s, opacity 0.6→0) | "Aria is speaking" / brand color |
| **Muted** | opacity 0.45, no rings | None | "Muted" / muted |
| **Error** | Red tint, "!" initial | None | Error text / red |

### Ring animation spec

```css
/* Agent speaking rings — keyframe */
@keyframes ring-expand {
  0%   { transform: scale(0.95); opacity: 0.65; }
  100% { transform: scale(1.85); opacity: 0; }
}

/* Avatar resting breathe */
@keyframes orb-breathe {
  0%, 100% { transform: scale(1.0); }
  50%       { transform: scale(1.03); }
}

/* Listening ring */
@keyframes listen-ring {
  0%, 100% { transform: scale(1.0); opacity: 0.15; }
  50%       { transform: scale(1.10); opacity: 0.30; }
}
```

---

## 5. Background System

Every screen uses a consistent atmospheric background approach. **Never a flat color.**

### Standard screen background

```
Base:        #0E0C1A (surface-900)
Atmosphere:  radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)
             — a soft violet aurora light coming from the top of the screen
```

Applied as a layered div structure:
```jsx
<div className="fixed inset-0 bg-surface-900">
  <div className="absolute inset-0" style={{
    background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)'
  }} />
</div>
```

### Brand session background (Lobby + Session)

Replaces the top atmosphere with the brand's color:
```jsx
background: `radial-gradient(ellipse at 50% 0%, ${brand.colors.from}18 0%, transparent 55%)`
```

### Glass surface recipe

Used for bottom docks, cards, modals:
```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

---

## 6. Component Standards

### Buttons

**Primary (CTA):**
- Background: aurora gradient `linear-gradient(135deg, #7C3AED, #2563EB)` or brand gradient
- Text: white, Space Grotesk 600, 15px
- Padding: 16px vertical, full-width
- Border-radius: 16px
- Box-shadow: `0 8px 24px rgba(124, 58, 237, 0.30)` or brand color glow
- Active: scale(0.98)

**Secondary:**
- Background: glass surface
- Border: rgba(white, 0.10)
- Text: white/70, Inter 500, 14px

**Destructive (end session):**
- Background: rgba(239, 68, 68, 0.15)
- Border: rgba(239, 68, 68, 0.25)
- Text: status-red

**Icon button (mute, etc.):**
- 48x48px circle
- Glass surface
- Icon: white/60 default, brand color or red when active

### Cards (BrandPicker)

```
Background: rgba(255, 255, 255, 0.04)
Border: 1px solid rgba(255, 255, 255, 0.08)
Border-left: 2px solid [brand.colors.from] at 60% opacity
Border-radius: 16px
Padding: 16px
Active: scale(0.98) + border opacity increase
```

### Transcript bubbles

**Agent bubble:**
```
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.08)
Border-radius: 16px 16px 16px 4px
Text: white/90, 14px, line-height 1.6
```

**User bubble:**
```
Background: rgba([brand.from], 0.15)
Border: 1px solid rgba([brand.from], 0.20)
Border-radius: 16px 16px 4px 16px
Text: white, 14px, line-height 1.6
```

### Conversation starters (Lobby)

```
Border: 1px solid rgba(255, 255, 255, 0.07)
Border-radius: 12px
Padding: 12px 14px
Background: rgba(255, 255, 255, 0.03)
Text: white/50, 13px, italic
```

---

## 7. Iconography

- Style: Stroke-only, 1.5–2px, rounded caps and joins (Lucide-compatible)
- Color: Inherits from parent context (white/60 default)
- Sizes: 16px (inline), 20px (button icon), 24px (standalone)
- No filled icons except status indicators (green/red dot)
- No emoji anywhere in the product

---

## 8. Motion Principles

### Rules
1. **Every state change has a transition.** No instant jumps. Minimum 200ms.
2. **Audio states animate. UI states ease.** The avatar is the animated core — everything else uses standard ease transitions.
3. **Motion communicates meaning.** Rings = agent speaking. Breathe = listening. Pulse = user active.
4. **Never animate text content.** Only animate position, opacity, scale.
5. **Respect prefers-reduced-motion.** Provide static fallbacks.

### Easing vocabulary

| Name | Curve | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `ease-out-smooth` | `cubic-bezier(0.0, 0, 0.2, 1)` | Elements entering |
| `ease-in-smooth` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Scale interactions (tap, pop) |

### Duration vocabulary

| Duration | Usage |
|---|---|
| 150ms | Hover states, border changes |
| 200ms | Color transitions, opacity |
| 300ms | Panel transitions, modal in/out |
| 500ms | State changes (connecting → listening) |
| 1.8s | Ring expand animation |
| 3–4s | Breathing / ambient animation |

---

## 9. Screen Principles

### BrandPicker
- Auralis identity anchors the top (aurora "A" mark + wordmark)
- Each brand card expresses the brand's color as a left accent
- The screen should feel like a premium product directory
- Scrollable list, no tabs or filters

### Lobby
- Full emotional focus on the agent — this is a trust-building screen
- The avatar takes 35% of the screen
- Minimal chrome — brand mark small at top, back link, that's it
- Conversation starters are visual context, not interactive
- The CTA radiates confidence

### Session
- The most animated screen — the avatar IS the product
- Background subtly responds to the brand (top radial glow)
- Transcript zone feels calm and readable — no competing animations
- Controls are glassy and minimal — they shouldn't fight the avatar
- State is always legible (label under avatar)

### Summary
- Calm, conclusive — the energy drops intentionally
- Brand identity remains visible at top
- Transcript is the hero — clean, readable, scannable
- Two actions clearly differentiated (primary CTA vs text link)

---

## 10. Brand Voices (Reference)

Each agent has distinct voice characteristics that should inform any copy written for or around them:

| Agent | Brand | Tone | Key words |
|---|---|---|---|
| Aria | Rajah Travel | Warm, knowledgeable, traveled | "Let me tell you about…", detailed, sensory |
| Joy | Jollibee | Cheerful, empathetic, upbeat | "Of course!", "Let me help…", warm |
| Gem | Globe | Calm, patient, clear | "Here's what I found…", efficient |

---

## Reference Products

Products that set the visual bar this brand book is calibrated against:
- **ElevenLabs** — typography and color restraint
- **Linear** — precision, spacing, dark mode mastery
- **Luma AI** — dark backgrounds, gradient identity
- **Perplexity** — voice state animation (pulsing orb)
- **Vercel** — glass surfaces, clean component language
- **Raycast** — icon treatment, surface hierarchy
