import { createClient } from 'redis'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id query param is required.' })
  }

  const client = createClient({ url: process.env.REDIS_URL })
  try {
    await client.connect()
    const raw = await client.get(`agent:${id}`)
    if (!raw) {
      return res.status(404).json({ error: 'Agent not found.' })
    }
    const agent = JSON.parse(raw)
    return res.status(200).json({ agent })
  } catch (err) {
    console.error('[get-agent] Error:', err)
    return res.status(500).json({ error: 'Failed to retrieve agent.' })
  } finally {
    await client.quit()
  }
}
