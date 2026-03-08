import axios from 'axios'
const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' })
export const predictRisk  = (p) => client.post('/predict', p).then(r => r.data)
export const fetchMetrics = ()  => client.get('/metrics').then(r => r.data)
export const fetchFeatures= ()  => client.get('/features').then(r => r.data.features)

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
export function demoPredict(inputs) {
  const { age, mmse, nwbv, educ, ses, etiv, asf, gender } = inputs
  let score = -2.1
  score += (age - 77)     * 0.04
  score += (30 - mmse)    * 0.28
  score += (0.729 - nwbv) * 8.5
  score += (asf - 1.195)  * 1.2
  score += (14.6 - educ)  * 0.06
  score += (ses - 2.5)    * 0.08
  score += (1488 - etiv)  * 0.001
  score += gender === 'M' ? 0.15 : -0.1
  const prob = Math.min(0.97, Math.max(0.03, sigmoid(score)))
  const severity = prob < 0.25 ? 'low' : prob < 0.55 ? 'medium' : 'high'
  const label = { low: 'Nondemented', medium: 'Borderline / Uncertain', high: 'Dementia Risk Indicated' }[severity]
  const contributions = [
    { feature: 'MMSE',  label: 'MMSE Score',           value: +((30 - mmse) * 0.28).toFixed(3),    direction: mmse  < 27    ? 'risk' : 'protect' },
    { feature: 'nWBV',  label: 'Brain Volume (nWBV)',   value: +((0.729-nwbv)*8.5).toFixed(3),      direction: nwbv  < 0.729 ? 'risk' : 'protect' },
    { feature: 'Age',   label: 'Age',                   value: +((age-77)*0.04).toFixed(3),          direction: age   > 77    ? 'risk' : 'protect' },
    { feature: 'EDUC',  label: 'Education',             value: +((14.6-educ)*0.06).toFixed(3),       direction: educ  < 14    ? 'risk' : 'protect' },
    { feature: 'ASF',   label: 'Atlas Scale Factor',    value: +((asf-1.195)*1.2).toFixed(3),        direction: asf   > 1.195 ? 'risk' : 'protect' },
    { feature: 'eTIV',  label: 'Intracranial Volume',   value: +((1488-etiv)*0.001).toFixed(3),      direction: etiv  < 1488  ? 'risk' : 'protect' },
    { feature: 'SES',   label: 'Socioeconomic Status',  value: +((ses-2.5)*0.08).toFixed(3),         direction: ses   > 2.5   ? 'risk' : 'protect' },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  return { probability: +prob.toFixed(4), label, severity, contributions }
}
