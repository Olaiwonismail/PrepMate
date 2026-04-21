"""Debrief router — handles POST /api/debrief."""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.gemini import build_debrief_prompt, call_gemini

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class QAPair(BaseModel):
    question: str
    answer: str
    followup: str | None = None
    followup_answer: str | None = None


class DebriefRequest(BaseModel):
    job_description: str
    qa_pairs: list[QAPair]


class FeedbackItem(BaseModel):
    question: str
    score: float
    strengths: list[str]
    improvements: list[str]


class DebriefResponse(BaseModel):
    overall_score: int
    summary: str
    feedback: list[FeedbackItem]


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def _clamp_overall_score(score: int | float) -> int:
    """Clamp overall_score to [0, 100]."""
    return max(0, min(100, int(score)))


def _clamp_feedback_score(score: int | float) -> float:
    """Clamp feedback score to [0, 10]."""
    return max(0.0, min(10.0, float(score)))


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("")
async def generate_debrief(body: DebriefRequest):
    """Generate a scored debrief based on all Q&A pairs."""

    # Convert Pydantic models to dicts for prompt building
    qa_pairs_dicts = [pair.model_dump() for pair in body.qa_pairs]
    prompt = build_debrief_prompt(body.job_description, qa_pairs_dicts)

    try:
        raw = call_gemini(prompt)

        # Validate structure
        if "overall_score" not in raw or "summary" not in raw or "feedback" not in raw:
            raise ValueError(f"Unexpected Gemini response shape: {raw}")

        # Clamp scores to valid ranges
        raw["overall_score"] = _clamp_overall_score(raw["overall_score"])

        for item in raw["feedback"]:
            if "score" in item:
                item["score"] = _clamp_feedback_score(item["score"])

        # Validate with Pydantic
        validated = DebriefResponse(**raw)

        return {
            "overall_score": validated.overall_score,
            "summary": validated.summary,
            "feedback": [item.model_dump() for item in validated.feedback],
        }

    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini API error during debrief generation: %s", exc)
        return JSONResponse(
            status_code=502,
            content={"error": "LLM service unavailable"},
        )
