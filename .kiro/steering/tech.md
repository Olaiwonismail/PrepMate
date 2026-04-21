# Tech Stack

## Backend

- **Framework**: FastAPI 0.115.5
- **Runtime**: Python 3.8+
- **Server**: Uvicorn with standard extras
- **AI Services**:
  - Google Gemini (google-generativeai 0.8.3) - Question generation, follow-ups, debrief
  - ElevenLabs - Text-to-speech and speech-to-text
- **HTTP Client**: httpx 0.28.0
- **Environment**: python-dotenv 1.0.1
- **Validation**: Pydantic 2.10.3
- **File Upload**: python-multipart 0.0.17

## Frontend

- **Framework**: Next.js 15.5.15 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **Testing**: Jest 29.7.0 with React Testing Library

## Common Commands

### Backend

```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Development
uvicorn main:app --reload

# API Documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Frontend

```bash
# Setup
cd frontend
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start

# Testing
npm test

# Linting
npm run lint
```

## Environment Variables

### Backend (.env)

Required:
- `GEMINI_API_KEY` - Google Gemini API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `ELEVENLABS_VOICE_ID` - ElevenLabs voice ID

Optional:
- `NEXT_PUBLIC_API_URL` - Frontend origin for CORS (default: http://localhost:3000)

### Frontend (.env.local)

Optional:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Key Dependencies

- FastAPI provides automatic OpenAPI documentation at `/docs` and `/redoc`
- CORS configured to allow frontend origin with credentials
- Startup validation ensures all required environment variables are present (fail-fast)
- ElevenLabs handles both TTS (text-to-speech) and STT (speech-to-text)
- Gemini handles all LLM operations (question generation, follow-ups, evaluation)
