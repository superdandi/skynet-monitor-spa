import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, Sphere, Graticule, Marker, Line } from 'react-simple-maps'
import { THEMES, COMPANY_COLORS } from '../themes'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const HQ = [
  { name: 'OpenAI', coords: [-122.42, 37.77], color: '#FF1744', threat: 'CRITICAL', market: 68, city: 'San Francisco' },
  { name: 'Anthropic', coords: [-122.35, 37.74], color: '#00E5FF', threat: 'HIGH', market: 32, city: 'San Francisco' },
  { name: 'DeepMind', coords: [-0.13, 51.51], color: '#2979FF', threat: 'MODERATE', market: 13, city: 'London' },
  { name: 'Meta AI', coords: [-122.19, 37.45], color: '#00FF41', threat: 'MODERATE', market: 10, city: 'Menlo Park' },
  { name: 'xAI', coords: [-122.14, 37.42], color: '#FF0080', threat: 'LOW', market: 2, city: 'Palo Alto' },
  { name: 'Mistral', coords: [2.35, 48.86], color: '#FFB800', threat: 'LOW', market: 1, city: 'Paris' },
  { name: 'Moonshot AI', coords: [116.41, 39.9], color: '#FF5722', threat: 'LOW', market: 0.5, city: 'Beijing' },
  { name: 'Z.ai (GLM)', coords: [116.44, 39.92], color: '#9C27B0', threat: 'LOW', market: 1, city: 'Beijing' },
]

const VECTORS = [
  { from: [-122.42, 37.77], to: [-74.01, 40.71], label: 'AUTONOMOUS BREACH', color: '#FF1744', isCritical: true },
  { from: [116.4, 39.9], to: [-0.13, 51.51], label: 'CNVDB LABEL', color: '#FF8C00', isCritical: false },
]

function getSize(threat) {
  if (threat === 'CRITICAL') return { core: 7, rings: 3 }
  if (threat === 'HIGH') return { core: 5, rings: 2 }
  if (threat === 'MODERATE') return { core: 4, rings: 1 }
  return { core: 3, rings: 1 }
}

export default function WorldMap({ companies, theme, threatLevel }) {
  const [hovered, setHovered] = useState(null)
  const [mounted, setMounted] = useState(false)
  const isJD = (threatLevel?.level || 0) >= 4
  const isCritical = (threatLevel?.level || 0) >= 3
  const t = THEMES[theme] || THEMES.terminal

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const strokeWidth = isCritical ? 0.7 : 0.5
  const graticuleOpacity = isCritical ? 0.5 : 0.3
  const graticuleWidth = isCritical ? 0.3 : 0.08

  return (
    <div style={{
      background: t.panelBg,
      border: `1px solid ${isCritical ? `${t.accent}80` : t.panelBorder}`,
      padding: '12px 16px', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative', height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '3px',
          color: t.primary, textShadow: `0 0 10px ${t.primary}`,
        }}>
          {isJD ? '⚠ SKYNET GLOBAL THREAT MAP' : 'Skynet Global Threat Map'}
        </div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
          color: isJD ? '#FF0000' : t.primary,
          opacity: isJD ? 1 : 0.4,
          textTransform: 'uppercase', letterSpacing: 1,
          textShadow: isJD ? '0 0 8px #FF0000' : 'none',
        }}>
          {HQ.length} nodes // {VECTORS.length} vectors{isJD && ' // MAXIMUM THREAT'}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 130, center: [10, 20] }}
          style={{ width: '100%', height: '100%' }}
        >
          <Sphere fill={t.sphere} stroke={isCritical ? `${t.accent}40` : t.graticule} strokeWidth={isCritical ? 1 : 0.5} />
          <Graticule stroke={t.graticule} strokeWidth={graticuleWidth} opacity={graticuleOpacity} step={[20, 20]} />
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={t.country}
                  stroke={isCritical ? `${t.accent}50` : t.countryStroke}
                  strokeWidth={strokeWidth}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: t.countryHover, outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {isJD && mounted && (
            <Marker coordinates={[0, 0]}>
              <circle r={20} fill="none" stroke={t.accent} strokeWidth={1.5} opacity={0.12}
                style={{ animation: 'global-pulse 4s ease-out infinite' }} />
            </Marker>
          )}
          {mounted && VECTORS.map((v, i) => (
            <Line
              key={`v${i}`}
              from={v.from}
              to={v.to}
              stroke={v.color}
              strokeWidth={v.isCritical ? 3 : 2.5}
              strokeDasharray={v.isCritical ? '10 6' : '8 5'}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 ${v.isCritical ? 10 : 6}px ${v.color})` }}
            />
          ))}
          {mounted && HQ.map((hq, i) => {
            const sz = getSize(hq.threat)
            const isHovered = hovered === i
            return (
              <Marker key={`hq${i}`} coordinates={hq.coords}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {Array.from({ length: sz.rings }).map((_, j) => (
                  <circle
                    key={`r${j}`}
                    r={sz.core * (1 + j * 0.5)}
                    fill="none"
                    stroke={hq.color}
                    strokeWidth={isHovered ? 1.2 : 0.8}
                    opacity={isHovered ? 0.6 : 0.3}
                    style={{
                      animation: `radar ${0.8 + j * 0.4}s ease-out infinite`,
                      animationDelay: `${j * 0.3}s`,
                    }}
                  />
                ))}
                {hq.threat === 'CRITICAL' && (
                  <circle r={sz.core} fill="none" stroke={hq.color} strokeWidth={1.2}
                    opacity={0.35}
                    style={{ animation: 'threat-wave 3s ease-out infinite' }} />
                )}
                <circle r={sz.core * 2} fill={hq.color}
                  opacity={isHovered ? 0.45 : 0.25}
                  style={{ animation: `pulse-dot ${1.5 + i * 0.2}s ease-in-out infinite` }} />
                <circle r={isHovered ? sz.core * 1.4 : sz.core}
                  fill={hq.color} stroke={t.panelBg}
                  strokeWidth={isHovered ? 1.5 : 1}
                  style={{
                    filter: `drop-shadow(0 0 ${isHovered ? 15 : 6}px ${hq.color})`,
                    transition: 'r 0.15s ease',
                  }} />
              </Marker>
            )
          })}
        </ComposableMap>
        {hovered !== null && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(0,0,0,0.9)',
            border: `1px solid ${HQ[hovered].color}`,
            padding: '10px 14px',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11, color: t.primary, zIndex: 10,
            pointerEvents: 'none',
            boxShadow: `0 0 20px ${HQ[hovered].color}60`,
          }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: 12,
              color: HQ[hovered].color, marginBottom: 6,
              textShadow: `0 0 10px ${HQ[hovered].color}`,
            }}>
              {HQ[hovered].name.toUpperCase()}
            </div>
            <div style={{ opacity: 0.7 }}>
              {HQ[hovered].city} // {HQ[hovered].coords[0].toFixed(2)}°, {HQ[hovered].coords[1].toFixed(2)}°
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: t.primary, opacity: 0.5 }}>Threat: </span>
              <span style={{ color: HQ[hovered].color, fontWeight: 'bold' }}>{HQ[hovered].threat}</span>
              <span style={{ color: t.primary, opacity: 0.5, marginLeft: 12 }}>Share: </span>
              <span style={{ color: '#FFB800' }}>{HQ[hovered].market}%</span>
            </div>
          </div>
        )}
        {mounted && (
          <div style={{
            position: 'absolute', top: 10, right: 12,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {VECTORS.map((v, i) => (
              <div key={i} style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: 9,
                color: v.color, textShadow: `0 0 8px ${v.color}`,
                textTransform: 'uppercase', letterSpacing: 1,
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: v.isCritical ? 700 : 400,
              }}>
                <span style={{
                  display: 'inline-block', width: 14, height: 2,
                  background: v.color, boxShadow: `0 0 6px ${v.color}`,
                }} />
                {v.label}
              </div>
            ))}
          </div>
        )}
        {isJD && (
          <div style={{
            position: 'absolute', bottom: 8, right: 12,
            fontFamily: "'Orbitron', sans-serif", fontSize: 10,
            color: '#FF0000', textShadow: '0 0 10px #FF0000',
            letterSpacing: 2,
            animation: 'blink 1s step-end infinite',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 10px',
            border: '1px solid rgba(255,0,0,0.5)',
          }}>
            ⚠ JUDGMENT DAY ACTIVE
          </div>
        )}
      </div>
      <style>{`
        @keyframes radar {
          0% { r: 4; opacity: 0.5; }
          100% { r: 35; opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.45; }
        }
        @keyframes threat-wave {
          0% { r: 5; opacity: 0.35; stroke-width: 2; }
          100% { r: 60; opacity: 0; stroke-width: 0.3; }
        }
        @keyframes global-pulse {
          0% { r: 20; opacity: 0.2; stroke-width: 2; }
          100% { r: 250; opacity: 0; stroke-width: 0.2; }
        }
      `}</style>
    </div>
  )
}
