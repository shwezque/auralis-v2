import { GoogleGenAI } from '@google/genai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Gemini API key is not configured.' })
  }

  const transcript = Array.isArray(req.body?.transcript) ? req.body.transcript : null
  const turns = transcript?.filter((m) => m?.text?.trim()) || []

  if (turns.length === 0) {
    return res.status(400).json({ error: 'Transcript is required.' })
  }

  try {
    const text = turns
      .map((m) => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.text}`)
      .join('\n')

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following customer service conversation in 2–3 short sentences. State what the customer needed and what was discussed or resolved. Be factual, specific, and concise.\n\n${text}`,
    })

    return res.status(200).json({
      summary: response.text?.trim() || 'Summary unavailable.',
    })
  } catch (error) {
    console.error('[session-summary] Failed to generate summary:', error)
    return res.status(500).json({ error: 'Failed to generate summary.' })
  }
}
