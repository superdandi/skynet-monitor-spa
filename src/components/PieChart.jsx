import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { THEMES, COMPANY_COLORS } from '../themes'

Chart.register(...registerables, ChartDataLabels)

export default function PieChart({ companies, theme }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!companies || companies.length === 0) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (chartRef.current) chartRef.current.destroy()

    const t = THEMES[theme] || THEMES.terminal
    const color = t.primary
    const border = t.panelBorder

    const sorted = [...companies].filter(c => c.market_share > 0)
      .sort((a, b) => b.market_share - a.market_share)

    chartRef.current = new Chart(ctx, {
      type: 'pie',
      plugins: [ChartDataLabels],
      data: {
        labels: sorted.map(c => c.name.toUpperCase()),
        datasets: [{
          data: sorted.map(c => c.market_share),
          backgroundColor: sorted.map(c => COMPANY_COLORS[c.slug] || '#666'),
          borderColor: border,
          borderWidth: 2,
          hoverOffset: 18,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 5, left: 10, right: 10 } },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color,
              font: { family: "'Share Tech Mono', monospace", size: 10 },
              padding: 10, boxWidth: 12, usePointStyle: true, pointStyle: 'rectRounded',
            },
          },
          tooltip: {
            backgroundColor: theme === 'hud' ? '#1a0000'
              : theme === 'terminal' ? '#0a1a0a' : '#12121a',
            borderColor: color, borderWidth: 1,
            titleColor: color, bodyColor: color,
            titleFont: { family: "'Orbitron', sans-serif", size: 12 },
            bodyFont: { family: "'Share Tech Mono', monospace", size: 11 },
            padding: 12,
            callbacks: {
              label: (context) => {
                const c = sorted[context.dataIndex]
                return [
                  ` Market Share: ${c.market_share}%`,
                  ` Valuation: $${c.valuation_b || 'N/A'}B`,
                  ` Threat: ${c.threat_score}`,
                  ` Incidents: ${c.incidents_count}`,
                ]
              },
            },
          },
          datalabels: {
            color,
            font: { family: "'Orbitron', sans-serif", size: 11, weight: 'bold' },
            formatter: (value) => value > 1 ? `${value}%` : '',
            textShadowColor: theme === 'hud' ? '#ff0000'
              : theme === 'terminal' ? '#00ff00' : '#00e5ff',
            textShadowBlur: 12,
            anchor: 'center', align: 'center', offset: 0,
          },
        },
        animation: { animateRotate: true, animateScale: true, duration: 2500, easing: 'easeOutQuart' },
      },
    })

    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [companies, theme])

  const t = THEMES[theme] || THEMES.terminal
  const top = companies?.filter(c => c.market_share > 0)
    .sort((a, b) => b.market_share - a.market_share)[0]

  return (
    <div style={{
      background: t.panelBg, border: `1px solid ${t.panelBorder}`,
      padding: 16, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative', height: '100%',
    }} className="panel">
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%',
        height: 1, background: `linear-gradient(90deg, transparent, ${t.primary}60, transparent)`,
      }} />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '3px',
          color: t.primary, textShadow: `0 0 10px ${t.primary}`,
        }}>
          Skynet Assessment
        </div>
        {top && (
          <div style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
            color: COMPANY_COLORS[top.slug] || t.primary,
            textShadow: `0 0 6px ${COMPANY_COLORS[top.slug] || t.primary}`,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            ▸ {top.name} leads
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
        color: t.primary, opacity: 0.4, marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: '2px',
      }}>
        AI Dominance Probability Matrix
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
