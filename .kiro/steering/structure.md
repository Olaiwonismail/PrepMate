# Project Structure

## Repository Layout

```
.
├── backend/              # FastAPI backend
├── frontend/             # Next.js frontend
├── .kiro/                # Kiro configuration
└── README.md
```

## Backend Structure

```
backend/
├── main.py              # Application entry point, CORS, router registration
├── routers/             # API route handlers (one file per endpoint group)
│   ├── session.py       # POST /api/session/start - Question generation
│   ├── tts.py           # POST /api/tts - Text-to-speech
│   ├── stt.py           # POST /api/stt - Speech-to-text
│   ├── followup.py      # POST /api/followup - Follow-up generation
│   └── debrief.py       # POST /api/debrief - Feedback generation
├── services/            # External service integrations
│   ├── gemini.py        # Google Gemini LLM client
│   └── elevenlabs.py    # ElevenLabs TTS/STT client
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
└── .env                 # Environment variables (gitignored)
```

### Backend Conventions

- **Startup validation**: `main.py` validates required environment variables on startup (fail-fast)
- **Router organization**: Each router handles a specific API domain (session, tts, stt, followup, debrief)
- **Service layer**: External API integrations isolated in `services/` directory
- **Error handling**: Return appropriate HTTP status codes (400, 500, 502)
- **CORS**: Configured in `main.py` to allow frontend origin

## Frontend Structure

```
frontend/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home page (job description input)
│   ├── layout.tsx       # Root layout with InterviewSessionProvider
│   ├── globals.css      # Global styles and Tailwind directives
│   ├── interview/       # Interview page (Q&A interaction)
│   │   └── page.tsx
│   └── debrief/         # Debrief page (feedback display)
│       └── page.tsx
├── components/          # Reusable React components
│   ├── AudioRecorder.tsx
│   ├── QuestionCard.tsx
│   └── TranscriptDisplay.tsx
├── contexts/            # React Context providers
│   └── InterviewSessionContext.tsx
├── hooks/               # Custom React hooks
│   └── useInterviewSession.ts
├── package.json         # Node dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── .env.local.example   # Environment variable template
└── .env.local           # Environment variables (gitignored)
```

### Frontend Conventions

- **App Router**: Uses Next.js 15 App Router (not Pages Router)
- **Client components**: Pages and components use `"use client"` directive for interactivity
- **State management**: Global interview state managed via Context API (`InterviewSessionContext`)
- **Custom hooks**: Business logic extracted to hooks (e.g., `useInterviewSession`)
- **Styling**: Tailwind CSS utility classes with dark theme (`bg-[#1a1a1a]`, `text-white`)
- **Navigation**: Programmatic navigation via `useRouter` from `next/navigation`

## API Communication

- Frontend calls backend via `NEXT_PUBLIC_API_URL` (default: http://localhost:8000)
- Backend accepts requests from frontend origin (CORS configured)
- All API routes prefixed with `/api/`

## Configuration Files

- **Backend**: `.env` (required environment variables)
- **Frontend**: `.env.local` (optional environment variables)
- **Git**: `.gitignore` excludes `.env`, `.env.local`, `node_modules/`, `__pycache__/`, `.next/`

## Development Workflow

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Access app: http://localhost:3000
4. Access API docs: http://localhost:8000/docs
