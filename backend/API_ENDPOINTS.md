# PrepMate API Endpoints

## Base URL
- Development: `http://localhost:8000`
- Production: Configure via deployment

## Health Check

### GET /health
Simple liveness probe to verify the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Session Management

### POST /api/session/start
Generate 5 interview questions based on a job description.

**Request:**
```json
{
  "job_description": "string"
}
```

**Response (200):**
```json
{
  "questions": [
    "string",
    "string",
    "string",
    "string",
    "string"
  ]
}
```

**Error Responses:**
- `400`: Job description is empty or whitespace-only
- `502`: Gemini API unavailable

---

## Text-to-Speech

### POST /api/tts
Convert text to speech using ElevenLabs TTS.

**Request:**
```json
{
  "text": "string",
  "voice_id": "string (optional)"
}
```

**Response (200):**
- Content-Type: `audio/mpeg`
- Body: Raw MP3 audio bytes

**Error Responses:**
- `500`: Voice ID not configured
- `502`: ElevenLabs TTS service unavailable

---

## Speech-to-Text

### POST /api/stt
Transcribe audio to text using ElevenLabs STT.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `audio` (audio file blob)

**Response (200):**
```json
{
  "transcript": "string"
}
```

**Error Responses:**
- `400`: Audio field is missing
- `502`: ElevenLabs STT service unavailable

---

## Follow-up Generation

### POST /api/followup
Generate a follow-up question based on the original question and answer.

**Request:**
```json
{
  "question": "string",
  "answer": "string"
}
```

**Response (200):**
```json
{
  "followup": "string"
}
```

**Error Responses:**
- `502`: Gemini API unavailable

---

## Debrief Generation

### POST /api/debrief
Generate a scored debrief based on all Q&A pairs from the interview.

**Request:**
```json
{
  "job_description": "string",
  "qa_pairs": [
    {
      "question": "string",
      "answer": "string",
      "followup": "string (optional)",
      "followup_answer": "string (optional)"
    }
  ]
}
```

**Response (200):**
```json
{
  "overall_score": 85,
  "summary": "string",
  "feedback": [
    {
      "question": "string",
      "score": 8.5,
      "strengths": ["string", "string"],
      "improvements": ["string", "string"]
    }
  ]
}
```

**Error Responses:**
- `502`: Gemini API unavailable

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (development)
- The origin specified in `NEXT_PUBLIC_API_URL` environment variable

CORS settings:
- `allow_credentials`: True
- `allow_methods`: All methods (`*`)
- `allow_headers`: All headers (`*`)

---

## Interactive API Documentation

FastAPI provides automatic interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
