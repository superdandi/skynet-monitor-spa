import React, { useRef, useEffect } from 'react'
import { THEMES, SEVERITY_COLORS } from '../themes'

export default function ThreatFeed({ incidents, theme }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [incidents])

  const t = THEMES[theme] || THEMES.terminal

  return (
    <div style={{
      background: t.panelBg, border: `1px solid ${t.panelBorder}`,
      padding: 16, display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }} className="panel">
      <div style={{
        fontFamily: "'Orbitron', sans-serif", fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '3px',
        color: t.primary, marginBottom: 12,
        textShadow: `0 0 10px ${t.primary}`,
      }}>
        Threat Feed
      </div>
      <div ref={scrollRef} className="feed-scroll" style={{
        flex: 1, overflowY: 'auto', display: 'flex',
        flexDirection: 'column', gap: 8,
      }}>
        {incidents.map((inc, i) => {
          const sev = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.LOW
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${sev.color}40`,
                background: sev.bg, padding: 10,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11, lineHeight: 1.5,
                cursor: 'pointer', transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = sev.color; e.currentTarget.style.boxShadow = `0 0 10px ${sev.color}30` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${sev.color}40`; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: sev.color, fontSize: 14, textShadow: `0 0 8px ${sev.color}` }}>{sev.icon}</span>
                  <span style={{ color: sev.color, fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }}>{inc.severity}</span>
                  {inc.company && (
                    <span style={{ color: t.primary, opacity: 0.5, fontSize: 9 }}>[{inc.company}]</span>
                  )}
                </div>
                <span style={{ color: t.primary, opacity: 0.4, fontSize: 9 }}>{inc.date}</span>
              </div>
              <div style={{ color: t.primary, fontWeight: 700, marginBottom: 4, fontSize: 12 }}>
                {inc.title}
              </div>
              <div style={{ color: t.primary, opacity: 0.7, fontSize: 10, lineHeight: 1.4 }}>
                {inc.summary}
              </div>
              <div style={{ marginTop: 6, fontSize: 9, color: t.primary, opacity: 0.3 }}>
                Source: {inc.source}
              </div>
              {inc.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {inc.tags.map((tag, j) => (
                    <span key={j} style={{
                      background: `${sev.color}20`, color: sev.color,
                      padding: '1px 6px', fontSize: 8,
                      textTransform: 'uppercase', letterSpacing: 1,
                      border: `1px solid ${sev.color}40`,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
