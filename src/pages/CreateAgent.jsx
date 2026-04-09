import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { saveAgent, getMyAgents } from '../lib/agentStore'
import { BRAND_LIST } from '../lib/brands'

const STEPS = {
  INPUT: 'input',
  CRAWLING: 'crawling',
  BUILDING: 'building',
  READY: 'ready',
}

const PROGRESS_LABELS = {
  [STEPS.CRAWLING]: 'Crawling your website…',
  [STEPS.BUILDING]: 'Building your agent…',
  [STEPS.READY]:    'Agent ready.',
}

function normaliseUrl(raw) {
  const s = raw.trim()
  if (!s) return ''
  return s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`
}

function AgentPreviewCard({ agent }) {
  const { agentName, agentRole, brandName, agentInitial, colors, tagline } = agent
  return (
    <div
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold font-display"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          color: colors.avatarText,
          boxShadow: `0 8px 24px ${colors.ring}`,
        }}
      >
        {agentInitial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-[16px] font-semibold font-display leading-tight">{agentName}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.label }}>{agentRole} · {brandName}</p>
        {tagline && <p className="text-cream/40 text-[11px] mt-1.5 leading-snug">{tagline}</p>}
      </div>
    </div>
  )
}

function ProgressDot({ active, done }) {
  if (done) return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-status-green/20 flex-shrink-0">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
  if (active) return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
      <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-cream/60 animate-spin" />
    </div>
  )
  return <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
}

export default function CreateAgent() {
  const navigate = useNavigate()
  const { setSelectedBrand } = useApp()
  const [step, setStep] = useState(STEPS.INPUT)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [agent, setAgent] = useState(null)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  async function handleCreate() {
    const normUrl = normaliseUrl(url)
    if (!normUrl) { setError('Please enter your website URL.'); return }
    try { new URL(normUrl) } catch { setError('That doesn\'t look like a valid URL.'); return }

    setError('')
    setStep(STEPS.CRAWLING)

    try {
      // Step 1: Crawl
      const crawlRes = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normUrl }),
      })

      if (!crawlRes.ok) {
        const err = await crawlRes.json().catch(() => ({}))
        throw new Error(err.error || 'Could not fetch your website.')
      }

      const { content, meta } = await crawlRes.json()

      // Step 2: Build agent
      setStep(STEPS.BUILDING)

      const createRes = await fetch('/api/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normUrl,
          content,
          meta,
          existingNames: [
            ...getMyAgents().map(a => a.agentName),
            ...BRAND_LIST.map(b => b.agentName),
          ],
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || 'Could not build your agent.')
      }

      const { id, agent: createdAgent } = await createRes.json()

      // Save to creator's local list
      saveAgent(createdAgent)

      const link = `${window.location.origin}/agent/${id}`
      setAgent(createdAgent)
      setShareLink(link)
      setStep(STEPS.READY)
    } catch (err) {
      setStep(STEPS.INPUT)
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  function handleTalk() {
    setSelectedBrand(agent)
    navigate('/lobby')
  }

  const isCrawling = step === STEPS.CRAWLING
  const isBuilding = step === STEPS.BUILDING
  const isReady = step === STEPS.READY
  const isProcessing = isCrawling || isBuilding

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #07060F 0%, #0E0C1A 100%)' }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[280px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className={`relative flex flex-col flex-1 w-full max-w-[30rem] mx-auto px-5 ${isProcessing ? 'overflow-hidden' : 'overflow-y-auto'}`}>

        {/* Header */}
        <div className="flex items-center gap-3 pt-safe-or-6 pb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 hover:bg-white/[0.06] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-cream/60">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-cream text-[17px] font-semibold font-display tracking-tight">Create agent</h1>
            <p className="text-cream/30 text-[11px] mt-0.5">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        {/* Step: INPUT */}
        {step === STEPS.INPUT && (
          <div className="flex flex-col flex-1 animate-fade-in">
            <div className="mb-8">
              <h2 className="text-cream text-[22px] font-bold font-display tracking-tight leading-tight mb-2">
                What&apos;s your website?
              </h2>
              <p className="text-cream/45 text-sm leading-relaxed">
                We&apos;ll read your site and build a voice AI agent that knows your business.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 px-4 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-cream/30 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <input
                  ref={inputRef}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="yourcompany.com"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="flex-1 bg-transparent py-4 text-cream text-[15px] placeholder:text-cream/20 outline-none"
                />
              </div>

              {error && (
                <p className="text-status-red text-xs px-1 animate-fade-in">{error}</p>
              )}

              <button
                onClick={handleCreate}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-transform mt-1"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 28px rgba(99,102,241,0.3)',
                }}
              >
                Build my agent
              </button>
            </div>

            {/* What happens */}
            <div className="mt-10">
              <p className="text-cream/25 text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">What happens next</p>
              {[
                { label: 'We crawl your site', desc: 'Up to 6 pages — home, about, support, and more' },
                { label: 'We understand the content', desc: 'Builds a system prompt from your real product info' },
                { label: 'You get a share link', desc: 'Anyone can open it and talk to your agent' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-aurora-indigo mt-[6px] flex-shrink-0" />
                  <div>
                    <p className="text-cream/70 text-[13px] font-medium">{label}</p>
                    <p className="text-cream/35 text-xs mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: CRAWLING / BUILDING */}
        {isProcessing && (
          <div className="flex flex-col flex-1 items-center justify-center animate-fade-in pb-16">
            {/* Pulsing orb */}
            <div className="relative mb-10">
              <div
                className="absolute inset-0 rounded-full animate-ring-1 opacity-30"
                style={{ background: 'rgba(99,102,241,0.4)' }}
              />
              <div
                className="absolute inset-0 rounded-full animate-ring-2 opacity-20"
                style={{ background: 'rgba(99,102,241,0.3)' }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center animate-orb-breathe"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 1 0 10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Progress steps */}
            <div className="w-full max-w-[260px] flex flex-col gap-4">
              {[
                { key: STEPS.CRAWLING, label: PROGRESS_LABELS[STEPS.CRAWLING] },
                { key: STEPS.BUILDING, label: PROGRESS_LABELS[STEPS.BUILDING] },
                { key: STEPS.READY,    label: PROGRESS_LABELS[STEPS.READY] },
              ].map(({ key, label }) => {
                const stepOrder = [STEPS.CRAWLING, STEPS.BUILDING, STEPS.READY]
                const currentIdx = stepOrder.indexOf(step)
                const thisIdx = stepOrder.indexOf(key)
                const isActive = thisIdx === currentIdx
                const isDone = thisIdx < currentIdx
                return (
                  <div key={key} className="flex items-center gap-3">
                    <ProgressDot active={isActive} done={isDone} />
                    <p className={`text-[13px] font-medium transition-colors ${
                      isActive ? 'text-cream' : isDone ? 'text-cream/40' : 'text-cream/20'
                    }`}>
                      {label}
                    </p>
                  </div>
                )
              })}
            </div>

            <p className="text-cream/25 text-xs mt-10">This takes about 10–20 seconds</p>
          </div>
        )}

        {/* Step: READY */}
        {isReady && agent && (
          <div className="flex flex-col flex-1 animate-slide-up">
            {/* Success badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-status-green/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-status-green text-sm font-medium">Agent ready</p>
            </div>

            {/* Agent preview */}
            <AgentPreviewCard agent={agent} />

            {/* Share link */}
            <div className="mt-5">
              <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] mb-2">Share link</p>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <p className="flex-1 text-cream/60 text-xs truncate font-mono">{shareLink}</p>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={copied
                    ? { background: 'rgba(52,211,153,0.15)', color: '#34D399' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }
                  }
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-cream/25 text-[11px] mt-2 leading-snug">
                Anyone with this link can talk to your agent. Link expires after 90 days.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleTalk}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${agent.colors.from}, ${agent.colors.to})`,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 28px ${agent.colors.ring}`,
                }}
              >
                Talk to {agent.agentName}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 rounded-2xl text-[14px] font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                Back to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
