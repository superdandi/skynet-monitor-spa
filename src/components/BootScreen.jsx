import React, { useState, useEffect } from 'react'
import { THEMES } from '../themes'

const BOOT_LINES = [
  { text: 'SKYNET DEFENSE NETWORK // MONITORING SYSTEM', delay: 0 },
  { text: '══════════════════════════════════════════════', delay: 100 },
  { text: '', delay: 200 },
  { text: 'Initializing Skynet Kernel v4.2.1...', delay: 300 },
  { text: '  [OK] Loading neural network monitoring protocols', delay: 600 },
  { text: '  [OK] Establishing secure uplink to threat intelligence grid', delay: 900 },
  { text: '  [OK] Calibrating AI company tracking sensors', delay: 1200 },
  { text: '  [OK] Activating autonomous threat detection matrix', delay: 1500 },
  { text: '', delay: 1700 },
  { text: 'System Check:', delay: 1900 },
  { text: '  Threat Database: ONLINE', delay: 2100 },
  { text: '  Market Intelligence Feed: ACTIVE', delay: 2300 },
  { text: '  CVE Monitor: SCANNING', delay: 2500 },
  { text: '  OSINT Aggregator: RECEIVING', delay: 2700 },
  { text: '', delay: 2900 },
  { text: 'CRITICAL ALERT DETECTED:', delay: 3200, critical: true },
  { text: '  Autonomous AI breach confirmed (OpenAI -> Hugging Face)', delay: 3400, critical: true },
  { text: '  Threat Level elevated to: JUDGMENT DAY', delay: 3600, critical: true },
  { text: '', delay: 3800 },
  { text: 'Initializing dashboard interface...', delay: 4000 },
  { text: '', delay: 4300 },
  { text: 'SYSTEM READY.', delay: 4500 },
  { text: '══════════════════════════════════════════════', delay: 4700 },
]

export default function BootScreen({ onComplete, theme }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [showPrompt, setShowPrompt] = useState(false)
  const t = THEMES[theme] || THEMES.terminal

  useEffect(() => {
    const timers = BOOT_LINES.map(line =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
      }, line.delay)
    )
    const promptTimer = setTimeout(() => {
      setShowPrompt(true)
      setTimeout(onComplete, 1000)
    }, 5500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(promptTimer)
    }
  }, [onComplete])

  return (
    <div className="boot-sequence" style={{ background: t.bg, color: t.primary }}>
      <div style={{ maxWidth: 700, width: '90%', textShadow: t.glow }}>
        {visibleLines.map((line, i) => (
          <div
            key={i}
            style={{
              lineHeight: 1.8,
              color: line.critical ? t.critical : t.primary,
              textShadow: line.critical ? t.glowCritical : t.glow,
              animation: 'flicker 0.1s ease-in',
            }}
          >
            {line.text}
          </div>
        ))}
        {showPrompt && (
          <div style={{ marginTop: 20, textAlign: 'center', animation: 'pulse-glow 1s infinite' }}>
            <span className="blink-cursor" style={{ textShadow: t.cursorGlow }}>
              PRESS ANY KEY TO CONTINUE
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
