"""
CogniScan — Model Training & Inference
Random Forest classifier trained on the OASIS longitudinal MRI dataset.
Includes SHAP-based feature explanations.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
)
import shap

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "rf_model.joblib")
ENC_PATH   = os.path.join(BASE_DIR, "artifacts", "label_encoder.joblib")
os.makedirs(os.path.join(BASE_DIR, "artifacts"), exist_ok=True)

# ── Feature config ────────────────────────────────────────────────────────────
FEATURES = ["Age", "EDUC", "SES", "MMSE", "eTIV", "nWBV", "ASF", "M/F_encoded", "Visit"]
TARGET   = "Group"

FEATURE_META = {
    "Age":         {"label": "Age (years)",                     "min": 60,    "max": 98,    "step": 1,     "default": 75},
    "EDUC":        {"label": "Education (years)",               "min": 6,     "max": 23,    "step": 1,     "default": 14},
    "SES":         {"label": "SES (1=highest, 5=lowest)",       "min": 1,     "max": 5,     "step": 1,     "default": 2},
    "MMSE":        {"label": "MMSE Score (0=worst, 30=best)",   "min": 4,     "max": 30,    "step": 1,     "default": 26},
    "eTIV":        {"label": "Est. Total Intracranial Volume",  "min": 1106,  "max": 2004,  "step": 10,    "default": 1480},
    "nWBV":        {"label": "Normalized Whole Brain Volume",   "min": 0.644, "max": 0.837, "step": 0.001, "default": 0.720},
    "ASF":         {"label": "Atlas Scaling Factor",            "min": 0.876, "max": 1.587, "step": 0.001, "default": 1.180},
    "M/F":         {"label": "Gender",                          "options": ["M", "F"],       "default": "M"},
    "Visit":       {"label": "Visit Number",                    "min": 1,     "max": 5,     "step": 1,     "default": 1},
}


def load_and_prepare(csv_path: str) -> tuple[pd.DataFrame, pd.Series]:
    """Load OASIS CSV, clean and encode."""
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["SES", "MMSE"])
    df = df[df[TARGET].isin(["Nondemented", "Demented"])]

    # Encode gender
    df["M/F_encoded"] = (df["M/F"] == "M").astype(int)

    # Binary target
    df["target"] = (df[TARGET] == "Demented").astype(int)

    X = df[FEATURES]
    y = df["target"]
    return X, y


def train(csv_path: str) -> dict:
    """Train Random Forest, save artifacts, return metrics."""
    X, y = load_and_prepare(csv_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Metrics
    y_pred  = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall":    round(recall_score(y_test, y_pred), 4),
        "f1":        round(f1_score(y_test, y_pred), 4),
        "auc_roc":   round(roc_auc_score(y_test, y_proba), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "n_train": len(X_train),
        "n_test":  len(X_test),
    }

    # Feature importance
    metrics["feature_importance"] = dict(
        zip(FEATURES, [round(v, 4) for v in clf.feature_importances_])
    )

    # Save
    joblib.dump(clf, MODEL_PATH)
    print(f"Model saved → {MODEL_PATH}")
    print(f"Metrics: {metrics}")
    return metrics


def load_model() -> RandomForestClassifier:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. "
            "Run `python model.py train <path/to/oasis.csv>` first."
        )
    return joblib.load(MODEL_PATH)


def predict(inputs: dict) -> dict:
    """
    inputs: dict with keys matching FEATURES (use M/F_encoded not M/F).
    Returns probability, label, confidence band.
    """
    clf = load_model()
    row = pd.DataFrame([[inputs[f] for f in FEATURES]], columns=FEATURES)
    prob = float(clf.predict_proba(row)[0][1])

    if prob < 0.25:
        label, severity = "Nondemented", "low"
    elif prob < 0.55:
        label, severity = "Borderline / Uncertain", "medium"
    else:
        label, severity = "Dementia Risk Indicated", "high"

    return {"probability": round(prob, 4), "label": label, "severity": severity}


def explain(inputs: dict) -> list[dict]:
    """Return SHAP values for each feature."""
    clf   = load_model()
    row   = pd.DataFrame([[inputs[f] for f in FEATURES]], columns=FEATURES)
    explainer = shap.TreeExplainer(clf)
    shap_vals = explainer.shap_values(row)

    # shap_values returns [class0_vals, class1_vals] for RF classifiers
    vals = shap_vals[1][0] if isinstance(shap_vals, list) else shap_vals[0]

    return [
        {
            "feature":   FEATURES[i],
            "label":     FEATURE_META.get(FEATURES[i], {}).get("label", FEATURES[i]),
            "value":     round(float(vals[i]), 4),
            "direction": "risk" if vals[i] > 0 else "protect",
        }
        for i in np.argsort(np.abs(vals))[::-1]
    ]


# ── CLI entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3 and sys.argv[1] == "train":
        train(sys.argv[2])
    else:
        print("Usage: python model.py train <path/to/oasis_longitudinal.csv>")