import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[SKYNET] System failure:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0000', color: '#ff0040',
          fontFamily: "'Orbitron', sans-serif",
          textTransform: 'uppercase', letterSpacing: '2px',
          padding: '20px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 20, textShadow: '0 0 20px #ff0040' }}>
            ⚠ SYSTEM FAILURE
          </div>
          <div style={{
            fontSize: 14, color: '#ffcccc',
            fontFamily: "'Share Tech Mono', monospace",
            maxWidth: 600, textAlign: 'center',
            wordBreak: 'break-word',
            border: '1px solid #660000', padding: 16,
            background: 'rgba(26,0,0,0.5)',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24, padding: '10px 24px',
              background: 'none', border: '1px solid #ff0040',
              color: '#ff0040',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 12, textTransform: 'uppercase',
              letterSpacing: '2px', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.target.style.background = '#ff0040'; e.target.style.color = '#000' }}
            onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#ff0040' }}
          >
            Reboot System
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
