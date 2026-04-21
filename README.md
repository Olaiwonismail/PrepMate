# PrepMate AI Mock Interviewer

An AI-powered mock interview platform that helps candidates practice technical interviews with realistic questions, follow-ups, and detailed feedback.

## Features

- **AI Question Generation**: Generates 5 tailored interview questions based on job descriptions using Google Gemini
- **Voice Interaction**: Natural voice conversations powered by ElevenLabs TTS/STT
- **Dynamic Follow-ups**: AI generates contextual follow-up questions based on your answers
- **Detailed Debrief**: Comprehensive feedback with scores, strengths, and improvement areas for each question
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Google Gemini**: LLM for question generation and evaluation
- **ElevenLabs**: Text-to-speech and speech-to-text services
- **Python 3.x**: Core backend language

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── routers/         # API route handlers
│   ├── services/        # External service integrations
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js frontend
│   ├── app/            # App Router pages
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   └── hooks/          # Custom React hooks
└── README.md           # This file
```

## Prerequisites

- **Python 3.8+**
- **Node.js 18+** and npm
- **API Keys**:
  - Google Gemini API key
  - ElevenLabs API key and Voice ID

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=your_voice_id
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` if needed (defaults to `http://localhost:8000`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## Usage

1. **Start Interview**: Enter a job description on the home page
2. **Answer Questions**: Use voice or text to answer the 5 generated questions
3. **Follow-ups**: Respond to AI-generated follow-up questions
4. **Review Debrief**: Get detailed feedback with scores and improvement suggestions

---

## Spec-Driven Development with Kiro

This project was built using **Kiro's spec-driven development workflow**, which structures feature development into three distinct phases: Requirements → Design → Implementation. This approach ensures clarity, reduces rework, and maintains alignment between intent and execution.

### What is Spec-Driven Development?

Spec-driven development is a structured approach where you:
1. **Define requirements** - What needs to be built and why
2. **Design the solution** - How it will work (architecture, data flow, API contracts)
3. **Implement incrementally** - Break design into tasks and execute with AI assistance

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SPEC-DRIVEN WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │ REQUIREMENTS │────────▶│    DESIGN    │────────▶│IMPLEMENTATION│
    └──────────────┘         └──────────────┘         └──────────────┘
          │                         │                         │
          │                         │                         │
          ▼                         ▼                         ▼
    
    What to build?          How to build it?         Build it!
    ─────────────           ────────────────         ─────────
    • User stories          • Architecture           • Task breakdown
    • Acceptance criteria   • Data models            • Incremental dev
    • Success metrics       • API contracts          • AI-assisted coding
                           • Component design        • Continuous testing


┌─────────────────────────────────────────────────────────────────────┐
│                      PREPMATE ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │                      FRONTEND (Next.js)                      │
    │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
    │  │   Home     │  │ Interview  │  │      Debrief       │   │
    │  │   Page     │  │    Page    │  │       Page         │   │
    │  └─────┬──────┘  └─────┬──────┘  └──────────┬─────────┘   │
    │        │                │                     │              │
    │        └────────────────┴─────────────────────┘              │
    │                         │                                    │
    │              ┌──────────▼──────────┐                        │
    │              │ InterviewSession    │                        │
    │              │     Context         │                        │
    │              └──────────┬──────────┘                        │
    └─────────────────────────┼─────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
    ┌─────────────────────────▼─────────────────────────────────┐
    │                    BACKEND (FastAPI)                       │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
    │  │ Session  │  │   TTS    │  │   STT    │  │ Followup │ │
    │  │  Router  │  │  Router  │  │  Router  │  │  Router  │ │
    │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
    │       │             │              │              │        │
    │       └─────────────┴──────────────┴──────────────┘        │
    │                         │                                  │
    │              ┌──────────▼──────────┐                      │
    │              │   Service Layer     │                      │
    │              └──────────┬──────────┘                      │
    └─────────────────────────┼─────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
    ┌────────────▼──────────┐  ┌──────────▼──────────┐
    │   Google Gemini       │  │    ElevenLabs       │
    │   ─────────────       │  │    ───────────      │
    │   • Question gen      │  │    • TTS (speech)   │
    │   • Follow-ups        │  │    • STT (audio)    │
    │   • Evaluation        │  │                     │
    └───────────────────────┘  └─────────────────────┘
```

### How We Used Specs in PrepMate

#### 1. Requirements Phase
**File**: `.kiro/specs/prepmate-ai-mock-interviewer/requirements.md`

Defined:
- User personas (job seekers preparing for interviews)
- Core features (5-question format, voice interaction, feedback)
- Success criteria (realistic interview experience, actionable feedback)
- Non-functional requirements (response time, accessibility)

#### 2. Design Phase
**File**: `.kiro/specs/prepmate-ai-mock-interviewer/design.md`

Specified:
- **Architecture**: FastAPI backend + Next.js frontend
- **Data Flow**: Job description → Questions → Answers → Follow-ups → Debrief
- **API Contracts**: 
  - `POST /api/session/start` - Generate questions
  - `POST /api/stt` - Transcribe audio
  - `POST /api/followup` - Generate follow-ups
  - `POST /api/debrief` - Evaluate performance
- **Component Design**: InterviewSessionContext, AudioRecorder, QuestionCard
- **State Management**: React Context for interview session state

#### 3. Implementation Phase
**File**: `.kiro/specs/prepmate-ai-mock-interviewer/tasks.md`

Broke down into tasks:
- ✅ Set up FastAPI backend with routers
- ✅ Integrate Google Gemini for question generation
- ✅ Integrate ElevenLabs for TTS/STT
- ✅ Build Next.js frontend with App Router
- ✅ Implement interview session state management
- ✅ Create audio recording component
- ✅ Build debrief page with feedback display
- ✅ Apply design system (typography, color, spacing)

### Benefits of Spec-Driven Development

1. **Clarity**: Everyone understands what's being built and why
2. **Reduced Rework**: Design decisions made upfront prevent costly changes
3. **Better Collaboration**: Specs serve as documentation and communication tool
4. **AI-Friendly**: Clear specs enable AI to generate better code
5. **Incremental Progress**: Tasks provide clear checkpoints and milestones
6. **Maintainability**: Future developers understand the original intent

### Key Learnings

- **Start with Requirements**: Don't jump to code without understanding the problem
- **Design Before Implementation**: Architecture decisions are easier to change on paper
- **Break Down Tasks**: Small, focused tasks are easier to implement and test
- **Iterate on Specs**: Specs evolve as you learn - update them as needed
- **Use AI Effectively**: Clear specs help AI assistants generate better code

### Spec Files Location

All spec files are stored in `.kiro/specs/prepmate-ai-mock-interviewer/`:
- `requirements.md` - What to build
- `design.md` - How to build it
- `tasks.md` - Implementation checklist

---

## API Documentation

The backend provides interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

For detailed endpoint information, see [backend/API_ENDPOINTS.md](backend/API_ENDPOINTS.md)

## Development

### Backend Development

Run with auto-reload:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development

Run development server:
```bash
cd frontend
npm run dev
```

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

## Environment Variables

### Backend (.env)
- `GEMINI_API_KEY`: Google Gemini API key (required)
- `ELEVENLABS_API_KEY`: ElevenLabs API key (required)
- `ELEVENLABS_VOICE_ID`: ElevenLabs voice ID (required)
- `NEXT_PUBLIC_API_URL`: Frontend origin for CORS (optional, defaults to localhost:3000)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (optional, defaults to http://localhost:8000)

## License

This project is private and not licensed for public use.

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.
