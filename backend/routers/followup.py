"""Followup router — handles POST /api/followup."""

import json
import logging
import re

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.gemini import build_followup_prompt, build_acknowledgment_prompt, call_gemini

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class FollowupRequest(BaseModel):
    question: str
    answer: str
    previous_acknowledgments: list[str] = []


class FollowupResponse(BaseModel):
    needs_followup: bool
    missing: str | None
    followup: str | None
    acknowledgment: str | None  # Added for transition acknowledgments


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def clean_json_response(text: str) -> str:
    """Clean up Gemini response to extract valid JSON."""
    # Remove markdown code blocks if present
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*$', '', text, flags=re.MULTILINE)
    
    # Find the first { and last }
    start = text.find('{')
    end = text.rfind('}')
    
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    
    return text


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("")
async def generate_followup(body: FollowupRequest):
    """Generate a follow-up question based on the original question and answer."""

    prompt = build_followup_prompt(body.question, body.answer)

    try:
        raw = call_gemini(prompt)
        # Validate structure
        if "needs_followup" not in raw or not isinstance(raw["needs_followup"], bool):
            raise ValueError(f"Unexpected Gemini response shape: {raw}")

        acknowledgment = None
        
        # If no follow-up is needed, generate an acknowledgment for transition
        if not raw["needs_followup"]:
            ack_prompt = build_acknowledgment_prompt(body.answer, body.previous_acknowledgments)
            try:
                ack_raw = call_gemini(ack_prompt)
                acknowledgment = ack_raw.get("acknowledgment")
            except Exception as ack_exc:
                logger.warning("Failed to generate acknowledgment: %s", ack_exc)
                # Use a default acknowledgment if generation fails
                acknowledgment = "Got it."

        validated = FollowupResponse(
            needs_followup=raw["needs_followup"],
            missing=raw.get("missing"),
            followup=raw.get("followup"),
            acknowledgment=acknowledgment
        )
        return {
            "needs_followup": validated.needs_followup,
            "missing": validated.missing,
            "followup": validated.followup,
            "acknowledgment": validated.acknowledgment
        }

    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini API error during followup generation: %s", exc)
        return JSONResponse(
            status_code=502,
            content={"error": "LLM service unavailable"},
        )
