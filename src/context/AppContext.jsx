import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

const SESSION_BRAND_KEY = 'auralis_brand'

function readStoredBrand() {
  try {
    const raw = sessionStorage.getItem(SESSION_BRAND_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  // Optional browser-side fallback for local development.
  // Production should use the server-issued ephemeral token endpoint.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''

  // selectedBrand is persisted to sessionStorage so a page refresh within
  // the same tab returns the user to their brand rather than BrandPicker.
  const [selectedBrand, _setSelectedBrand] = useState(readStoredBrand)

  function setSelectedBrand(brand) {
    if (brand) {
      sessionStorage.setItem(SESSION_BRAND_KEY, JSON.stringify(brand))
    } else {
      sessionStorage.removeItem(SESSION_BRAND_KEY)
    }
    _setSelectedBrand(brand)
  }

  const [sessionTranscript, setSessionTranscript] = useState([])
  const [sessionEndedWithError, setSessionEndedWithError] = useState(false)
  const [sessionStartedAt, setSessionStartedAt] = useState(null)

  return (
    <AppContext.Provider value={{
      apiKey,
      selectedBrand, setSelectedBrand,
      sessionTranscript, setSessionTranscript,
      sessionEndedWithError, setSessionEndedWithError,
      sessionStartedAt, setSessionStartedAt,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
