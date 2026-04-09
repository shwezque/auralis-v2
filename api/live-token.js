export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Gemini API key is not configured.' })
  }

  // Return the server-side API key so it never needs to be bundled into the client.
  return res.status(200).json({ token: apiKey })
}
