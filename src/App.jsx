import React, { useState, useEffect, useCallback } from 'react'
import BootScreen from './components/BootScreen'
import ErrorBoundary from './components/ErrorBoundary'
import Scanlines from './components/Scanlines'
import AudioAlert from './components/AudioAlert'
import Dashboard from './components/Dashboard'

export default function App() {
  const [booting, setBooting] = useState(true)
  const [theme, setTheme] = useState('terminal')
  const [data, setData] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [muted, setMuted] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('./data/dashboard.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('[SKYNET] Failed to load data:', err)
    }
  }, [])

  useEffect(() => {
    document.body.className = `theme-${theme}`
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [theme, fetchData])

  const handleBootComplete = () => {
    setBooting(false)
    document.body.classList.remove('booting')
  }

  return (
    <ErrorBoundary>
      <div className={`app theme-${theme}`} style={{
        width: '100%', height: '100%',
        background: '#0a0a0f',
      }}>
        <Scanlines />
        <AudioAlert
          threatLevel={data?.threat_level}
          muted={muted}
          theme={theme}
          booting={booting}
        />
        {booting ? (
          <BootScreen onComplete={handleBootComplete} theme={theme} />
        ) : (
          <Dashboard
            data={data}
            theme={theme}
            onThemeChange={setTheme}
            wsConnected={wsConnected}
            muted={muted}
            onMuteToggle={() => setMuted(m => !m)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
