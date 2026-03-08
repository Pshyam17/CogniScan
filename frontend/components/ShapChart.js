export default function ShapChart({ contributions = [] }) {
  if (!contributions.length) return null
  const maxAbs = Math.max(...contributions.map(c => Math.abs(c.value)), 0.01)
  return (
    <div>
      {contributions.map((c, i) => (
        <div key={c.feature} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.direction === 'risk' ? '#ef4444' : '#22c55e' }}>
              {c.value > 0 ? '+' : ''}{c.value.toFixed(3)}
            </span>
          </div>
          <div style={{ background: '#1e2130', borderRadius: 4, height: 7, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: c.direction === 'risk' ? '#ef4444' : '#22c55e',
              width: `${(Math.abs(c.value) / maxAbs) * 100}%`,
              transition: 'width 0.6s ease',
              transitionDelay: `${i * 60}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}
