import React, { useState, useEffect } from 'react'
import SkynetLogo from './SkynetLogo'
import ThemeSwitcher from './ThemeSwitcher'
import ThreatMeter from './ThreatMeter'
import PieChart from './PieChart'
import ThreatFeed from './ThreatFeed'
import MarketTable from './MarketTable'
import WorldMap from './WorldMap'
import { THEMES } from '../themes'

function formatTimestamp(date) {
  return date.toISOString().replace('T', ' // ').slice(0, -5) + ' UTC'
}

export default function Dashboard({ data, theme, onThemeChange, wsConnected, muted, onMuteToggle }) {
  const [now, setNow] = useState(new Date())
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!data) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: THEMES[theme]?.primary || '#00ff41',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 16, textShadow: '0 0 10px currentColor',
      }}>
        <span className="blink-cursor">ESTABLISHING UPLINK...</span>
      </div>
    )
  }

  const t = THEMES[theme] || THEMES.terminal
  const compact = width < 900
  const mobile = width < 600

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateRows: '56px auto 1fr 260px',
      gridTemplateColumns: '1fr',
      background: t.bg,
      overflow: 'hidden',
    }}>
      {/* === HEADER === */}
      <header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: mobile ? '0 10px' : '0 20px',
        borderBottom: `1px solid ${t.panelBorder}`,
        color: t.primary,
        fontFamily: "'Orbitron', sans-serif",
        textTransform: 'uppercase', letterSpacing: '2px',
        fontSize: mobile ? 10 : 12,
        position: 'relative', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <SkynetLogo theme={theme} />
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 4,
            textShadow: `0 0 10px ${t.primary}`,
          }}>
            SKYNET//MONITOR
          </span>
          <span style={{
            color: t.dim, fontSize: 10,
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            {wsConnected ? '● UPLINK ACTIVE' : '● UPLINK DEGRADED'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11, color: t.dim,
          }}>
            {formatTimestamp(now)}
          </span>
          <button
            onClick={onMuteToggle}
            style={{
              background: 'none',
              border: `1px solid ${muted ? `${t.primary}40` : t.primary}`,
              color: muted ? `${t.primary}40` : t.primary,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10, textTransform: 'uppercase',
              letterSpacing: 1, padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            title={muted ? 'Unmute alert' : 'Mute alert'}
          >
            <span style={{ fontSize: 14 }}>{muted ? '🔇' : '🔊'}</span>
            {muted ? 'MUTED' : 'ALERT'}
          </button>
          <ThemeSwitcher theme={theme} onChange={onThemeChange} />
        </div>
      </header>

      {/* === THREAT METER === */}
      <div style={{ padding: '8px 12px 0 12px' }}>
        <ThreatMeter
          level={data.threat_level}
          theme={theme}
          stats={data.market_stats}
        />
      </div>

      {/* === GRID: CHARTS + FEED === */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '1fr 380px',
        gridTemplateRows: compact ? 'auto auto' : '1fr',
        gap: 10,
        padding: mobile ? '4px 6px' : '8px 12px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: compact ? '300px auto' : '1fr auto',
          gap: 10,
          overflow: 'hidden',
        }}>
          <PieChart companies={data.companies} theme={theme} />
          <MarketTable companies={data.companies} theme={theme} stats={data.market_stats} />
        </div>
        <div style={{ overflow: 'hidden', minHeight: compact ? 200 : 'auto' }}>
          <ThreatFeed incidents={data.incidents} theme={theme} />
        </div>
      </div>

      {/* === WORLD MAP === */}
      <div style={{
        padding: mobile ? '0 6px 6px 6px' : '0 12px 10px 12px',
        overflow: 'hidden',
        height: mobile ? 200 : 260,
      }}>
        <WorldMap
          companies={data.companies}
          theme={theme}
          threatLevel={data.threat_level}
        />
      </div>
    </div>
  )
}
