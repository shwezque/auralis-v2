import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Home from './pages/Home'
import CreateAgent from './pages/CreateAgent'
import AgentRoute from './pages/AgentRoute'
import Lobby from './pages/Lobby'
import Session from './pages/Session'
import Summary from './pages/Summary'
import History from './pages/History'
import HistoryDetail from './pages/HistoryDetail'

function AppRoutes() {
  const { selectedBrand, sessionTranscript } = useApp()

  return (
    <Routes>
      {/* Home — hero + create CTA + demo agents */}
      <Route path="/" element={<Home />} />

      {/* Create a new agent from a URL */}
      <Route path="/create" element={<CreateAgent />} />

      {/* Share link — loads agent from KV, redirects to lobby */}
      <Route path="/agent/:id" element={<AgentRoute />} />

      {/* Lobby: requires brand selection */}
      <Route
        path="/lobby"
        element={selectedBrand ? <Lobby /> : <Navigate to="/" replace />}
      />

      {/* Session: requires brand selection */}
      <Route
        path="/session"
        element={selectedBrand ? <Session /> : <Navigate to="/" replace />}
      />

      {/* Summary: requires a transcript */}
      <Route
        path="/summary"
        element={
          sessionTranscript.length > 0
            ? <Summary />
            : <Navigate to="/lobby" replace />
        }
      />

      {/* Session history */}
      <Route path="/history" element={<History />} />
      <Route path="/history/:id" element={<HistoryDetail />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
