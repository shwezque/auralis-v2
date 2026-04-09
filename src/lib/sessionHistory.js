const STORAGE_KEY = 'auralis_sessions'
const MAX_SESSIONS = 200
const SUMMARY_ENDPOINT = '/api/session-summary'

function readSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch {}
}

/**
 * Save a completed session to localStorage.
 * Returns the new session id.
 */
export function saveSession({ brand, transcript, startedAt }) {
  const sessions = readSessions()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const lastTs = transcript.filter(m => m.text?.trim()).at(-1)?.ts || 0
  const newSession = {
    id,
    brandId: brand.id,
    brandName: brand.brandName,
    agentName: brand.agentName,
    agentInitial: brand.agentInitial,
    avatar: brand.avatar || null,
    colors: brand.colors,
    startedAt: startedAt || new Date().toISOString(),
    durationMs: lastTs,
    transcript,
    summary: null,
  }
  writeSessions([newSession, ...sessions].slice(0, MAX_SESSIONS))
  return id
}

export function getSessions() {
  return readSessions()
}

export function getSession(id) {
  return readSessions().find(s => s.id === id) || null
}

export function deleteSession(id) {
  writeSessions(readSessions().filter(s => s.id !== id))
}

export function clearAllSessions() {
  writeSessions([])
}

export function updateSessionSummary(id, summary) {
  writeSessions(readSessions().map(s => s.id === id ? { ...s, summary } : s))
}

/**
 * Generate a 2–3 sentence AI summary of a session transcript using the server API.
 */
export async function generateSummary(transcript) {
  const turns = transcript.filter(m => m.text?.trim())
  if (turns.length === 0) return 'No conversation content was captured.'

  const response = await fetch(SUMMARY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ transcript: turns }),
  })

  if (!response.ok) {
    throw new Error(`summary request failed (${response.status})`)
  }

  const payload = await response.json()
  return payload?.summary?.trim() || 'Summary unavailable.'
}
