import React from 'react'
import { THEMES } from '../themes'

export default function MarketTable({ companies, theme, stats }) {
  const t = THEMES[theme] || THEMES.terminal
  const sorted = [...(companies || [])].sort((a, b) => (b.market_share || 0) - (a.market_share || 0))

  return (
    <div style={{
      background: t.panelBg, border: `1px solid ${t.panelBorder}`,
      padding: '10px 14px', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', maxHeight: 180,
    }} className="panel">
      <div style={{
        fontFamily: "'Orbitron', sans-serif", fontSize: 10,
        textTransform: 'uppercase', letterSpacing: '3px',
        color: t.primary, marginBottom: 8,
        textShadow: `0 0 8px ${t.primary}`,
      }}>
        Market Intelligence
      </div>
      <div className="feed-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sorted.map((c, i) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '18px 1fr auto auto',
            gap: 6, alignItems: 'center', padding: '3px 4px',
            borderBottom: `1px solid ${t.dim}`,
            fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
          }}>
            <span style={{ color: t.primary, opacity: 0.3, fontSize: 9 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{
              color: t.primary,
              fontWeight: c.threat_score === 'CRITICAL' ? 700 : 400,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {c.name.toUpperCase()}
            </span>
            <span style={{
              color: c.market_share ? t.primary : `${t.primary}40`,
              opacity: c.market_share ? 1 : 0.3,
              textAlign: 'right', minWidth: 36,
            }}>
              {c.market_share ? `${c.market_share}%` : 'N/A'}
            </span>
            <span style={{
              color: c.valuation_b ? '#FFB800' : `${t.primary}40`,
              opacity: c.valuation_b ? 1 : 0.3,
              textAlign: 'right', minWidth: 50,
            }}>
              {c.valuation_b ? `$${c.valuation_b}B` : 'N/A'}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 6, paddingTop: 6,
        borderTop: `1px solid ${t.dim}`,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
      }}>
        <span style={{ color: t.primary, opacity: 0.5 }}>
          Total: <span style={{ color: '#FFB800' }}>${(stats?.total_valuation || 0).toFixed(0)}B</span>
        </span>
        <span style={{ color: t.primary, opacity: 0.5 }}>
          Status: <span style={{ color: '#00FF41' }}>{stats?.system_status || 'UNKNOWN'}</span>
        </span>
      </div>
    </div>
  )
}
