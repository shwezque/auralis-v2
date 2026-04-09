import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions, clearAllSessions } from '../lib/sessionHistory'

function formatDate(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`
  const yesterday = new Date(now - 86400000)
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + time
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return null
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  if (mins < 60) return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`
}

function SessionCard({ session, onClick }) {
  const firstUserMsg = session.transcript?.find(m => m.role === 'user' && m.text?.trim())
  const turnCount = session.transcript?.filter(m => m.text?.trim()).length || 0
  const duration = formatDuration(session.durationMs)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Agent avatar */}
      <div
        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 relative"
        style={{ background: `linear-gradient(135deg, ${session.colors.from}, ${session.colors.to})` }}
      >
        <span className="text-sm font-bold font-display" style={{ color: session.colors.avatarText }}>{session.agentInitial || session.agentName?.charAt(0).toUpperCase()}</span>
        {session.avatar && (
          <img src={session.avatar} alt={session.agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <span className="text-cream text-[13px] font-semibold leading-tight">{session.agentName}</span>
          <span className="text-cream/30 text-[11px] flex-shrink-0 mt-0.5">{formatDate(session.startedAt)}</span>
        </div>
        <p className="text-cream/35 text-[11px] mb-1.5">
          {session.brandName}
          {duration && <span className="text-cream/20"> · {duration}</span>}
          {!duration && turnCount > 0 && <span className="text-cream/20"> · {turnCount} msgs</span>}
        </p>
        {firstUserMsg && (
          <p className="text-cream/50 text-xs leading-snug line-clamp-2">{firstUserMsg.text}</p>
        )}
        {session.summary && (
          <p className="text-cream/35 text-[11px] leading-snug mt-1 line-clamp-1 italic">{session.summary}</p>
        )}
      </div>

      {/* Chevron */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cream/20 flex-shrink-0 mt-3.5">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function History() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    clearAllSessions()
    setSessions([])
    setFilter('all')
    setConfirmClear(false)
  }

  useEffect(() => {
    setSessions(getSessions())
  }, [])

  // Only show brand tabs for brands that actually have sessions
  const brandIdsWithSessions = [...new Set(sessions.map(s => s.brandId))]
  const showFilter = brandIdsWithSessions.length > 1

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.brandId === filter)

  function brandLabel(id) {
    if (id === 'all') return 'All'
    // Derive the name from the most recent session with this brandId
    const session = sessions.find(s => s.brandId === id)
    return session?.brandName || id
  }

  function brandColors(id) {
    const session = sessions.find(s => s.brandId === id)
    return session?.colors || null
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>
      <div className="w-full max-w-[30rem] mx-auto flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-safe-or-6 pb-5 flex-shrink-0">
          <button
            onClick={() => { setConfirmClear(false); navigate('/') }}
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-colors hover:bg-white/[0.06]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-cream/60">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-cream text-[17px] font-semibold font-display tracking-tight leading-tight">Sessions</h1>
            <p className="text-cream/30 text-[11px] mt-0.5">
              {sessions.length === 0 ? 'No conversations yet' : `${sessions.length} conversation${sessions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={handleClearAll}
              onBlur={() => setConfirmClear(false)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl flex-shrink-0 transition-all active:scale-95"
              style={confirmClear
                ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#F87171' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
              }
              aria-label="Clear all sessions"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              <span className="text-[11px] font-medium">{confirmClear ? 'Confirm' : 'Clear all'}</span>
            </button>
          )}
        </div>

        {/* Brand filter pills */}
        {showFilter && (
          <div className="flex gap-2 px-6 pb-4 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {['all', ...brandIdsWithSessions].map(id => {
              const colors = brandColors(id)
              const isActive = filter === id
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={isActive && colors
                    ? { background: `${colors.from}28`, border: `1px solid ${colors.from}55`, color: colors.label }
                    : isActive
                    ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.38)' }
                  }
                >
                  {brandLabel(id)}
                </button>
              )
            })}
          </div>
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 pb-20">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-cream/25">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-cream/50 text-sm font-medium mb-1">No sessions yet</p>
              <p className="text-cream/25 text-xs text-center leading-relaxed">
                Conversations will appear here<br />after you talk to an agent.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.50)' }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pb-10 pt-1">
              {filtered.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => navigate(`/history/${session.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
