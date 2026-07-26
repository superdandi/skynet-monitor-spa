import React from 'react'
import { THEMES } from '../themes'

export default function ThemeSwitcher({ theme, onChange }) {
  const options = [
    { id: 'terminal', label: 'TERMINAL', desc: 'Matrix' },
    { id: 'hud', label: 'HUD', desc: 'T-800' },
    { id: 'cyberpunk', label: 'CYBERPUNK', desc: 'Mixed' },
  ]
  const t = THEMES[theme] || THEMES.terminal

  return (
    <div style={{
      display: 'flex', gap: 4,
      border: `1px solid ${t.panelBorder}`,
      padding: 2, background: t.panelBg,
    }}>
      {options.map(opt => {
        const active = theme === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              border: 'none', padding: '4px 10px',
              fontSize: 9,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              ...(active
                ? { background: t.primary, color: '#000', boxShadow: `0 0 10px ${t.primary}` }
                : { background: 'transparent', color: t.primary }
              ),
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
