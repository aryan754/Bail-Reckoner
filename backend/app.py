from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from groq import Groq
from dotenv import load_dotenv
import logging
import os

load_dotenv()  # loads GROQ_API_KEY from backend/.env

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


# ── Groq Client ────────────────────────────────────────────────────────────────
def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on the server.")
    return Groq(api_key=api_key)


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


class ReasonRequest(PredictRequest):
    decision: str            # "Bail Granted" | "Bail Rejected"


class ReasonResponse(BaseModel):
    reasoning: str


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


def build_reasoning_prompt(req: ReasonRequest) -> str:
    crime_part = f"Crime Type: {req.crime_type}\n" if req.crime_type else ""
    return f"""You are a judicial AI assistant specializing in Indian bail law.

Case Details:
- FIR Details: {req.fir_details}
- IPC Sections: {req.ipc_sections}
{crime_part}- Accused Name: {req.accused_name}
- Age: {req.age}
- Gender: {req.gender}
- Criminal History: {req.criminal_history}
- Severity Rating: {req.severity}
- Evidence Strength: {req.evidence_strength}
- Flight Risk: {req.flight_risk}

Bail Decision: {req.decision}

Provide a structured legal reasoning (3 concise paragraphs) that justifies the above bail decision.
In your reasoning:
1. Assess the accused's profile (age, criminal history, flight risk) and how it influences the decision.
2. Evaluate the nature and severity of the alleged offence, referencing the relevant IPC sections.
3. Weigh the evidence strength and public interest, citing applicable principles from Indian bail jurisprudence such as the Arnesh Kumar guidelines or Satender Kumar Antil v. CBI (2022) where relevant.

Use formal legal language. Be concise and factual. Do NOT add any preamble, headings, or bullet points — output only the three paragraphs as plain prose."""


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


@app.post("/reason", response_model=ReasonResponse)
def reason(req: ReasonRequest):
    """
    Calls Groq LLM to generate a structured legal justification for the bail decision.
    """
    logger.info(f"Generating reasoning for: {req.accused_name} → {req.decision}")

    client = get_groq_client()
    prompt = build_reasoning_prompt(req)

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior judicial AI assistant trained on Indian criminal law. "
                        "You produce precise, formal, and legally grounded bail reasoning. "
                        "You never fabricate case law — only cite real, well-known precedents."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=600,
        )
        reasoning_text = chat_completion.choices[0].message.content.strip()
        logger.info("Groq reasoning generated successfully.")
        return ReasonResponse(reasoning=reasoning_text)

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(status_code=502, detail=f"Reasoning service error: {str(e)}")
