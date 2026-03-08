import { useState } from 'react'
import Layout from '../components/Layout'
import RiskGauge from '../components/RiskGauge'
import ShapChart from '../components/ShapChart'
import RadarProfile from '../components/RadarProfile'
import { predictRisk, demoPredict } from '../lib/api'

const SEVERITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const SEVERITY_MSG = {
  low:    'Profile consistent with nondemented individuals in the OASIS cohort. Continue routine monitoring.',
  medium: 'Borderline profile. Key risk factors present. Consider follow-up cognitive assessment.',
  high:   'Multiple high-risk indicators detected. Profile consistent with dementia group.',
}
const card  = { background: '#0f1117', border: '1px solid #1e2130', borderRadius: 14, padding: '20px 24px' }
const DEFAULTS = { age: 75, educ: 14, ses: 2, mmse: 26, etiv: 1480, nwbv: 0.720, asf: 1.180, gender: 'M', visit: 1 }

function Slider({ label, min, max, step=1, value, onChange, fmt }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', cursor: 'pointer', accentColor: '#6366f1' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#334155' }}>{min}</span>
        <span style={{ fontSize: 9, color: '#334155' }}>{max}</span>
      </div>
    </div>
  )
}

export default function Predict() {
  const [inputs,  setInputs]  = useState(DEFAULTS)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)
  const set = (k, v) => setInputs(p => ({ ...p, [k]: v }))
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const run = async () => {
    setLoading(true)
    try {
      setResult(await predictRisk(inputs))
    } catch {
      setResult(demoPredict(inputs))
      showToast('API offline — showing demo prediction')
    } finally { setLoading(false) }
  }
  const sc = result ? SEVERITY_COLOR[result.severity] : '#6366f1'
  return (
    <Layout>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#f59e0b22', border: '1px solid #f59e0b44', color: '#f59e0b', borderRadius: 10, padding: '10px 18px', fontSize: 12 }}>{toast}</div>}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Dementia Risk Predictor</h1>
        <p style={{ color: '#475569', margin: '4px 0 0', fontSize: 13 }}>Random Forest · OASIS Longitudinal MRI · SHAP Explanations</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>Patient Features</div>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 18 }}>OASIS neuroimaging variables</div>
          <Slider label="Age (years)"             min={60}    max={98}    value={inputs.age}   onChange={v => set('age',v)} />
          <Slider label="MMSE Score (0–30)"       min={4}     max={30}    value={inputs.mmse}  onChange={v => set('mmse',v)} />
          <Slider label="Norm. Brain Volume"      min={0.644} max={0.837} step={0.001} value={inputs.nwbv} onChange={v => set('nwbv',v)} fmt={v=>v.toFixed(3)} />
          <Slider label="Years of Education"      min={6}     max={23}    value={inputs.educ}  onChange={v => set('educ',v)} />
          <Slider label="SES (1=best, 5=worst)"   min={1}     max={5}     value={inputs.ses}   onChange={v => set('ses',v)} />
          <Slider label="eTIV"                    min={1106}  max={2004}  step={10} value={inputs.etiv} onChange={v => set('etiv',v)} />
          <Slider label="ASF"                     min={0.876} max={1.587} step={0.001} value={inputs.asf} onChange={v => set('asf',v)} fmt={v=>v.toFixed(3)} />
          <Slider label="Visit Number"            min={1}     max={5}     value={inputs.visit} onChange={v => set('visit',v)} />
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>GENDER</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['M','F'].map(g => (
                <button key={g} onClick={() => set('gender',g)} style={{ flex:1, padding:'8px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', background: inputs.gender===g ? '#6366f122':'#0a0d14', color: inputs.gender===g ? '#a5b4fc':'#475569', border:`1px solid ${inputs.gender===g ? '#6366f1':'#1e2130'}` }}>
                  {g==='M'?'Male':'Female'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={run} disabled={loading} style={{ width:'100%', background:'#6366f1', color:'#fff', border:'none', borderRadius:10, padding:'12px', fontWeight:700, fontSize:14, cursor: loading?'not-allowed':'pointer', opacity: loading?0.6:1 }}>
            {loading ? 'Analysing...' : 'Run Prediction'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {!result ? (
            <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, gap:12 }}>
              <div style={{ fontSize:36 }}>🧠</div>
              <div style={{ color:'#475569' }}>Adjust features and click Run Prediction</div>
            </div>
          ) : (
            <>
              <div style={{ ...card, display:'flex', alignItems:'center', gap:28 }}>
                <RiskGauge probability={result.probability} severity={result.severity} />
                <div>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:600, letterSpacing:1, marginBottom:6 }}>PREDICTION</div>
                  <div style={{ fontSize:20, fontWeight:800, color:sc, marginBottom:8 }}>{result.label}</div>
                  <div style={{ fontSize:12, color:'#94a3b8', maxWidth:380, lineHeight:1.6 }}>{SEVERITY_MSG[result.severity]}</div>
                </div>
              </div>
              <div style={card}>
                <div style={{ fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>Feature Contributions (SHAP)</div>
                <div style={{ fontSize:11, color:'#475569', marginBottom:16 }}>How each feature pushes toward <span style={{color:'#ef4444'}}>risk</span> or <span style={{color:'#22c55e'}}>protection</span></div>
                <ShapChart contributions={result.contributions} />
              </div>
              <div style={card}>
                <div style={{ fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>Patient Profile</div>
                <div style={{ fontSize:11, color:'#475569', marginBottom:8 }}>Normalized feature values — higher is better</div>
                <RadarProfile inputs={inputs} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
