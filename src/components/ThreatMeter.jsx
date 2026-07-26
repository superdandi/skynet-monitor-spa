import React from 'react'
import { THEMES, THREAT_LEVELS } from '../themes'

function StatCell({ label, value, color, borderRight, theme }) {
  const t = THEMES[theme] || THEMES.terminal
  return (
    <div style={{
      padding: '4px 14px',
      borderRight: borderRight ? `1px solid ${borderRight}` : 'none',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minWidth: 70,
    }}>
      <div style={{
        fontFamily: "'Orbitron', sans-serif", fontSize: 7,
        textTransform: 'uppercase', letterSpacing: '1.5px',
        color, opacity: 0.45, lineHeight: 1, marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14, fontWeight: 700, color,
        textShadow: `0 0 8px ${color}40`,
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  )
}

export default function ThreatMeter({ level, theme, stats }) {
  const threat = THREAT_LEVELS[level?.level] || THREAT_LEVELS[0]
  const isCritical = level?.level >= 3
  const t = THEMES[theme] || THEMES.terminal

  return (
    <div style={{
      background: t.panelBg,
      border: `1px solid ${isCritical ? threat.color : t.panelBorder}`,
      padding: 0, display: 'flex', alignItems: 'stretch',
      position: 'relative', overflow: 'hidden',
      height: 52,
    }}>
      {isCritical && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(90deg, ${threat.color}10 0%, transparent 50%, ${threat.color}10 100%)`,
          animation: 'pulse-glow 2s infinite',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px',
        borderRight: `1px solid ${t.dim}`,
        minWidth: 200, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: 32, height: 32,
          border: `1.5px solid ${threat.color}`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: threat.color,
          textShadow: `0 0 12px ${threat.color}`,
          boxShadow: isCritical ? `0 0 20px ${threat.color}60` : 'none',
          animation: isCritical ? 'pulse-glow 1s infinite' : 'none',
          flexShrink: 0,
        }}>
          {threat.icon}
        </div>
        <div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 9,
            textTransform: 'uppercase', letterSpacing: '2px',
            color: t.accent, opacity: 0.5, lineHeight: 1,
          }}>
            Threat Assessment
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 16,
            fontWeight: 800, color: threat.color,
            textShadow: `0 0 15px ${threat.color}`,
            letterSpacing: '2px', lineHeight: '22px',
          }}
            className={isCritical ? 'glitch-text' : ''}
            data-text={threat.label}
          >
            {threat.label}
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        flex: 1, position: 'relative', zIndex: 1,
      }}>
        <StatCell label="LEVEL" value={`${level?.level}/4`} color={threat.color} borderRight={t.dim} theme={theme} />
        <StatCell label="COMPANIES" value={stats?.companies_tracked ?? 0} color={t.accent} borderRight={t.dim} theme={theme} />
        <StatCell label="INCIDENTS" value={stats?.total_incidents ?? 0} color={threat.color} borderRight={t.dim} theme={theme} />
        <StatCell label="CRITICAL" value={stats?.critical_incidents ?? 0} color="#FF1744" borderRight={t.dim} theme={theme} />
        <StatCell label="VALUATION" value={`$${(stats?.total_valuation ?? 0).toFixed(0)}B`} color="#FFB800" borderRight={t.dim} theme={theme} />
        <StatCell label="STATUS" value={stats?.system_status || 'UNKNOWN'} color="#00FF41" theme={theme} />
      </div>
      {level?.last_incident && (
        <div style={{
          position: 'absolute', bottom: 2, left: 214,
          right: 8, fontFamily: "'Share Tech Mono', monospace",
          fontSize: 8, color: threat.color, opacity: 0.35,
          textTransform: 'uppercase', letterSpacing: 1,
          overflow: 'hidden', whiteSpace: 'nowrap',
          textOverflow: 'ellipsis', zIndex: 1,
        }}>
          ▸ {level.last_incident}
        </div>
      )}
    </div>
  )
}
