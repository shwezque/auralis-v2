import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGeminiLive } from '../hooks/useGeminiLive'
import BrandLogo from '../components/BrandLogo'
import VoiceWaveform from '../components/VoiceWaveform'
import { saveSession } from '../lib/sessionHistory'

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AgentAvatar({ status, isMuted, brand, compact = false }) {
  const isAgentSpeaking = status === 'agent-speaking'
  const isUserSpeaking  = status === 'user-speaking'
  const isListening     = status === 'listening'
  const isConnecting    = status === 'connecting'
  const isError         = status === 'error'
  const { colors, agentInitial } = brand

  const outerCls  = compact ? 'w-14 h-14' : 'w-36 h-36'
  const innerCls  = compact ? 'w-10 h-10' : 'w-28 h-28'
  const textCls   = compact ? 'text-base'  : 'text-4xl'
  const badgeCls  = compact
    ? 'bottom-0 right-0 w-3 h-3 border-[2px]'
    : 'bottom-1 right-1 w-5 h-5 border-[2.5px]'

  return (
    <div className={`relative flex items-center justify-center ${outerCls} flex-shrink-0`}>
      {/* Outer glow */}
      {!isError && !isConnecting && (
        <div
          className={`absolute inset-0 rounded-full opacity-20 ${compact ? 'blur-lg' : 'blur-2xl'}`}
          style={{ background: `radial-gradient(circle, ${colors.from}, transparent 70%)` }}
        />
      )}

      {/* Agent speaking: 3 staggered expanding rings */}
      {isAgentSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border animate-ring-1"
            style={{ borderColor: `${colors.from}99` }} />
          <div className="absolute inset-0 rounded-full border animate-ring-2"
            style={{ borderColor: `${colors.from}66` }} />
          <div className="absolute inset-0 rounded-full border animate-ring-3"
            style={{ borderColor: `${colors.from}33` }} />
        </>
      )}

      {/* Listening: single slow breathing ring */}
      {isListening && (
        <div
          className="absolute inset-0 rounded-full border animate-listen-ring"
          style={{ borderColor: `${colors.from}66` }}
        />
      )}

      {/* User speaking: fast pulse ring */}
      {isUserSpeaking && (
        <div
          className="absolute inset-0 rounded-full border-2 animate-speak-ring"
          style={{ borderColor: '#3B82F6' }}
        />
      )}

      {/* Avatar circle */}
      <div
        className={`
          ${innerCls} rounded-full overflow-hidden shadow-2xl transition-all duration-500 flex items-center justify-center flex-shrink-0 relative
          ${!isError && !isConnecting ? 'animate-orb-breathe' : ''}
          ${isMuted ? 'opacity-50' : ''}
        `}
        style={
          isError
            ? { background: 'rgba(127,0,0,0.3)', border: '2px solid rgba(239,68,68,0.4)' }
            : {
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                boxShadow: compact ? `0 6px 20px ${colors.ring}` : `0 16px 48px ${colors.ring}`,
                border: `${compact ? 1 : 2}px solid ${colors.from}55`,
              }
        }
      >
        {isConnecting ? (
          <svg className={`animate-spin-slow ${compact ? 'w-4 h-4' : 'w-9 h-9'}`} viewBox="0 0 24 24" fill="none"
            style={{ color: colors.avatarText }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round"/>
          </svg>
        ) : isError ? (
          <span className={`${textCls} font-bold font-display select-none text-red-400`}>!</span>
        ) : (
          <>
            <span className={`${textCls} font-bold font-display select-none`} style={{ color: colors.avatarText }}>
              {agentInitial}
            </span>
            {brand.avatar && (
              <img src={brand.avatar} alt={agentInitial} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
          </>
        )}
      </div>

      {/* Online badge — shown when active */}
      {(isListening || isAgentSpeaking || isUserSpeaking) && (
        <div className={`absolute ${badgeCls} rounded-full bg-status-green`}
          style={{ borderColor: '#030A14' }} />
      )}
    </div>
  )
}

// ─── Transcript bubble ────────────────────────────────────────────────────────

function TranscriptBubble({ msg, brand }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm relative"
          style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
        >
          <span className="text-xs font-bold font-display" style={{ color: brand.colors.avatarText }}>{brand.agentInitial}</span>
          {brand.avatar && (
            <img src={brand.avatar} alt={brand.agentInitial} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
          )}
        </div>
      )}
      <div className={`
        max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[15px] leading-relaxed
        ${isUser
          ? 'text-cream rounded-tr-sm'
          : 'text-cream/90 rounded-tl-sm border'}
      `}
        style={isUser
          ? { background: `${brand.colors.from}26`, border: `1px solid ${brand.colors.from}33` }
          : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }
        }
      >
        {msg.text || (
          <span className="inline-flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}

// ─── End confirmation dialog ──────────────────────────────────────────────────

function EndConfirm({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in px-8"
      style={{ background: 'rgba(7,6,15,0.85)' }}>
      <div className="rounded-2xl p-6 w-full max-w-xs shadow-2xl border"
        style={{ background: '#141224', borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-cream text-base font-semibold text-center mb-1">End this conversation?</p>
        <p className="text-cream/40 text-xs text-center mb-5">The transcript will be saved.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-cream/70 text-sm font-medium active:opacity-70 transition-opacity border"
            style={{ borderColor: 'rgba(255,255,255,0.10)' }}
          >
            Keep talking
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-red-400 text-sm font-medium active:opacity-70 transition-opacity border"
            style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            Yes, end
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session page ─────────────────────────────────────────────────────────────

export default function Session() {
  const { apiKey, selectedBrand, setSelectedBrand, setSessionTranscript, setSessionEndedWithError, sessionStartedAt, setSessionStartedAt } = useApp()
  const navigate = useNavigate()
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false)
  const [inputMode, setInputMode] = useState('voice') // 'voice' | 'chat'
  const [chatInput, setChatInput] = useState('')
  const [isResearching, setIsResearching] = useState(false)
  const [researchToast, setResearchToast] = useState(null) // null | { text, type }
  const transcriptBottomRef = useRef(null)
  const userScrolledRef = useRef(false)
  const scrollTimerRef = useRef(null)
  const chatInputRef = useRef(null)
  const toastTimerRef = useRef(null)

  const { status, transcript, errorMessage, isMuted, isSilent, connect, disconnect, toggleMute, toggleSilent, sendText, sendContext, resumeAudio } =
    useGeminiLive({
      apiKey,
      systemPrompt: selectedBrand.systemPrompt,
      voice: selectedBrand.voice,
      agentName: selectedBrand.agentName,
      canSendAudio: isVoiceInputActive,
    })

  // Block browser back-swipe while session is active.
  // Uses popstate (no data router required) instead of useBlocker.
  useEffect(() => {
    const isActive = status !== 'idle' && status !== 'error'
    if (!isActive) return

    // Push a history entry so back-swipe triggers popstate instead of leaving
    window.history.pushState({ session: true }, '')

    function handlePopstate() {
      handleEnd()
    }

    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [status])

  // Record session start time on mount
  useEffect(() => { setSessionStartedAt(new Date().toISOString()) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-connect on mount
  useEffect(() => { connect() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-activate voice input once session is listening and mode is voice
  useEffect(() => {
    if (status === 'listening' && inputMode === 'voice' && !isVoiceInputActive) {
      resumeAudio()
      setIsVoiceInputActive(true)
    }
  }, [status, inputMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll transcript (pauses 3s after user scrolls up)
  useEffect(() => {
    if (!userScrolledRef.current) {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

  function handleScroll(e) {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    if (!atBottom) {
      userScrolledRef.current = true
      clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => { userScrolledRef.current = false }, 3000)
    } else {
      userScrolledRef.current = false
    }
  }

  async function handleResearch() {
    if (isResearching || !selectedBrand?.id) return
    setIsResearching(true)
    clearTimeout(toastTimerRef.current)
    try {
      const res = await fetch('/api/enrich-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBrand.id }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Research failed.')
      }
      const { agent, research, country } = await res.json()
      setSelectedBrand(agent)
      // Silently inject new knowledge into the active session
      if (research) {
        sendContext(
          `[KNOWLEDGE BASE UPDATE] The following product and service information has just been researched${country ? ` for ${country}` : ''}. Use it to answer customer questions accurately from now on:\n\n${research}`
        )
      }
      const toastText = country ? `Knowledge updated · ${country} pricing` : 'Knowledge base updated'
      setResearchToast({ text: toastText, type: 'success' })
    } catch (err) {
      setResearchToast({ text: err.message || 'Research failed.', type: 'error' })
    } finally {
      setIsResearching(false)
      toastTimerRef.current = setTimeout(() => setResearchToast(null), 4000)
    }
  }

  function handleEnd() {
    setIsVoiceInputActive(false)
    disconnect()
    const validTranscript = transcript.filter(m => m.text?.trim())
    if (validTranscript.length > 0) {
      saveSession({ brand: selectedBrand, transcript: validTranscript, startedAt: sessionStartedAt })
    }
    setSessionTranscript(transcript)
    setSessionEndedWithError(status === 'error')
    navigate('/summary')
  }

  const isActive = status !== 'idle' && status !== 'error'
  const visualStatus = status

  function switchToMode(mode) {
    if (mode === inputMode) return
    setInputMode(mode)
    if (mode === 'voice' && isActive) {
      resumeAudio()
      setIsVoiceInputActive(true)
    } else if (mode === 'chat') {
      setIsVoiceInputActive(false)
      setTimeout(() => chatInputRef.current?.focus(), 100)
    }
  }

  const handleSendChat = useCallback(() => {
    const msg = chatInput.trim()
    if (!msg || !isActive) return
    sendText(msg)
    setChatInput('')
    chatInputRef.current?.focus()
  }, [chatInput, isActive, sendText])

  const STATE_LABELS = {
    connecting:      'Connecting…',
    listening:       'Listening',
    'user-speaking': 'Hearing you…',
    'agent-speaking': `${selectedBrand.agentName} is speaking`,
    error:           '',
    idle:            '',
  }

  const stateLabel = status === 'error'
    ? (errorMessage?.split('\n')[0] || 'Something went wrong')
    : (STATE_LABELS[status] || '')

  const STATE_LABEL_COLOR = {
    connecting:      'text-cream/50',
    listening:       'text-cream/60',
    'user-speaking': 'text-aurora-blue',
    error:           'text-status-red',
  }

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden"
      style={{ background: '#0E0C1A' }}
    >
      {/* Atmospheric top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedBrand.colors.from}18 0%, transparent 55%)`,
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-safe-or-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
            <BrandLogo brand={selectedBrand} className="w-full h-full" fontSize="0.65rem" />
          </div>
          <span className="text-cream/80 text-[13px] font-medium">{selectedBrand.brandName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Research button — only for dynamic agents */}
          {selectedBrand.id && selectedBrand.sourceUrl && (
            <button
              onClick={handleResearch}
              disabled={isResearching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/[0.06] disabled:opacity-40"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' }}
              aria-label="Research web to update agent knowledge"
            >
              {isResearching ? (
                <div className="w-3 h-3 rounded-full border border-t-transparent border-current animate-spin" />
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              )}
              <span className="text-[10px] font-medium">
                {isResearching ? 'Researching…' : 'Research'}
              </span>
            </button>
          )}
          <button
            onClick={handleEnd}
            className="text-cream/50 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors hover:text-cream/80 border"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            End
          </button>
        </div>
      </div>

      {/* Research toast */}
      {researchToast && (
        <div
          className="relative mx-5 mb-1 px-3 py-2 rounded-xl text-[11px] font-medium text-center animate-fade-in"
          style={researchToast.type === 'success'
            ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC' }
            : { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }
          }
        >
          {researchToast.text}
        </div>
      )}

      {/* Agent compact bar */}
      <div className="relative flex items-center gap-3 px-5 py-2 flex-shrink-0">
        <AgentAvatar status={visualStatus} isMuted={isMuted} brand={selectedBrand} compact />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-cream/90 text-[13px] font-semibold truncate">{selectedBrand.agentName}</span>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border flex-shrink-0"
              style={{
                background: isActive ? `${selectedBrand.colors.from}14` : 'rgba(255,255,255,0.03)',
                borderColor: isActive ? `${selectedBrand.colors.from}33` : 'rgba(255,255,255,0.08)',
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-status-green animate-pulse' : 'bg-cream/30'}`} />
              <span className="text-[10px] tracking-[0.12em] uppercase text-cream/55">
                {isActive ? 'Online' : 'Off'}
              </span>
            </div>
          </div>
          <p
            className={`text-[11px] mt-0.5 font-medium tracking-wide transition-all duration-300 ${STATUS_LABEL_COLOR(status, selectedBrand)}`}
            style={status === 'agent-speaking' ? { color: selectedBrand.colors.label } : undefined}
          >
            {isMuted && isActive ? 'Muted' : stateLabel}
          </p>
        </div>
      </div>

      {/* Waveform — slim */}
      <div className="relative flex-shrink-0 px-6">
        <VoiceWaveform status={visualStatus} brandColor={selectedBrand.colors.from} height={48} />
      </div>

      {/* Transcript zone */}
      <div
        className="relative flex-1 overflow-y-auto px-4 py-2 min-h-0"
        onScroll={handleScroll}
      >
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            {status === 'connecting' && (
              <p className="text-cream/40 text-sm text-center">Starting your session…</p>
            )}
            {status === 'listening' && (
              <p className="text-cream/40 text-sm text-center">Go ahead, I&apos;m listening.</p>
            )}
            {status === 'error' && (
              <div className="w-full max-w-xs rounded-2xl border p-5 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.20)' }}>
                <p className="text-red-400 text-sm font-medium mb-1">Connection failed</p>
                <p className="text-red-400/70 text-xs leading-relaxed whitespace-pre-line">
                  {errorMessage || 'Something went wrong.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-3">
            {transcript.map((msg) => (
              <TranscriptBubble key={msg.id} msg={msg} brand={selectedBrand} />
            ))}
            <div ref={transcriptBottomRef} />
          </div>
        )}
      </div>

      {/* Controls dock */}
      <div
        className="relative flex-shrink-0 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-1 pt-3 px-6">
          {['voice', 'chat'].map((mode) => (
            <button
              key={mode}
              onClick={() => switchToMode(mode)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={inputMode === mode
                ? { background: `${selectedBrand.colors.from}22`, border: `1px solid ${selectedBrand.colors.from}44`, color: selectedBrand.colors.label }
                : { background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.3)' }
              }
            >
              {mode === 'voice' ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )}
              {mode === 'voice' ? 'Voice' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Voice dock */}
        {inputMode === 'voice' && (
          <div className="flex items-center justify-between px-8 py-4 pb-safe-or-5">
            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              disabled={!isActive}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border flex-shrink-0 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 ${isMuted ? 'border-red-500/40' : 'border-white/10'}`}
              style={isMuted ? { background: 'rgba(239,68,68,0.15)' } : { background: 'rgba(255,255,255,0.05)' }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-400">
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cream/50">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {/* Voice indicator — center, always active in voice mode */}
            <div className="relative flex items-center justify-center w-20 h-20">
              {isVoiceInputActive && !isMuted && (
                <>
                  <div className="absolute inset-0 rounded-full border animate-ring-1" style={{ borderColor: `${selectedBrand.colors.from}66` }} />
                  <div className="absolute inset-1 rounded-full border animate-ring-2" style={{ borderColor: `${selectedBrand.colors.from}40` }} />
                </>
              )}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border"
                style={isMuted
                  ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.3)' }
                  : { background: `linear-gradient(145deg, ${selectedBrand.colors.from}, ${selectedBrand.colors.to})`, borderColor: `${selectedBrand.colors.from}88`, color: selectedBrand.colors.avatarText, boxShadow: `0 0 0 8px ${selectedBrand.colors.from}10, 0 16px 32px ${selectedBrand.colors.ring}` }
                }
              >
                <svg width="26" height="20" viewBox="0 0 26 20" fill="currentColor">
                  <rect x="0"  y="7"  width="4" height="6"  rx="2" />
                  <rect x="6"  y="3"  width="4" height="14" rx="2" />
                  <rect x="12" y="0"  width="4" height="20" rx="2" />
                  <rect x="18" y="3"  width="4" height="14" rx="2" />
                  <rect x="24" y="7"  width="2" height="6"  rx="1" />
                </svg>
              </div>
            </div>

            {/* End / Retry */}
            {status === 'error' ? (
              <div className="flex gap-2">
                <button onClick={() => connect()} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all border" style={{ background: `${selectedBrand.colors.from}1A`, borderColor: `${selectedBrand.colors.from}40`, color: selectedBrand.colors.label }} aria-label="Try again">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0 2.34 5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20 4v7h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={handleEnd} className="w-12 h-12 rounded-full flex items-center justify-center text-cream/60 active:scale-95 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }} aria-label="End session">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ) : (
              <button onClick={handleEnd} className="w-12 h-12 rounded-full flex items-center justify-center text-cream/70 active:scale-95 transition-all border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }} aria-label="End conversation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        )}

        {/* Chat dock */}
        {inputMode === 'chat' && (
          <div className="flex items-end gap-2 px-4 py-3 pb-safe-or-5">
            <div
              className="flex-1 flex items-end rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() }
                }}
                placeholder={isActive ? 'Type a message…' : 'Connecting…'}
                disabled={!isActive}
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 text-cream text-[14px] placeholder:text-cream/25 outline-none resize-none leading-snug disabled:opacity-40"
                style={{ maxHeight: '96px' }}
              />
            </div>
            <button
              onClick={handleSendChat}
              disabled={!isActive || !chatInput.trim()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${selectedBrand.colors.from}, ${selectedBrand.colors.to})`, boxShadow: `0 4px 16px ${selectedBrand.colors.ring}` }}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: selectedBrand.colors.avatarText }}>
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Speaker toggle */}
            <button
              onClick={toggleSilent}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all border"
              style={isSilent
                ? { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#F87171' }
                : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
              }
              aria-label={isSilent ? 'Unmute agent' : 'Mute agent'}
              title={isSilent ? 'Agent voice off' : 'Agent voice on'}
            >
              {isSilent ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleEnd}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-cream/50 active:scale-95 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
              aria-label="End conversation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper outside component to avoid recreation on every render
function STATUS_LABEL_COLOR(status, brand) {
  if (status === 'agent-speaking') return ''   // handled via inline style
  if (status === 'user-speaking')  return 'text-aurora-blue'
  if (status === 'error')          return 'text-status-red'
  if (status === 'listening')      return 'text-cream/60'
  if (status === 'connecting')     return 'text-cream/50'
  return 'text-cream/30'
}
