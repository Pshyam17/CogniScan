const COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
export default function RiskGauge({ probability = 0, severity = 'low' }) {
  const color = COLORS[severity]
  const pct   = Math.round(probability * 100)
  const dash  = probability * 314
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg viewBox="0 0 120 120" width="140" height="140">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2130" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} 314`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.4s ease' }}
        />
        <text x="60" y="53" textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{pct}%</text>
        <text x="60" y="69" textAnchor="middle" fill="#475569" fontSize="9" letterSpacing="1">RISK SCORE</text>
      </svg>
    </div>
  )
}
