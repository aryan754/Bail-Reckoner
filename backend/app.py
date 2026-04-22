from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import logging

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App Init ───────────────────────────────────────────────────────────────────
app = FastAPI(title="Bail Reckoner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model Load ─────────────────────────────────────────────────────────────────
MODEL_ID = "Baunty7/bail-reckoner"
classifier = None

@app.on_event("startup")
async def load_model():
    global classifier
    logger.info(f"Loading model from HuggingFace Hub: {MODEL_ID}")
    classifier = pipeline("text-classification", model=MODEL_ID)
    logger.info("Model loaded successfully.")


# ── Request / Response Schemas ─────────────────────────────────────────────────
class PredictRequest(BaseModel):
    fir_details: str
    ipc_sections: str
    crime_type: str = ""    # optional — omit from frontend if not needed
    accused_name: str
    age: int
    gender: str              # "Male" | "Female" | "Other"
    criminal_history: str
    severity: str            # "Low" | "Medium" | "High"
    evidence_strength: str   # "Weak" | "Moderate" | "Strong"
    flight_risk: str         # "Low" | "Medium" | "High"


class PredictResponse(BaseModel):
    decision: str
    confidence: float
    label: str


# ── Helpers ────────────────────────────────────────────────────────────────────
def build_case_text(req: PredictRequest) -> str:
    crime_part = f"Crime Type: {req.crime_type}. " if req.crime_type else ""
    return (
        f"FIR: {req.fir_details}. "
        f"IPC Sections: {req.ipc_sections}. "
        f"{crime_part}"
        f"Accused: {req.accused_name}, Age: {req.age}, Gender: {req.gender}. "
        f"Criminal History: {req.criminal_history}. "
        f"Severity: {req.severity}. "
        f"Evidence: {req.evidence_strength}. "
        f"Flight Risk: {req.flight_risk}."
    )


def apply_rule_overrides(req: PredictRequest, label: str, score: float):
    """
    Rule-based overrides applied BEFORE returning the result.
    Returns (decision, confidence, label).
    """
    # Rule 1 – Non-bailable crime with High severity → always Rejected
    # (only applied when crime_type is explicitly provided)
    if req.crime_type and req.crime_type.lower() == "non-bailable" and req.severity == "High":
        return "Bail Rejected", round(score * 100, 2), "LABEL_0"

    # Rule 2 – Criminal history present AND High flight risk → always Rejected
    has_history = req.criminal_history.strip().lower() not in ("", "none")
    if has_history and req.flight_risk == "High":
        return "Bail Rejected", round(score * 100, 2), "LABEL_0"

    # Rule 3 – Low severity AND no criminal history → always Granted
    no_history = req.criminal_history.strip().lower() in ("", "none")
    if req.severity == "Low" and no_history:
        return "Bail Granted", round(score * 100, 2), "LABEL_1"

    # No override – use model result
    decision = "Bail Granted" if label == "LABEL_1" else "Bail Rejected"
    return decision, round(score * 100, 2), label


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "running"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet. Please try again shortly.")

    case_text = build_case_text(req)
    logger.info(f"Predicting for: {req.accused_name}")

    result = classifier(case_text, truncation=True, max_length=512)[0]
    raw_label: str = result["label"]   # "LABEL_0" or "LABEL_1"
    raw_score: float = result["score"]

    decision, confidence, label = apply_rule_overrides(req, raw_label, raw_score)
    logger.info(f"Result → {decision} ({confidence}%) [{label}]")

    return PredictResponse(decision=decision, confidence=confidence, label=label)
