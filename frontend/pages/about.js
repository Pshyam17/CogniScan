import Layout from '../components/Layout'

const card = {background:'#0f1117',border:'1px solid #1e2130',borderRadius:14,padding:'20px 24px',marginBottom:16}
const STACK = ['Python 3.11','TensorFlow 2.15','CNN (Keras)','FastAPI','Pillow','Next.js 14','Tailwind CSS','Docker']

export default function About() {
  return (
    <Layout>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#f1f5f9',margin:0}}>About CogniScan</h1>
        <p style={{color:'#475569',margin:'4px 0 0',fontSize:13}}>Dataset, methodology, and clinical context</p>
      </div>
      <div style={{maxWidth:740}}>
        <div style={card}>
          <div style={{fontWeight:700,fontSize:15,color:'#f1f5f9',marginBottom:10}}>Overview</div>
          <p style={{color:'#94a3b8',lineHeight:1.8,marginBottom:10}}>
            CogniScan predicts dementia risk from neuroimaging and cognitive assessment variables using a{' '}
            <strong style={{color:'#e2e8f0'}}>Random Forest classifier</strong> trained on the OASIS Longitudinal MRI Dataset.
            Predictions are explained using SHAP values.
          </p>
          <div style={{background:'#ef444411',border:'1px solid #ef444433',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#ef4444'}}>
            Not a medical device. Portfolio demonstration only.
          </div>
        </div>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:14}}>Feature Glossary</div>
          {[
            ['MMSE','Mini-Mental State Examination (0-30). Scores below 24 suggest possible impairment.'],
            ['nWBV','Normalized Whole Brain Volume. Decreases with neurodegeneration.'],
            ['eTIV','Estimated Total Intracranial Volume. Used for brain size normalization.'],
            ['ASF','Atlas Scaling Factor. MRI-derived scalar for volume normalization.'],
            ['EDUC','Years of formal education. Higher education = greater cognitive reserve.'],
            ['SES','Socioeconomic status (Hollingshead Index, 1=highest to 5=lowest).'],
          ].map(([k,v]) => (
            <div key={k} style={{padding:'10px 0',borderBottom:'1px solid #1e2130'}}>
              <span style={{color:'#6366f1',fontWeight:700,fontSize:12,marginRight:10}}>{k}</span>
              <span style={{color:'#94a3b8',fontSize:12}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:14}}>Tech Stack</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {STACK.map(t => (
              <span key={t} style={{background:'#6366f115',color:'#a5b4fc',border:'1px solid #6366f130',borderRadius:6,padding:'4px 12px',fontSize:12}}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
