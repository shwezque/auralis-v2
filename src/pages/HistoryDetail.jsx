import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSession, updateSessionSummary, generateSummary, deleteSession } from '../lib/sessionHistory'

function formatTimestamp(ms) {
  const totalSecs = Math.floor((ms || 0) / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFullDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return '< 1 min'
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  if (mins < 60) return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`
}

function TranscriptBubble({ msg, session }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 px-1">
        {!isUser && (
          <div
            className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${session.colors.from}, ${session.colors.to})` }}
          >
            <span className="text-[9px] font-bold font-display leading-none" style={{ color: session.colors.avatarText }}>{session.agentInitial || session.agentName?.charAt(0).toUpperCase()}</span>
            {session.avatar && (
              <img src={session.avatar} alt={session.agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
          </div>
        )}
        <span className="text-cream/30 text-xs">
          {isUser ? 'You' : session.agentName} · {formatTimestamp(msg.ts)}
        </span>
      </div>
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'text-cream rounded-tr-sm' : 'text-cream/85 rounded-tl-sm border'}`}
        style={isUser
          ? { background: `${session.colors.from}26`, border: `1px solid ${session.colors.from}33` }
          : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }
        }
      >
        {msg.text}
      </div>
    </div>
  )
}

export default function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [summaryState, setSummaryState] = useState('idle') // idle | loading | done | error
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const hasFetchedSummary = useRef(false)

  useEffect(() => {
    const s = getSession(id)
    if (!s) { navigate('/history', { replace: true }); return }
    setSession(s)
    if (s.summary) setSummaryState('done')
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate summary on first view if not yet available
  useEffect(() => {
    if (!session || hasFetchedSummary.current) return
    hasFetchedSummary.current = true

    if (session.summary) { setSummaryState('done'); return }
    if (!session.transcript?.filter(m => m.text?.trim()).length) {
      setSummaryState('error')
      return
    }

    setSummaryState('loading')
    generateSummary(session.transcript)
      .then(summary => {
        updateSessionSummary(session.id, summary)
        setSession(prev => ({ ...prev, summary }))
        setSummaryState('done')
      })
      .catch(() => setSummaryState('error'))
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDelete() {
    deleteSession(id)
    navigate('/history', { replace: true })
  }

  if (!session) return null

  const validTurns = session.transcript?.filter(m => m.text?.trim()) || []
  const turnCount = validTurns.length
  const userTurns = validTurns.filter(m => m.role === 'user').length

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>

      {/* Atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${session.colors.from}12 0%, transparent 50%)` }}
      />

      <div className="w-full max-w-[30rem] mx-auto flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-safe-or-6 pb-4 flex-shrink-0">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-cream/40 text-xs hover:text-cream/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sessions
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-red-500/10"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            aria-label="Delete session"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-cream/30">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pb-12">

            {/* Agent identity block */}
            <div className="flex items-center gap-3.5 mb-6 pt-1">
              <div
                className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
                style={{
                  background: `linear-gradient(135deg, ${session.colors.from}, ${session.colors.to})`,
                  boxShadow: `0 8px 28px ${session.colors.ring}`,
                }}
              >
                <span className="text-xl font-bold font-display" style={{ color: session.colors.avatarText }}>{session.agentInitial || session.agentName?.charAt(0).toUpperCase()}</span>
                {session.avatar && (
                  <img src={session.avatar} alt={session.agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
                )}
              </div>
              <div>
                <p className="text-cream text-[17px] font-semibold font-display leading-tight">{session.agentName}</p>
                <p className="text-cream/35 text-xs mt-0.5">{session.brandName}</p>
                <p className="text-cream/25 text-[11px] mt-0.5 leading-tight">{formatFullDate(session.startedAt)}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-2.5 mb-6">
              {[
                { label: 'Duration', value: formatDuration(session.durationMs) },
                { label: 'Messages', value: String(turnCount) },
                { label: 'Your turns', value: String(userTurns) },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="flex-1 rounded-xl px-3 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-cream text-sm font-semibold font-display">{stat.value}</p>
                  <p className="text-cream/30 text-[10px] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Summary card */}
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] mb-3">Summary</p>
              {summaryState === 'loading' && (
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                    style={{ borderColor: `${session.colors.from}50`, borderTopColor: session.colors.from }}
                  />
                  <p className="text-cream/35 text-xs">Generating summary…</p>
                </div>
              )}
              {summaryState === 'done' && session.summary && (
                <p className="text-cream/70 text-sm leading-relaxed">{session.summary}</p>
              )}
              {summaryState === 'error' && (
                <p className="text-cream/30 text-xs italic">Summary could not be generated.</p>
              )}
              {summaryState === 'idle' && !session.summary && (
                <p className="text-cream/30 text-xs italic">No summary available.</p>
              )}
            </div>

            {/* Transcript */}
            <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] mb-3.5">Transcript</p>
            {validTurns.length === 0 ? (
              <p className="text-cream/25 text-sm text-center py-8">No transcript recorded.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {validTurns.map(msg => (
                  <TranscriptBubble key={msg.id} msg={msg} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-20 px-8"
          style={{ background: 'rgba(5,13,26,0.88)' }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-xs shadow-2xl"
            style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-cream text-base font-semibold text-center mb-1">Delete this session?</p>
            <p className="text-cream/40 text-xs text-center mb-5 leading-relaxed">
              This conversation and its transcript will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl text-cream/60 text-sm font-medium transition-opacity active:opacity-70 border"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl text-red-400 text-sm font-medium transition-opacity active:opacity-70 border"
                style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
