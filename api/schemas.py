from pydantic import BaseModel, Field
from typing import Literal


class PredictRequest(BaseModel):
    age:   int   = Field(..., ge=60,    le=98,    description="Age in years")
    educ:  int   = Field(..., ge=6,     le=23,    description="Years of education")
    ses:   int   = Field(..., ge=1,     le=5,     description="Socioeconomic status (1=highest)")
    mmse:  int   = Field(..., ge=4,     le=30,    description="Mini-Mental State Exam score")
    etiv:  int   = Field(..., ge=1106,  le=2004,  description="Est. total intracranial volume")
    nwbv:  float = Field(..., ge=0.644, le=0.837, description="Normalized whole brain volume")
    asf:   float = Field(..., ge=0.876, le=1.587, description="Atlas scaling factor")
    gender: Literal["M", "F"]          = Field(..., description="Gender")
    visit: int   = Field(1, ge=1, le=5, description="Visit number")

    def to_model_inputs(self) -> dict:
        return {
            "Age":          self.age,
            "EDUC":         self.educ,
            "SES":          self.ses,
            "MMSE":         self.mmse,
            "eTIV":         self.etiv,
            "nWBV":         self.nwbv,
            "ASF":          self.asf,
            "M/F_encoded":  1 if self.gender == "M" else 0,
            "Visit":        self.visit,
        }

    class Config:
        json_schema_extra = {
            "example": {
                "age": 75, "educ": 14, "ses": 2, "mmse": 26,
                "etiv": 1480, "nwbv": 0.720, "asf": 1.180,
                "gender": "M", "visit": 1,
            }
        }


class FeatureContribution(BaseModel):
    feature:   str
    label:     str
    value:     float
    direction: Literal["risk", "protect"]


class PredictResponse(BaseModel):
    probability: float
    label:       str
    severity:    Literal["low", "medium", "high"]
    contributions: list[FeatureContribution]


class MetricsResponse(BaseModel):
    accuracy:           float
    precision:          float
    recall:             float
    f1:                 float
    auc_roc:            float
    confusion_matrix:   list[list[int]]
    feature_importance: dict[str, float]
    n_train:            int
    n_test:             int