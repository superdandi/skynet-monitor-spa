import React from 'react'
import { THEMES } from '../themes'

export default function SkynetLogo({ theme }) {
  const color = THEMES[theme]?.primary || '#00ff41'
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
      <polygon points="16,2 30,28 2,28" fill="none" stroke={color} strokeWidth="1.5" />
      <polygon points="16,8 24,24 8,24" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="16" cy="18" r="3" fill={color} opacity="0.8" />
      <line x1="16" y1="2" x2="16" y2="15" stroke={color} strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}
