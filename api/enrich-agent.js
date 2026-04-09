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

// Map ISO 3166-1 alpha-2 country codes to full names
const COUNTRY_NAMES = {
  PH: 'Philippines', US: 'United States', GB: 'United Kingdom', AU: 'Australia',
  CA: 'Canada', SG: 'Singapore', MY: 'Malaysia', IN: 'India', ID: 'Indonesia',
  TH: 'Thailand', VN: 'Vietnam', JP: 'Japan', KR: 'South Korea', HK: 'Hong Kong',
  TW: 'Taiwan', NZ: 'New Zealand', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  BR: 'Brazil', MX: 'Mexico', AR: 'Argentina', ZA: 'South Africa', NG: 'Nigeria',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id is required.' })

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server API key not configured.' })

  // Detect user's country from Vercel's auto-injected geo header
  const countryCode = (req.headers['x-vercel-ip-country'] || '').toUpperCase()
  const countryName = COUNTRY_NAMES[countryCode] || countryCode || null

  // Load agent from Redis
  const raw = await withRedis(client => client.get(`agent:${id}`))
  if (!raw) return res.status(404).json({ error: 'Agent not found.' })
  const agent = JSON.parse(raw)

  try {
    const ai = new GoogleGenAI({ apiKey })

    const locationSection = countryName
      ? `\nLOCATION CONTEXT: The user requesting this research is in ${countryName}. This is critical:
- Use ${countryName}-specific pricing in the local currency (NOT USD or a converted amount)
- If the business has a localized website for ${countryName} (e.g., apple.com/ph, shopee.ph), use that as the PRIMARY source for prices and availability
- List products/services available in ${countryName} only — exclude items not sold or shipped there
- Include any ${countryName}-specific promotions, bundles, or local store locations\n`
      : ''

    const prompt = `You are a business research assistant. Research the company "${agent.brandName}" (website: ${agent.sourceUrl || 'unknown'}) thoroughly using web search.
${locationSection}
Your PRIMARY focus is the complete product and service catalogue. For every product, service, package, menu item, or offering you find:
- Full official name (exactly as sold/listed)
- Price (exact figure with local currency, or price range if variants exist)
- All variants, sizes, flavours, tiers, or options with their individual prices
- Availability (in-stock, seasonal, limited, discontinued)
- Key description or what's included

Then also compile:
- Current promotions, bundles, or deals with exact prices and conditions
- Contact details: phone, email, address, hours of operation
- Policies: returns, refunds, shipping, delivery, reservations, cancellations
- Recent news, awards, or notable facts a customer service agent should know

Format as a structured reference document with clear section headers. Be exhaustive on the product catalogue — if a customer asks "how much does X cost?" or "what variants does Y come in?", this document must have the answer. Label anything uncertain as "unconfirmed — verify with business".`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    })

    const research = response.text?.trim()
    if (!research) return res.status(500).json({ error: 'No research results returned.' })

    // Append research to system prompt, replacing any prior research section
    const basePrompt = agent.systemPrompt.replace(/\n\n## Web Research[\s\S]*$/, '')
    agent.systemPrompt = `${basePrompt}\n\n## Web Research (auto-supplemented)\n${research}`
    agent.enrichedAt = new Date().toISOString()

    await withRedis(client =>
      client.set(`agent:${id}`, JSON.stringify(agent), { KEEPTTL: true })
    )

    return res.status(200).json({ agent, research, country: countryName || null })
  } catch (err) {
    console.error('[enrich-agent] Error:', err)
    return res.status(500).json({ error: 'Failed to enrich agent.' })
  }
}
