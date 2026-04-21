"""TTS router — handles POST /api/tts."""

import logging
import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from services.elevenlabs import synthesize_speech

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class TTSRequest(BaseModel):
    text: str
    voice_id: str | None = None


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("")
async def text_to_speech(body: TTSRequest):
    """Synthesize speech from text using ElevenLabs TTS.

    Returns audio/mpeg binary stream on success, or 502 on ElevenLabs error.
    """
    # Use provided voice_id or fall back to environment variable
    voice_id = body.voice_id or os.getenv("ELEVENLABS_VOICE_ID")

    if not voice_id:
        logger.error("No voice_id provided and ELEVENLABS_VOICE_ID not set")
        return JSONResponse(
            status_code=500,
            content={"error": "Voice ID not configured"},
        )

    try:
        audio_bytes = synthesize_speech(body.text, voice_id)
        return StreamingResponse(
            iter([audio_bytes]),
            media_type="audio/mpeg",
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("ElevenLabs TTS error: %s", exc)
        return JSONResponse(
            status_code=502,
            content={"error": "TTS service unavailable"},
        )
