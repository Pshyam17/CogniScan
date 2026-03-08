# CogniScan — Dementia Risk Prediction

> End-to-end ML application for dementia risk stratification using Random Forest + SHAP explainability, trained on the OASIS longitudinal MRI dataset.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Not a medical device.** Portfolio demonstration only — not for clinical use.

---

## Overview

CogniScan predicts dementia risk from neuroimaging and cognitive assessment variables using a **Random Forest classifier** trained on the [OASIS Longitudinal MRI Dataset](https://www.oasis-brains.org). Predictions are explained using **SHAP (SHapley Additive exPlanations)** values, making the model interpretable at the individual patient level.

---

## Features

- **Random Forest classifier** — 500 trees trained on 8 neuroimaging and cognitive features
- **SHAP explainability** — per-prediction feature contribution bars
- **Interactive patient profile** — radar chart of normalized feature values
- **Model analysis dashboard** — feature importance, confusion matrix, AUC-ROC
- **REST API** — FastAPI backend with `/predict`, `/metrics`, `/features` endpoints
- **Demo mode** — fully functional without backend for portfolio presentations

---

## Model Performance

| Metric | Score |
|---|---|
| Accuracy | 87.3% |
| Precision | 84.1% |
| Recall | 89.6% |
| F1 Score | 86.7% |
| AUC-ROC | 0.924 |

---

## Dataset

**OASIS Longitudinal MRI** — 373 sessions, 150 subjects aged 60–98.

| Feature | Description |
|---|---|
| `MMSE` | Mini-Mental State Exam (0–30) |
| `nWBV` | Normalized whole brain volume |
| `eTIV` | Estimated total intracranial volume |
| `ASF` | Atlas scaling factor |
| `Age` | Age in years |
| `EDUC` | Years of education |
| `SES` | Socioeconomic status (1–5) |
| `M/F` | Gender |

---

## Quickstart

### Frontend only (demo mode)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` — works fully without the backend.

### With backend
```bash
# Train model
cd api
pip install -r requirements.txt
python model.py train path/to/oasis_longitudinal.csv

# Start API
uvicorn main:app --reload --port 8000

# Start frontend
cd ../frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

### Docker
```bash
cd api
docker build -t cogniscan-api .
docker run -p 8000:8000 cogniscan-api
```

---

## API Reference

### `POST /predict`
```json
{
  "age": 75, "educ": 14, "ses": 2, "mmse": 26,
  "etiv": 1480, "nwbv": 0.720, "asf": 1.180,
  "gender": "M", "visit": 1
}
```

**Response:**
```json
{
  "probability": 0.312,
  "label": "Borderline / Uncertain",
  "severity": "medium",
  "contributions": [
    { "feature": "MMSE", "label": "MMSE Score", "value": -0.112, "direction": "protect" }
  ]
}
```

### `GET /metrics`
Returns accuracy, precision, recall, F1, AUC-ROC, confusion matrix, feature importance.

### `GET /features`
Returns feature metadata for dynamic frontend form generation.

---

## Project Structure
```
cogniscan/
├── api/
│   ├── main.py           # FastAPI routes + CORS
│   ├── model.py          # RF training, prediction, SHAP
│   ├── schemas.py        # Pydantic models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── pages/
│   │   ├── predict.js    # Risk predictor UI
│   │   ├── analysis.js   # Model analysis + charts
│   │   └── about.js      # Docs + glossary
│   ├── components/
│   │   ├── Layout.js
│   │   ├── RiskGauge.js
│   │   ├── ShapChart.js
│   │   └── RadarProfile.js
│   └── lib/api.js
├── notebooks/            # Original R analysis
├── vercel.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | scikit-learn — Random Forest |
| Explainability | SHAP — TreeExplainer |
| API | FastAPI + Pydantic + Uvicorn |
| Frontend | Next.js 14 + Recharts + Tailwind CSS |
| Deployment | Vercel (frontend) + Docker (backend) |
| Dataset | OASIS Longitudinal MRI (public domain) |

---

## License

MIT
