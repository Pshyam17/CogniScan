"""
CogniScan API — FastAPI backend for dementia risk prediction.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictRequest, PredictResponse, MetricsResponse, FeatureContribution
from model import predict, explain, FEATURE_META
import json, os

app = FastAPI(
    title="CogniScan — Dementia Risk Prediction API",
    description=(
        "Predicts dementia risk from neuroimaging and cognitive assessment features "
        "using a Random Forest model trained on the OASIS longitudinal MRI dataset."
    ),
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Cache metrics from last training run ──────────────────────────────────────
METRICS_PATH = os.path.join(os.path.dirname(__file__), "artifacts", "metrics.json")


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "cogniscan-api"}


@app.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    """
    Predict dementia risk for a patient.
    Returns probability (0–1), severity label, and SHAP-style feature contributions.
    """
    try:
        inputs        = req.to_model_inputs()
        result        = predict(inputs)
        contributions = explain(inputs)
        return PredictResponse(
            probability=result["probability"],
            label=result["label"],
            severity=result["severity"],
            contributions=[FeatureContribution(**c) for c in contributions],
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics", response_model=MetricsResponse)
def metrics_endpoint():
    """Return model performance metrics from last training run."""
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(
            status_code=404,
            detail="Metrics not found. Train the model first: python model.py train <csv>"
        )
    with open(METRICS_PATH) as f:
        return json.load(f)


@app.get("/features")
def features_endpoint():
    """Return feature metadata for frontend form generation."""
    return {"features": FEATURE_META}


@app.get("/")
def root():
    return {
        "name":    "CogniScan API",
        "version": "1.0.0",
        "docs":    "/docs",
        "endpoints": ["/predict", "/metrics", "/features", "/health"],
    }