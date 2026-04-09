import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { BRAND_LIST } from '../lib/brands'
import { getMyAgents, deleteMyAgent } from '../lib/agentStore'

// Plain agent card for demos (no swipe)
function AgentCard({ brand, onSelect }) {
  return (
    <button
      onClick={() => onSelect(brand)}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left active:scale-[0.98] transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${brand.colors.border}` }}
    >
      <div
        className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
        style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
      >
        <span className="text-base font-bold font-display" style={{ color: brand.colors.avatarText }}>{brand.agentInitial || brand.agentName?.charAt(0).toUpperCase()}</span>
        {brand.avatar && (
          <img src={brand.avatar} alt={brand.agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-[14px] font-semibold font-display leading-tight">{brand.agentName}</p>
        <p className="text-cream/40 text-xs mt-0.5 truncate">{brand.brandName} · {brand.agentRole}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cream/20 flex-shrink-0">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

// Swipeable agent card with delete reveal
function SwipeableAgentCard({ brand, onSelect, onDelete }) {
  const [offsetX, setOffsetX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startXRef = useRef(null)
  const startYRef = useRef(null)
  const isDraggingRef = useRef(false)
  const DELETE_WIDTH = 64

  function onTouchStart(e) {
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    isDraggingRef.current = false
  }

  function onTouchMove(e) {
    if (startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    const dy = e.touches[0].clientY - startYRef.current
    // If mostly vertical, don't interfere
    if (!isDraggingRef.current && Math.abs(dy) > Math.abs(dx)) return
    isDraggingRef.current = true
    e.preventDefault()
    const base = revealed ? -DELETE_WIDTH : 0
    const newOffset = Math.min(0, Math.max(-DELETE_WIDTH - 10, base + dx))
    setOffsetX(newOffset)
  }

  function onTouchEnd() {
    if (!isDraggingRef.current) { startXRef.current = null; return }
    if (offsetX < -DELETE_WIDTH / 2) {
      setOffsetX(-DELETE_WIDTH)
      setRevealed(true)
    } else {
      setOffsetX(0)
      setRevealed(false)
    }
    startXRef.current = null
    isDraggingRef.current = false
  }

  function handleCardClick() {
    if (revealed) { setOffsetX(0); setRevealed(false); return }
    onSelect(brand)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ background: '#07060F' }}>
      {/* Delete button revealed underneath — invisible until user swipes */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center"
        style={{
          width: DELETE_WIDTH,
          background: 'rgba(239,68,68,0.15)',
          opacity: offsetX < 0 ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        <button
          onClick={onDelete}
          className="w-full h-full flex items-center justify-center"
          aria-label="Delete agent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-400">
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Card — slides left to reveal delete */}
      <div
        className="w-full"
        style={{ transform: `translateX(${offsetX}px)`, transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={handleCardClick}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${brand.colors.border}` }}
        >
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
          >
            <span className="text-base font-bold font-display" style={{ color: brand.colors.avatarText }}>{brand.agentInitial || brand.agentName?.charAt(0).toUpperCase()}</span>
            {brand.avatar && (
              <img src={brand.avatar} alt={brand.agentName} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-[14px] font-semibold font-display leading-tight">{brand.agentName}</p>
            <p className="text-cream/40 text-xs mt-0.5 truncate">{brand.brandName} · {brand.agentRole}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cream/20 flex-shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { setSelectedBrand } = useApp()
  const navigate = useNavigate()
  const [myAgents, setMyAgents] = useState([])
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setMyAgents(getMyAgents())
  }, [])

  function handleSelect(brand) {
    setSelectedBrand(brand)
    navigate('/lobby')
  }

  function handleDelete(id) {
    deleteMyAgent(id)
    setMyAgents(prev => prev.filter(a => a.id !== id))
  }

  function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    myAgents.forEach(a => deleteMyAgent(a.id))
    setMyAgents([])
    setConfirmClear(false)
  }

  return (
    <div
      className="flex flex-col min-h-screen w-full overflow-x-hidden relative"
      style={{ background: 'linear-gradient(180deg, #07060F 0%, #0E0C1A 100%)' }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[320px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative flex flex-col flex-1 w-full max-w-[30rem] mx-auto px-5">

        {/* Nav */}
        <div className="flex items-center justify-between pt-safe-or-6 pb-2">
          <div className="flex items-center gap-2.5">
            <img src="/Auralis Logo.png" alt="Auralis" className="w-7 h-7 object-contain" />
            <span className="text-cream text-[15px] font-semibold font-display">Auralis</span>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-cream/35 text-xs hover:text-cream/65 transition-colors py-1.5 px-2.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sessions
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center pt-12 pb-10">
          <p className="text-cream/40 text-xs font-semibold uppercase tracking-[0.12em] mb-3">AI Customer Service</p>
          <h1 className="text-cream text-[28px] font-bold font-display tracking-tight leading-tight mb-3">
            Give your business<br />a voice AI agent
          </h1>
          <p className="text-cream/45 text-sm leading-snug max-w-[22ch]">
            Paste your URL. We build a voice AI agent in seconds — share the link and anyone can talk to it.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate('/create')}
            className="mt-8 flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-semibold active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              color: '#FFFFFF',
              boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Create your agent
          </button>

          <p className="text-cream/25 text-[11px] mt-3">Free to create · No account needed</p>
        </div>

        {/* My agents (if any) */}
        {myAgents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em]">Your agents</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  onBlur={() => setConfirmClear(false)}
                  className="text-[11px] font-medium transition-colors"
                  style={{ color: confirmClear ? '#F87171' : 'rgba(255,255,255,0.25)' }}
                >
                  {confirmClear ? 'Confirm clear' : 'Clear all'}
                </button>
                <button
                  onClick={() => navigate('/create')}
                  className="text-[11px] font-medium text-cream/40 hover:text-cream/70 transition-colors"
                >
                  + New
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {myAgents.map(agent => (
                <SwipeableAgentCard
                  key={agent.id}
                  brand={agent}
                  onSelect={handleSelect}
                  onDelete={() => handleDelete(agent.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Demo agents */}
        <div className="mb-10">
          <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] mb-3">
            {myAgents.length > 0 ? 'Demo agents' : 'Try a demo'}
          </p>
          <div className="flex flex-col gap-2">
            {BRAND_LIST.map(brand => (
              <AgentCard key={brand.id} brand={brand} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
