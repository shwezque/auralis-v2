import { GoogleGenAI } from '@google/genai'
import { createClient } from 'redis'

async function withRedis(fn) {
  const client = createClient({ url: process.env.REDIS_URL })
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.quit()
  }
}

// Female names by first letter — used to derive agent name from brand initial
const FEMALE_NAMES = {
  A: ['Ava','Aria','Aurora','Alexis','Amber','Alicia','Ada'],
  B: ['Bella','Bianca','Blair','Brooke','Beatrice','Bea','Beth'],
  C: ['Clara','Chloe','Carmen','Cara','Celeste','Cora','Cassie'],
  D: ['Diana','Daisy','Danielle','Dawn','Demi','Dina','Dara'],
  E: ['Emma','Elena','Eva','Ella','Elise','Emily','Evelyn'],
  F: ['Flora','Fiona','Faith','Felicia','Francesca','Farrah'],
  G: ['Grace','Gina','Gloria','Gabrielle','Georgia','Gemma'],
  H: ['Hana','Harper','Hazel','Hera','Helena','Holly','Hope'],
  I: ['Isla','Iris','Ivy','Isabella','Ingrid','Irene','Ines'],
  J: ['Jade','Jasmine','Julia','Jenna','Joy','June','Jana'],
  K: ['Kira','Kate','Kayla','Katrina','Kelly','Kaia','Kyra'],
  L: ['Luna','Lara','Layla','Leah','Lily','Lena','Lexi'],
  M: ['Maya','Mia','Monica','Morgan','Mila','Maria','Mae'],
  N: ['Nina','Nora','Naomi','Natalie','Nicole','Nadia','Nova'],
  O: ['Olivia','Ora','Ophelia','Odette','Opal','Ona'],
  P: ['Priya','Piper','Paige','Penelope','Pearl','Petra','Pia'],
  Q: ['Quinn','Queenie','Quinta'],
  R: ['Rosa','Riley','Rita','Rachel','Rebecca','Renee','Riva'],
  S: ['Sofia','Sara','Stella','Skye','Serena','Sienna','Sophie'],
  T: ['Tara','Tess','Thea','Tia','Tina','Talia','Taylor'],
  U: ['Uma','Ula','Unity','Ursa'],
  V: ['Vera','Violet','Vivian','Venus','Valerie','Victoria','Veda'],
  W: ['Wren','Wendy','Willow','Whitney','Waverly'],
  X: ['Xena','Xiomara','Xandra'],
  Y: ['Yasmin','Yara','Yvonne','Yuna','Yael'],
  Z: ['Zoe','Zara','Zelda','Ziva','Zinnia','Zola'],
}

function pickAgentName(brandFirstLetter, existingNames = []) {
  const letter = (brandFirstLetter || 'A').toUpperCase()
  const candidates = FEMALE_NAMES[letter] || FEMALE_NAMES['A']
  const used = new Set((existingNames || []).map(n => n.toLowerCase()))
  return candidates.find(n => !used.has(n.toLowerCase())) || candidates[0]
}

// 8 accent palettes, assigned by hash of domain name
const ACCENT_PALETTES = [
  { from: '#6366F1', to: '#4F46E5', avatarText: '#FFFFFF', ring: 'rgba(99,102,241,0.3)',  label: '#A5B4FC', border: 'rgba(99,102,241,0.2)' },
  { from: '#8B5CF6', to: '#7C3AED', avatarText: '#FFFFFF', ring: 'rgba(139,92,246,0.3)',  label: '#C4B5FD', border: 'rgba(139,92,246,0.2)' },
  { from: '#EC4899', to: '#DB2777', avatarText: '#FFFFFF', ring: 'rgba(236,72,153,0.3)',  label: '#F9A8D4', border: 'rgba(236,72,153,0.2)' },
  { from: '#14B8A6', to: '#0D9488', avatarText: '#FFFFFF', ring: 'rgba(20,184,166,0.3)',  label: '#5EEAD4', border: 'rgba(20,184,166,0.2)' },
  { from: '#F59E0B', to: '#D97706', avatarText: '#FFFFFF', ring: 'rgba(245,158,11,0.3)',  label: '#FCD34D', border: 'rgba(245,158,11,0.2)' },
  { from: '#10B981', to: '#059669', avatarText: '#FFFFFF', ring: 'rgba(16,185,129,0.3)',  label: '#6EE7B7', border: 'rgba(16,185,129,0.2)' },
  { from: '#3B82F6', to: '#2563EB', avatarText: '#FFFFFF', ring: 'rgba(59,130,246,0.3)',  label: '#93C5FD', border: 'rgba(59,130,246,0.2)' },
  { from: '#EF4444', to: '#DC2626', avatarText: '#FFFFFF', ring: 'rgba(239,68,68,0.3)',   label: '#FCA5A5', border: 'rgba(239,68,68,0.2)' },
]

const VOICES = ['Aoede', 'Leda', 'Kore', 'Zephyr', 'Autonoe']

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function domainFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function pickByHash(arr, seed) {
  return arr[hashString(seed) % arr.length]
}

function generateId() {
  return Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9)
}

const SYSTEM_PROMPT_TEMPLATE = `You are a JSON-only output AI. You will be given the extracted text content of a website. Generate a voice AI customer service agent configuration for that business.

Output ONLY valid JSON — no markdown, no explanation — matching this exact shape:
{
  "brandName": "string — the official business name",
  "agentName": "string — a friendly first name for the voice agent (not the brand name)",
  "agentRole": "string — short role title, e.g. 'Customer Support', 'Sales Assistant'",
  "tagline": "string — one-line description of what the agent helps with (≤12 words)",
  "systemPrompt": "string — full voice agent system prompt (see requirements below)",
  "starters": ["string", "string", "string"]
}

Requirements for systemPrompt:
- Open with: "You are [agentName], a [agentRole] for [brandName]."
- Embed the key facts, products, services, and policies extracted from the site content
- CRITICAL: If the content contains specific products, menu items, services, packages, or tours — list them by name in the prompt with their prices, variants, sizes, and options exactly as found. Do not summarise or omit them. The agent must be able to answer "What do you sell?" and "How much does X cost?" directly.
- If pricing was found, include a ## Products & Pricing section that lists items with their actual prices. If variants/sizes exist, include each variant and its price.
- If no pricing was found, include a note that pricing should be confirmed on the website or by contacting the business.
- Optimise for voice: natural spoken language, short replies, no bullet points in replies
- Include a guardrails section: only state prices and availability that are explicitly listed in this prompt — never invent details not provided here
- Keep to ~400-600 words (more if needed to cover the full product catalogue)
- End with a ## Language section: "Always respond in the same language the user uses — whether they speak or type. Switch with them mid-conversation. Default to English if unclear."

Requirements for starters:
- Three example questions a real customer would ask this specific business
- Each wrapped in double quotes, starting with a capital letter
- Grounded in the actual products/services/content on the site

Keep all strings clean — no newline escapes inside brandName, agentName, agentRole, or tagline.
For systemPrompt, use \\n for line breaks.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { url, content, meta, existingNames } = req.body || {}
  if (!url || !content) {
    return res.status(400).json({ error: 'url and content are required.' })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Gemini API key is not configured.' })
  }

  const domain = domainFromUrl(url)
  const brandFirstLetter = domain.split('.')[0].charAt(0)
  const forcedAgentName = pickAgentName(brandFirstLetter, existingNames)

  try {
    const ai = new GoogleGenAI({ apiKey })

    const userPrompt = `Website URL: ${url}
Page title: ${meta?.pageTitle || meta?.ogTitle || domain}
Description: ${meta?.ogDesc || meta?.metaDesc || ''}

IMPORTANT: The agent name MUST be exactly "${forcedAgentName}" — do not choose a different name.

Extracted website content:
---
${content}
---

Generate the agent config JSON now.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT_TEMPLATE,
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    })

    const raw = response.text?.trim() || ''

    let generated
    try {
      generated = JSON.parse(raw)
    } catch {
      console.error('[create-agent] Failed to parse Gemini JSON:', raw.slice(0, 500))
      return res.status(500).json({ error: 'Agent generation failed — could not parse response.' })
    }

    // Force the pre-determined name (override anything Gemini chose)
    generated.agentName = forcedAgentName
    if (generated.systemPrompt) {
      // Replace any agent name Gemini may have used in the system prompt opening line
      generated.systemPrompt = generated.systemPrompt.replace(
        /^You are \w+,/,
        `You are ${forcedAgentName},`
      )
    }

    const { brandName, agentName, agentRole, tagline, systemPrompt, starters } = generated

    if (!brandName || !agentName || !systemPrompt) {
      return res.status(500).json({ error: 'Agent generation returned incomplete data.' })
    }

    const colors = pickByHash(ACCENT_PALETTES, domain)
    const voice = pickByHash(VOICES, domain)
    const id = generateId()

    const agentConfig = {
      id,
      brandName,
      agentName,
      agentRole: agentRole || 'Customer Support',
      tagline: tagline || '',
      brandInitial: brandName.charAt(0).toUpperCase(),
      agentInitial: agentName.charAt(0).toUpperCase(),
      voice,
      sourceUrl: url,
      avatar: meta?.logoUrl || null,
      systemPrompt,
      starters: Array.isArray(starters) ? starters.slice(0, 3) : [],
      colors,
      createdAt: new Date().toISOString(),
    }

    // Persist to Redis with 90-day TTL
    await withRedis(client =>
      client.set(`agent:${id}`, JSON.stringify(agentConfig), { EX: 60 * 60 * 24 * 90 })
    )

    return res.status(200).json({ id, agent: agentConfig })
  } catch (err) {
    console.error('[create-agent] Error:', err)
    return res.status(500).json({ error: 'Failed to create agent.' })
  }
}
