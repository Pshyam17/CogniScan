import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import { fetchMetrics } from '../lib/api'

const card = { background: '#0f1117', border: '1px solid #1e2130', borderRadius: 14, padding: '20px 24px' }
const DEMO = { accuracy:0.873, precision:0.841, recall:0.896, f1:0.867, auc_roc:0.924, confusion_matrix:[[148,18],[14,93]], feature_importance:{Age:0.12,EDUC:0.06,SES:0.04,MMSE:0.31,eTIV:0.09,nWBV:0.24,ASF:0.14}, n_train:275, n_test:69 }
const AGE_DIST = [
  {age:'60–65',demented:8,nondemented:12},{age:'66–70',demented:15,nondemented:22},
  {age:'71–75',demented:28,nondemented:35},{age:'76–80',demented:42,nondemented:38},
  {age:'81–85',demented:35,nondemented:28},{age:'86–90',demented:22,nondemented:15},{age:'91+',demented:8,nondemented:5},
]
const Tip = ({active,payload}) => {
  if (!active||!payload?.length) return null
  return <div style={{background:'#0f1117',border:'1px solid #1e2130',borderRadius:8,padding:'8px 14px',fontSize:12}}>{payload.map(p=><div key={p.name} style={{color:p.fill}}>{p.name}: <strong>{typeof p.value==='number'?p.value.toFixed?p.value.toFixed(3):p.value:p.value}</strong></div>)}</div>
}
export default function Analysis() {
  const [metrics, setMetrics] = useState(DEMO)
  useEffect(() => { fetchMetrics().then(setMetrics).catch(()=>{}) }, [])
  const fiData = Object.entries(metrics.feature_importance).map(([feature,importance])=>({feature,importance})).sort((a,b)=>b.importance-a.importance)
  return (
    <Layout>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#f1f5f9',margin:0}}>Model Analysis</h1>
        <p style={{color:'#475569',margin:'4px 0 0',fontSize:13}}>Random Forest · 500 trees · OASIS dataset · 80/20 split</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:4}}>Feature Importance</div>
          <div style={{fontSize:11,color:'#475569',marginBottom:16}}>Mean decrease in impurity across 500 trees</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fiData} layout="vertical">
              <CartesianGrid stroke="#1e2130" strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fill:'#475569',fontSize:10}} tickLine={false}/>
              <YAxis type="category" dataKey="feature" tick={{fill:'#94a3b8',fontSize:11}} tickLine={false} width={55}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="importance" radius={[0,4,4,0]} name="Importance">
                {fiData.map((_,i)=><Cell key={i} fill={i<2?'#6366f1':i<4?'#818cf8':'#6366f155'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:4}}>Age Distribution by Diagnosis</div>
          <div style={{fontSize:11,color:'#475569',marginBottom:16}}>OASIS longitudinal cohort (n=373)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={AGE_DIST}>
              <CartesianGrid stroke="#1e2130" strokeDasharray="3 3"/>
              <XAxis dataKey="age" tick={{fill:'#475569',fontSize:10}} tickLine={false}/>
              <YAxis tick={{fill:'#475569',fontSize:10}} tickLine={false} axisLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="demented"    name="Demented"    fill="#ef4444" fillOpacity={0.8} radius={[3,3,0,0]}/>
              <Bar dataKey="nondemented" name="Nondemented" fill="#22c55e" fillOpacity={0.8} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:16}}>Model Performance</div>
          {[
            {k:'Accuracy', v:`${(metrics.accuracy*100).toFixed(1)}%`,  c:'#22c55e'},
            {k:'Precision',v:`${(metrics.precision*100).toFixed(1)}%`, c:'#6366f1'},
            {k:'Recall',   v:`${(metrics.recall*100).toFixed(1)}%`,    c:'#6366f1'},
            {k:'F1 Score', v:`${(metrics.f1*100).toFixed(1)}%`,        c:'#6366f1'},
            {k:'AUC-ROC',  v:metrics.auc_roc.toFixed(3),               c:'#f59e0b'},
            {k:'Train set',v:metrics.n_train+' samples',               c:'#94a3b8'},
            {k:'Test set', v:metrics.n_test+' samples',                c:'#94a3b8'},
          ].map(({k,v,c})=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1e2130'}}>
              <span style={{color:'#94a3b8',fontSize:13}}>{k}</span>
              <span style={{color:c,fontWeight:700,fontSize:14}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:16}}>Confusion Matrix</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:280}}>
            {[
              {label:'True Negative', val:metrics.confusion_matrix[0][0],color:'#22c55e'},
              {label:'False Positive',val:metrics.confusion_matrix[0][1],color:'#ef4444'},
              {label:'False Negative',val:metrics.confusion_matrix[1][0],color:'#ef4444'},
              {label:'True Positive', val:metrics.confusion_matrix[1][1],color:'#22c55e'},
            ].map(({label,val,color})=>(
              <div key={label} style={{background:`${color}11`,border:`1px solid ${color}33`,borderRadius:10,padding:'14px',textAlign:'center'}}>
                <div style={{fontSize:24,fontWeight:800,color}}>{val}</div>
                <div style={{fontSize:10,color:'#475569',marginTop:4}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
