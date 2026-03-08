import Link from 'next/link'
import { useRouter } from 'next/router'

const NAV = [
  { href: '/predict',  label: 'Risk Predictor'  },
  { href: '/analysis', label: 'Model Analysis'  },
  { href: '/about',    label: 'About'            },
]

const C = { bg: '#0a0d14', border: '#1e2130', indigo: '#6366f1', muted: '#475569', active: '#a5b4fc' }

export default function Layout({ children }) {
  const { pathname } = useRouter()
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080a10' }}>
      <aside style={{ width: 220, background: C.bg, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>
            Cogni<span style={{ color: C.indigo }}>Scan</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 1 }}>DEMENTIA RISK PREDICTION</div>
        </div>
        <div style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ background: '#6366f115', borderRadius: 7, padding: '7px 12px', fontSize: 11 }}>
            <span style={{ color: C.indigo, fontWeight: 600 }}>Dataset:</span>
            <span style={{ color: C.muted, marginLeft: 6 }}>OASIS Longitudinal</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '10px' }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? '#6366f115' : 'transparent',
                  color: active ? C.active : C.muted,
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  borderLeft: `2px solid ${active ? C.indigo : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, fontSize: 10, color: '#334155' }}>
          Not a medical device. For portfolio use only.
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}
