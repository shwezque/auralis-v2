import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ActivityHandling,
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  TurnCoverage,
} from '@google/genai'
import { useAudioPlayback } from './useAudioPlayback'
import { useAudioCapture } from './useAudioCapture'

/**
 * Status values:
 *   idle          — not connected
 *   connecting    — establishing session
 *   listening     — connected, waiting for user speech
 *   user-speaking — VAD detected user speech
 *   agent-speaking — model streaming audio
 *   error         — connection or permission error
 */

// Ordered from best voice quality to broadest compatibility.
const GEMINI_LIVE_MODELS = [
  'gemini-2.5-flash-native-audio-preview-12-2025',
  'gemini-2.5-flash-preview-native-audio-dialog',
  'gemini-live-2.5-flash-preview',
]
const LIVE_TOKEN_ENDPOINT = '/api/live-token'

function classifyError(err, agentName) {
  const msg = err?.message || String(err) || ''
  if (msg.includes('live token')) {
    return "Couldn't start the voice session because the server token request failed."
  }
  if (msg.includes('API key') || msg.includes('INVALID_ARGUMENT') || msg.includes('403') || msg.includes('401')) {
    return "Couldn't connect — your API key may be invalid."
  }
  if (msg.includes('network') || msg.includes('WebSocket') || msg.includes('1006') || msg.includes('connection')) {
    return 'Connection lost. Check your internet and try again.'
  }
  if (msg.includes('microphone') || msg.includes('NotAllowed') || msg.includes('Permission')) {
    return `Microphone access is required to talk to ${agentName}.\nPlease allow mic access in your browser settings.`
  }
  return 'Something went wrong. Tap to try again.'
}

async function getLiveCredential(fallbackApiKey) {
  try {
    const response = await fetch(LIVE_TOKEN_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`live token request failed (${response.status})`)
    }

    const payload = await response.json()
    if (!payload?.token) {
      throw new Error('live token response was missing token')
    }

    return payload.token
  } catch (err) {
    if (fallbackApiKey) {
      console.warn('[GeminiLive] Falling back to client API key:', err)
      return fallbackApiKey
    }
    throw new Error('live token request failed')
  }
}

export function useGeminiLive({
  apiKey,
  systemPrompt,
  voice = 'Aoede',
  agentName = 'the agent',
  canSendAudio = true,
}) {
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isSilent, setIsSilent] = useState(false)
  const isSilentRef = useRef(false)

  const sessionRef = useRef(null)
  const isMutedRef = useRef(false)
  const statusRef = useRef('idle')
  const canSendAudioRef = useRef(canSendAudio)
  const sessionStartRef = useRef(null)
  const { playChunk, stopAll, resumeAudio } = useAudioPlayback()
  const handleMessageRef = useRef(null)

  // Background session pre-warming (keeps context fresh, no user-perceived delay)
  const bgSessionRef = useRef(null)
  const bgWarmingRef = useRef(false)
  const pendingSwapRef = useRef(false)
  const agentTurnStartedRef = useRef(false)
  const transcriptRef = useRef([])

  // Keep muted + silent refs in sync
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  useEffect(() => { isSilentRef.current = isSilent }, [isSilent])
  // Keep status and canSendAudio refs in sync for use in stable callbacks
  useEffect(() => { statusRef.current = status }, [status])
  useEffect(() => { canSendAudioRef.current = canSendAudio }, [canSendAudio])
  // Keep transcript ref in sync for bg session context building
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  // --- Transcript helpers ---

  function elapsedMs() {
    return sessionStartRef.current ? Date.now() - sessionStartRef.current : 0
  }

  function appendUserText(text) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'user' && !last.complete) {
        // Gemini sends inputTranscription as incremental deltas — concatenate directly.
        // Never inject spaces: the API already includes correct spacing in the text stream.
        return [...prev.slice(0, -1), { ...last, text: (last.text || '') + text }]
      }
      return [...prev, { id: `u-${Date.now()}`, role: 'user', text, ts: elapsedMs(), complete: false }]
    })
  }

  function appendAgentText(text) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'agent' && !last.complete) {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }]
      }
      return [...prev, { id: `a-${Date.now()}`, role: 'agent', text, ts: elapsedMs(), complete: false }]
    })
  }

  function completeLastTurn() {
    setTranscript((prev) =>
      prev.map((msg, i) => (i === prev.length - 1 ? { ...msg, complete: true } : msg))
    )
  }

  // --- Background session helpers ---

  function makeLiveConfig(prompt) {
    return {
      responseModalities: [Modality.AUDIO],
      enableAffectiveDialog: true,
      systemInstruction: { parts: [{ text: prompt }] },
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      realtimeInputConfig: {
        activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
        turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
        automaticActivityDetection: {
          disabled: false,
          startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
          endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_MEDIUM,
          prefixPaddingMs: 100,
          silenceDurationMs: 150,
        },
      },
    }
  }

  function buildCondensedPrompt() {
    const turns = transcriptRef.current.filter(t => t.complete && t.text?.trim()).slice(-4)
    if (!turns.length) return systemPrompt
    const ctx = turns.map(t =>
      `${t.role === 'user' ? 'Customer' : 'Agent'}: ${t.text.trim()}`
    ).join('\n')
    return `${systemPrompt}\n\n## Continuing conversation (context only — do not repeat):\n${ctx}\n\nContinue naturally from where you left off.`
  }

  function doSwap() {
    if (!bgSessionRef.current) return
    const old = sessionRef.current
    sessionRef.current = bgSessionRef.current
    bgSessionRef.current = null
    bgWarmingRef.current = false
    pendingSwapRef.current = false
    agentTurnStartedRef.current = false
    sessionStartRef.current = Date.now()
    if (old && old !== sessionRef.current) {
      try { old.close() } catch (_) {}
    }
  }

  async function warmBgSession() {
    if (bgWarmingRef.current || !sessionRef.current) return
    bgWarmingRef.current = true
    try {
      const liveCredential = await getLiveCredential(apiKey)
      const ai = new GoogleGenAI({ apiKey: liveCredential, httpOptions: { apiVersion: 'v1alpha' } })
      const condensedPrompt = buildCondensedPrompt()
      let bgSession = null
      for (const model of GEMINI_LIVE_MODELS) {
        try {
          bgSession = await ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                bgSessionRef.current = bgSession
                if (pendingSwapRef.current) doSwap()
              },
              onmessage: stableOnMessage,
              onerror: () => { bgSessionRef.current = null; bgWarmingRef.current = false },
              onclose: () => {
                if (bgSessionRef.current === bgSession) {
                  bgSessionRef.current = null; bgWarmingRef.current = false
                }
              },
            },
            config: makeLiveConfig(condensedPrompt),
          })
          break
        } catch (err) {
          console.warn(`[GeminiLive] bg warmup failed with ${model}:`, err)
        }
      }
    } catch (err) {
      console.warn('[GeminiLive] bg warmup error:', err)
      bgWarmingRef.current = false
    }
  }

  // --- Message handler ---

  function handleMessage(message) {
    const content = message.serverContent
    if (!content) return

    // Audio from model turn
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          setStatus('agent-speaking')
          if (!isSilentRef.current) {
            playChunk(part.inlineData.data)
          }
          // Start warming fresh bg session on first chunk — gives us the full
          // agent speaking window to connect before the user's next turn.
          if (!agentTurnStartedRef.current) {
            agentTurnStartedRef.current = true
            warmBgSession()
          }
        }
      }
    }

    // User speech transcription
    if (content.inputTranscription?.text) {
      setStatus('user-speaking')
      appendUserText(content.inputTranscription.text)
    }

    // Agent output transcription — mark user turn complete first
    if (content.outputTranscription?.text) {
      setTranscript(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'user' && !last.complete) {
          return [...prev.slice(0, -1), { ...last, complete: true }]
        }
        return prev
      })
      appendAgentText(content.outputTranscription.text)
    }

    // User barged in — model interrupted; swap to fresh session
    if (content.interrupted) {
      stopAll()
      setStatus('listening')
      agentTurnStartedRef.current = false
      if (bgSessionRef.current) { doSwap() } else { pendingSwapRef.current = true }
    }

    // Model finished its turn — swap to fresh session
    if (content.turnComplete) {
      completeLastTurn()
      setStatus('listening')
      agentTurnStartedRef.current = false
      if (bgSessionRef.current) { doSwap() } else { pendingSwapRef.current = true }
    }
  }

  handleMessageRef.current = handleMessage

  const stableOnMessage = useCallback((msg) => {
    handleMessageRef.current(msg)
  }, [])

  // --- Inject context silently (no transcript bubble) ---
  const sendContext = useCallback((contextText) => {
    if (!sessionRef.current || !contextText.trim()) return
    try {
      sessionRef.current.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: contextText.trim() }] }],
        turnComplete: true,
      })
    } catch (err) {
      console.error('[GeminiLive] sendContext error:', err)
    }
  }, [])

  // --- Send text message ---
  const sendText = useCallback((text) => {
    if (!sessionRef.current || !text.trim()) return
    // Append user message to transcript immediately
    setTranscript((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: text.trim(), ts: elapsedMs(), complete: true },
    ])
    try {
      sessionRef.current.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: text.trim() }] }],
        turnComplete: true,
      })
    } catch (err) {
      console.error('[GeminiLive] sendClientContent error:', err)
    }
  }, [])

  // --- Send audio (respects mute) ---
  const sendAudioChunk = useCallback((base64data) => {
    if (!sessionRef.current || isMutedRef.current || !canSendAudio) return
    try {
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64data, mimeType: 'audio/pcm;rate=16000' },
      })
    } catch (err) {
      console.error('[GeminiLive] sendRealtimeInput error:', err)
    }
  }, [canSendAudio])

  const handleCaptureError = useCallback((err) => {
    stopAll()
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch (_) {}
      sessionRef.current = null
    }
    setErrorMessage(classifyError(err, agentName))
    setStatus('error')
  }, [agentName, stopAll])

  // Local VAD: update visual status only — do NOT cut audio.
  // Premature stopAll() here interrupts the agent mid-sentence because the mic
  // picks up speaker output (echo) even with echoCancellation enabled on mobile.
  // The server sends content.interrupted when a real barge-in is confirmed.
  const handleLocalVoiceActivity = useCallback((isVoiceActive) => {
    if (!canSendAudioRef.current) return
    if (isVoiceActive && statusRef.current === 'agent-speaking') {
      setStatus('user-speaking')
    }
  }, [])

  // --- Audio capture (only active when user has enabled voice input) ---
  // Keeping the mic off until explicitly activated avoids iOS audio session
  // conflicts and unnecessary battery drain in chat-only mode.
  useAudioCapture({
    onChunk: sendAudioChunk,
    isActive: canSendAudio && status !== 'idle' && status !== 'connecting' && status !== 'error',
    onError: handleCaptureError,
    onVoiceActivity: handleLocalVoiceActivity,
  })

  // --- Connect ---
  const connect = useCallback(async () => {
    setStatus('connecting')
    setErrorMessage(null)
    setIsMuted(false)
    sessionStartRef.current = null

    // Prime the AudioContext early — must be called within the user-gesture call
    // stack on iOS/Safari or the context will be created in suspended state.
    await resumeAudio()

    try {
      const liveCredential = await getLiveCredential(apiKey)
      const ai = new GoogleGenAI({
        apiKey: liveCredential,
        httpOptions: { apiVersion: 'v1alpha' },
      })

      let session = null
      let lastError = null

      for (const model of GEMINI_LIVE_MODELS) {
        try {
          session = await ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                sessionStartRef.current = Date.now()
                setStatus('listening')
              },
              onmessage: stableOnMessage,
              onerror: (e) => {
                console.error('[GeminiLive] error:', e)
                setErrorMessage(classifyError(e, agentName))
                setStatus('error')
                sessionRef.current = null
              },
              onclose: () => {
                if (status !== 'idle') setStatus('idle')
                sessionRef.current = null
              },
            },
            config: makeLiveConfig(systemPrompt),
          })
          break
        } catch (err) {
          lastError = err
          console.warn(`[GeminiLive] failed to connect with model ${model}:`, err)
        }
      }

      if (!session) {
        throw lastError || new Error('No supported Gemini Live model was available.')
      }

      sessionRef.current = session
    } catch (err) {
      console.error('[GeminiLive] connect error:', err)
      setErrorMessage(classifyError(err, agentName))
      setStatus('error')
      sessionRef.current = null
    }
  }, [apiKey, systemPrompt, voice, agentName, stableOnMessage, resumeAudio])

  // --- Disconnect ---
  const disconnect = useCallback(() => {
    stopAll()
    if (bgSessionRef.current) {
      try { bgSessionRef.current.close() } catch (_) {}
      bgSessionRef.current = null
    }
    bgWarmingRef.current = false
    pendingSwapRef.current = false
    agentTurnStartedRef.current = false
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch (_) {}
      sessionRef.current = null
    }
    setStatus('idle')
    setIsMuted(false)
  }, [stopAll])

  // --- Mute toggle ---
  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll()
      if (bgSessionRef.current) { try { bgSessionRef.current.close() } catch (_) {} }
      if (sessionRef.current) { try { sessionRef.current.close() } catch (_) {} }
    }
  }, [stopAll])

  const toggleSilent = useCallback(() => {
    setIsSilent(s => {
      if (!s) stopAll() // stop any playing audio when going silent
      return !s
    })
  }, [stopAll])

  return { status, transcript, errorMessage, isMuted, isSilent, connect, disconnect, toggleMute, toggleSilent, sendText, sendContext, resumeAudio }
}
