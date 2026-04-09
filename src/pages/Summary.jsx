import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BrandLogo from '../components/BrandLogo'

function formatTimestamp(ms) {
  const totalSecs = Math.floor((ms || 0) / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function TranscriptBubble({ msg, brand }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 px-1">
        {!isUser && brand && (
          <div
            className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
          >
            <span className="text-xs font-bold font-display leading-none" style={{ color: brand.colors.avatarText }}>{brand.agentInitial}</span>
            {brand.avatar && (
              <img src={brand.avatar} alt={brand.agentInitial} className="absolute inset-0 w-full h-full object-cover object-center" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
          </div>
        )}
        <span className="text-cream/40 text-xs">
          {isUser ? 'You' : (brand?.agentName || 'Agent')} · {formatTimestamp(msg.ts)}
        </span>
      </div>
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'text-cream rounded-tr-sm' : 'text-cream/90 rounded-tl-sm border'}`}
        style={isUser
          ? { background: brand ? `${brand.colors.from}26` : 'rgba(255,255,255,0.08)', border: `1px solid ${brand ? brand.colors.from + '33' : 'rgba(255,255,255,0.10)'}` }
          : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }
        }
      >
        {msg.text}
      </div>
    </div>
  )
}

export default function Summary() {
  const { sessionTranscript, sessionEndedWithError, selectedBrand, setSelectedBrand, setSessionTranscript } = useApp()
  const navigate = useNavigate()

  function handleStartNew() {
    setSessionTranscript([])
    navigate('/lobby')
  }

  function handleChangeBrand() {
    setSessionTranscript([])
    setSelectedBrand(null)
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>
      {/* Header */}
      <div className="flex flex-col items-center pt-safe-or-6 pb-4 px-5 flex-shrink-0">
        {selectedBrand && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
              <BrandLogo brand={selectedBrand} className="w-full h-full" fontSize="0.65rem" />
            </div>
            <span className="text-cream/70 text-[13px] font-medium">{selectedBrand.brandName}</span>
          </div>
        )}
        <h1 className="text-cream text-lg font-semibold font-display tracking-tight">Conversation ended</h1>

        {/* Show a contextual note if the session ended due to an error */}
        {sessionEndedWithError && (
          <p className="text-red-400/80 text-xs text-center mt-2 leading-relaxed">
            Session ended due to a connection issue. Try starting a new conversation.
          </p>
        )}
      </div>

      {/* Transcript section label */}
      <div className="px-5 pb-2 flex-shrink-0">
        <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em]">
          Your conversation with {selectedBrand?.agentName || 'the agent'}
        </p>
      </div>

      {/* Transcript readback */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {sessionTranscript.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-cream/40 text-sm text-center">Nothing was captured in this conversation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {sessionTranscript.map((msg) => (
              <TranscriptBubble key={msg.id} msg={msg} brand={selectedBrand} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-5 pb-safe-or-8 flex flex-col gap-2.5 flex-shrink-0 border-t border-white/[0.05]">
        <button
          onClick={handleStartNew}
          className="w-full font-semibold text-[15px] py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={selectedBrand ? {
            background: `linear-gradient(135deg, ${selectedBrand.colors.from}, ${selectedBrand.colors.to})`,
            color: selectedBrand.colors.avatarText,
            boxShadow: `0 8px 24px ${selectedBrand.colors.ring}`,
          } : {
            background: 'linear-gradient(135deg, #E8B84B, #C4922A)',
            color: '#050D1A',
          }}
        >
          Talk to {selectedBrand?.agentName || 'Agent'} Again
        </button>
        <button
          onClick={handleChangeBrand}
          className="w-full text-cream/40 text-[13px] text-center py-2.5 hover:text-cream/70 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
