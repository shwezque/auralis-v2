const STORAGE_KEY = 'auralis_my_agents'
const MAX_AGENTS = 50

function readAgents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeAgents(agents) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(agents)) } catch {}
}

/**
 * Save a newly created agent to the creator's local list.
 */
export function saveAgent(agent) {
  const agents = readAgents()
  const existing = agents.findIndex(a => a.id === agent.id)
  if (existing >= 0) {
    agents[existing] = agent
  } else {
    agents.unshift(agent)
  }
  writeAgents(agents.slice(0, MAX_AGENTS))
}

export function getMyAgents() {
  return readAgents()
}

export function deleteMyAgent(id) {
  writeAgents(readAgents().filter(a => a.id !== id))
}

export function getMyAgent(id) {
  return readAgents().find(a => a.id === id) || null
}
