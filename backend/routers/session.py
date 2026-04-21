"""Session router — handles POST /api/session/start."""

import json
import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.gemini import build_question_prompt, call_gemini

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class SessionStartRequest(BaseModel):
    job_description: str


class QuestionsResponse(BaseModel):
    questions: list[str]


# ---------------------------------------------------------------------------
# Fallback questions used when Gemini returns fewer than 5
# ---------------------------------------------------------------------------

_FALLBACK_QUESTIONS = [
    "Tell me about a challenging project you worked on.",
    "Describe a time you had to learn a new technology quickly.",
    "How do you approach debugging a difficult problem?",
    "Tell me about a time you collaborated effectively with a team.",
    "What is your greatest professional achievement so far?",
]


def _pad_to_five(questions: list[str]) -> list[str]:
    """Ensure the list has exactly 5 questions, padding with fallbacks if needed."""
    result = list(questions)
    fallback_iter = iter(_FALLBACK_QUESTIONS)
    while len(result) < 5:
        result.append(next(fallback_iter))
    return result[:5]


def _fetch_questions(prompt: str) -> dict:
    """Call Gemini once; raises on error."""
    return call_gemini(prompt)


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("/start")
async def session_start(body: SessionStartRequest):
    """Generate 5 interview questions for the given job description."""

    # Validate non-empty / non-whitespace job description
    if not body.job_description or not body.job_description.strip():
        return JSONResponse(
            status_code=400,
            content={"error": "job_description is required"},
        )

    prompt = build_question_prompt(body.job_description)

    # Attempt Gemini call with one retry on failure or malformed JSON
    raw: dict | None = None
    last_error: Exception | None = None

    for attempt in range(2):
        try:
            raw = _fetch_questions(prompt)
            # Validate structure — must have a "questions" list
            if not isinstance(raw.get("questions"), list):
                raise ValueError(f"Unexpected Gemini response shape: {raw}")
            break  # success
        except (json.JSONDecodeError, ValueError, KeyError) as exc:
            logger.warning("Gemini returned malformed JSON (attempt %d): %s", attempt + 1, exc)
            last_error = exc
            raw = None
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini API error (attempt %d): %s", attempt + 1, exc)
            last_error = exc
            raw = None

    if raw is None:
        logger.error("Gemini unavailable after 2 attempts: %s", last_error)
        return JSONResponse(
            status_code=502,
            content={"error": "LLM service unavailable"},
        )

    questions = _pad_to_five(raw["questions"])
    validated = QuestionsResponse(questions=questions)
    return {"questions": validated.questions}
