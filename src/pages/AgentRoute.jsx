import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AgentRoute() {
  const { id } = useParams()
  const { setSelectedBrand } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) { navigate('/', { replace: true }); return }

    fetch(`/api/get-agent?id=${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) throw new Error('Agent not found.')
        return res.json()
      })
      .then(({ agent }) => {
        setSelectedBrand(agent)
        navigate('/lobby', { replace: true })
      })
      .catch(err => {
        setError(err.message || 'Could not load this agent.')
      })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #07060F 0%, #0E0C1A 100%)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-status-red">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-cream text-[16px] font-semibold font-display mb-2">Agent not found</p>
        <p className="text-cream/40 text-sm mb-6 leading-relaxed max-w-[240px]">
          This link may have expired or the agent was removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium px-5 py-3 rounded-2xl active:scale-[0.98] transition-transform"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Go to home
        </button>
      </div>
    )
  }

  // Loading state
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(180deg, #07060F 0%, #0E0C1A 100%)' }}
    >
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent border-cream/30 animate-spin-slow"
      />
      <p className="text-cream/30 text-sm mt-4">Loading agent…</p>
    </div>
  )
}
