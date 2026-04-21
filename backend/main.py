import os
from dotenv import load_dotenv

# Load environment variables from .env file (if present)
load_dotenv()

# Startup validation — fail fast if any required API key is missing
_REQUIRED_ENV_VARS = [
    "GEMINI_API_KEY",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
]

_missing = [var for var in _REQUIRED_ENV_VARS if not os.getenv(var)]
if _missing:
    raise RuntimeError(
        f"Missing required environment variables: {', '.join(_missing)}. "
        "Copy .env.example to .env and fill in the values."
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import debrief, followup, session, stt, tts

app = FastAPI(
    title="PrepMate API",
    description="AI Mock Interviewer backend — orchestrates Gemini LLM and ElevenLabs TTS/STT.",
    version="0.1.0",
)

# CORS — allow requests from the configured frontend origin
_frontend_origin = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Simple liveness probe."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(session.router, prefix="/api/session")
app.include_router(stt.router, prefix="/api/stt")
app.include_router(tts.router, prefix="/api/tts")
app.include_router(followup.router, prefix="/api/followup")
app.include_router(debrief.router, prefix="/api/debrief")
