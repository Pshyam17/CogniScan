import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
export default function RadarProfile({ inputs }) {
  const data = [
    { subject: 'Memory (MMSE)',  value: +(inputs.mmse / 30).toFixed(2) },
    { subject: 'Brain Volume',   value: +(inputs.nwbv / 0.84).toFixed(2) },
    { subject: 'Education',      value: +(inputs.educ / 23).toFixed(2) },
    { subject: 'Social Status',  value: +((6 - inputs.ses) / 5).toFixed(2) },
    { subject: 'Brain Scale',    value: +(Math.min(1, inputs.asf / 1.6)).toFixed(2) },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1e2130" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
        <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
