/**
 * Convert Float32Array PCM samples to Int16Array (16-bit PCM).
 */
export function float32ToInt16(float32) {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}

/**
 * Convert Int16Array (16-bit PCM) to Float32Array.
 */
export function int16ToFloat32(int16) {
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0
  }
  return float32
}

/**
 * Encode an ArrayBuffer to a base64 string.
 */
export function arrayBufferToBase64(buffer) {
  const uint8 = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i])
  }
  return btoa(binary)
}

/**
 * Decode a base64 string to an ArrayBuffer.
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const uint8 = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i)
  }
  return buffer
}
