import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import BrandLogo from '../components/BrandLogo'

function KnowledgeSheet({ brand, onClose }) {
  const [researching, setResearching] = useState(false)
  const [researchDone, setResearchDone] = useState(false)
  const [error, setError] = useState('')
  const { setSelectedBrand } = useApp()

  async function handleResearch() {
    setResearching(true)
    setError('')
    try {
      const res = await fetch('/api/enrich-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: brand.id }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Research failed.')
      }
      const { agent } = await res.json()
      setSelectedBrand(agent)
      setResearchDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setResearching(false)
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end animate-fade-in"
      style={{ background: 'rgba(3,10,20,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-t-3xl max-h-[80vh]"
        style={{ background: '#0E0C1A', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <div>
            <p className="text-cream text-[15px] font-semibold font-display">Knowledge base</p>
            <p className="text-cream/30 text-[11px] mt-0.5">{brand.brandName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* System prompt */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0">
          <p className="text-cream/40 text-[11px] font-mono leading-relaxed whitespace-pre-wrap">{brand.systemPrompt}</p>
        </div>

        {/* Research button */}
        {brand.sourceUrl && (
          <div className="px-5 pb-safe-or-6 pt-3 flex-shrink-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {error && <p className="text-red-400/70 text-xs mb-2">{error}</p>}
            {researchDone && <p className="text-status-green text-xs mb-2">Knowledge base updated with web research.</p>}
            <button
              onClick={handleResearch}
              disabled={researching}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC' }}
            >
              {researching ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                  Researching the web…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Research web to supplement knowledge
                </>
              )}
            </button>
            <p className="text-cream/20 text-[10px] text-center mt-2">Uses Google Search · updates this agent's knowledge base</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Lobby() {
  const { selectedBrand, setSelectedBrand } = useApp()
  const navigate = useNavigate()
  const [isStarting, setIsStarting] = useState(false)
  const [showKnowledge, setShowKnowledge] = useState(false)

  if (!selectedBrand) return null

  const { brandName, agentName, agentInitial, agentRole, colors, starters } = selectedBrand

  async function handleStart() {
    if (isStarting) return
    setIsStarting(true)

    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true })
      stream?.getTracks().forEach((track) => track.stop())
    } catch (_) {
      // Session handles the detailed microphone error state.
    } finally {
      navigate('/session')
      setIsStarting(false)
    }
  }

  // Dynamic agents (created from a URL) have sourceUrl set.
  // For shared agents, just navigate home — keep selection so back-button on
  // the home screen can still reference the agent. For demo brands, clear it.
  function handleBack() {
    if (!selectedBrand?.sourceUrl) {
      setSelectedBrand(null)
    }
    navigate('/')
  }

  return (
    <div className="relative flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>
      {showKnowledge && <KnowledgeSheet brand={selectedBrand} onClose={() => setShowKnowledge(false)} />}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-safe-or-4 pb-3 flex-shrink-0">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
            <BrandLogo brand={selectedBrand} className="w-full h-full" fontSize="0.75rem" />
          </div>
          <span className="text-cream/80 text-[13px] font-medium">{brandName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Knowledge base — shown for dynamic agents */}
          {selectedBrand.id && selectedBrand.systemPrompt && (
            <button
              onClick={() => setShowKnowledge(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
              aria-label="View knowledge base"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </button>
          )}
          {/* Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-cream/40 text-xs hover:text-cream/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">

        {/* Agent avatar */}
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-3 rounded-full opacity-20 blur-xl"
            style={{ background: `radial-gradient(circle, ${colors.from}, transparent 70%)` }}
          />
          {/* Avatar */}
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              boxShadow: `0 20px 48px ${colors.ring}`,
              border: `2px solid ${colors.from}55`,
            }}
          >
            <span className="text-4xl font-bold font-display select-none" style={{ color: colors.avatarText }}>
              {agentInitial || agentName?.charAt(0).toUpperCase()}
            </span>
            {selectedBrand.avatar && (
              <img src={selectedBrand.avatar} alt={agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
          </div>
          {/* Online badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-status-green border-[2.5px] border-[#030A14] shadow-sm" />
        </div>

        {/* Agent name & role */}
        <h2 className="text-cream text-2xl font-semibold font-display tracking-tight">{agentName}</h2>
        <p className="text-sm mt-1.5" style={{ color: colors.label }}>
          {agentRole} · {brandName}
        </p>

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 mt-6 mb-6" />

        {/* Conversation starters */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] text-center mb-1">
            You could ask
          </p>
          {starters.map((s) => (
            <p key={s} className="text-cream/50 text-xs italic text-center leading-relaxed">{s}</p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-2 flex flex-col items-center gap-2.5 flex-shrink-0">
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full text-[15px] font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            color: colors.avatarText,
            boxShadow: `0 8px 28px ${colors.ring}`,
            opacity: isStarting ? 0.85 : 1,
          }}
        >
          {isStarting ? 'Starting…' : `Talk to ${agentName}`}
        </button>
        <p className="text-cream/30 text-xs text-center">
          Tap to start · microphone required
        </p>
      </div>
    </div>
  )
}
