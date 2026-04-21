"""STT router — handles POST /api/stt."""

import logging

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.elevenlabs import transcribe_audio

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class TranscriptResponse(BaseModel):
    transcript: str


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.post("")
async def speech_to_text(audio: UploadFile = File(None)):
    """Transcribe audio to text using ElevenLabs STT.

    Returns {"transcript": str} on success, or 400/502 on error.
    """
    # Validate that audio field is present
    if audio is None:
        return JSONResponse(
            status_code=400,
            content={"error": "audio field is required"},
        )

    try:
        # Read audio bytes from the uploaded file
        audio_bytes = await audio.read()
        filename = audio.filename or "audio.webm"

        # Call ElevenLabs STT
        transcript = transcribe_audio(audio_bytes, filename)

        return {"transcript": transcript}

    except Exception as exc:  # noqa: BLE001
        logger.error("ElevenLabs STT error: %s", exc)
        return JSONResponse(
            status_code=502,
            content={"error": "STT service unavailable"},
        )
