import { useEffect, useRef } from 'react'

/**
 * Siri-style colorful waveform that animates based on conversation state.
 * Uses a canvas with multiple layered sine waves and an edge-fade envelope.
 */
export default function VoiceWaveform({ status, brandColor, height = 82 }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const ampRef    = useRef(0)      // current smoothed amplitude (0–1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // DPI-aware sizing
    const dpr = window.devicePixelRatio || 1
    const W   = canvas.offsetWidth  * dpr
    const H   = canvas.offsetHeight * dpr
    canvas.width  = W
    canvas.height = H
    ctx.scale(dpr, dpr)

    const CW = canvas.offsetWidth
    const CH = canvas.offsetHeight
    const CY = CH / 2

    // Target amplitude per status
    function targetAmp() {
      if (status === 'agent-speaking') return 1.0
      if (status === 'user-speaking')  return 0.66
      if (status === 'listening')      return 0.16
      if (status === 'connecting')     return 0.06
      return 0.0
    }

    function paletteForStatus() {
      if (status === 'user-speaking') {
        return ['#60A5FA', '#22D3EE', '#93C5FD', '#FFFFFF']
      }
      if (status === 'agent-speaking') {
        return ['#8B5CF6', '#3B82F6', primary, '#FFFFFF']
      }
      if (status === 'listening') {
        return [primary, '#22D3EE', '#A78BFA', '#FFFFFF']
      }
      return [primary, '#3B82F6', '#8B5CF6', '#FFFFFF']
    }

    // Wave definitions — layered for depth
    // Each: { freqMult, speedMult, ampScale, color, alpha, width }
    const primary   = brandColor || '#06B6D4'
    const palette = paletteForStatus()
    const WAVES = [
      // Back fill — widest, low alpha
      { freqMult: 0.90, speedMult: status === 'listening' ? 0.36 : 0.55, ampScale: 0.90, color: palette[2], alpha: 0.24, width: 2.5 },
      { freqMult: 1.10, speedMult: status === 'listening' ? 0.5 : 0.75, ampScale: 0.80, color: palette[1], alpha: 0.28, width: 2.0 },
      // Mid layer
      { freqMult: 0.75, speedMult: status === 'listening' ? 0.72 : 1.10, ampScale: 0.72, color: palette[2], alpha: 0.34, width: 2.0 },
      { freqMult: 1.25, speedMult: status === 'listening' ? 0.64 : 0.90, ampScale: 0.60, color: palette[0], alpha: 0.42, width: 2.0 },
      // Primary brand wave
      { freqMult: 1.00, speedMult: status === 'listening' ? 0.82 : 1.00, ampScale: 1.00, color: palette[0], alpha: 0.84, width: 2.8 },
      // White highlight — thinnest, highest frequency
      { freqMult: 1.60, speedMult: status === 'listening' ? 1.05 : 1.40, ampScale: 0.35, color: palette[3], alpha: 0.55, width: 1.5 },
    ]

    const BASE_FREQ  = 0.022  // spatial frequency (radians per pixel)
    const BASE_SPEED = 1.8    // time multiplier
    const MAX_AMP    = CH * 0.42  // max peak-to-trough in px

    let t = 0
    let lastTs = null

    function draw(ts) {
      if (!lastTs) lastTs = ts
      const dt = (ts - lastTs) / 1000
      lastTs = ts
      t += dt

      // Lerp amplitude toward target (smooth in/out)
      const target = targetAmp()
      ampRef.current += (target - ampRef.current) * Math.min(dt * 3.5, 1)
      const amp = ampRef.current

      const logicalW = CW
      const logicalH = CH

      ctx.clearRect(0, 0, logicalW, logicalH)

      // Draw a very subtle center baseline when idle
      if (amp < 0.02) {
        ctx.beginPath()
        ctx.moveTo(0, CY)
        ctx.lineTo(logicalW, CY)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.stroke()
        animRef.current = requestAnimationFrame(draw)
        return
      }

      if (status === 'listening') {
        const gradient = ctx.createLinearGradient(0, 0, logicalW, 0)
        gradient.addColorStop(0, 'rgba(255,255,255,0)')
        gradient.addColorStop(0.5, `${primary}22`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, CY - 18, logicalW, 36)
      }

      for (const wave of WAVES) {
        const waveAmp = amp * MAX_AMP * wave.ampScale

        ctx.beginPath()
        ctx.lineWidth = wave.width
        ctx.strokeStyle = wave.color
        ctx.globalAlpha = wave.alpha * Math.min(amp * 2.2, 1)

        for (let x = 0; x <= logicalW; x++) {
          // Sine-bell envelope: 0 at edges, 1 at center
          const env = Math.sin((x / logicalW) * Math.PI)
          const phase = x * BASE_FREQ * wave.freqMult + t * BASE_SPEED * wave.speedMult
          const y = CY + Math.sin(phase) * waveAmp * env

          if (x === 0) ctx.moveTo(x, y)
          else         ctx.lineTo(x, y)
        }

        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [status, brandColor])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height, display: 'block' }}
    />
  )
}
