# PrepMate — AI Mock Interviewer

## What it does
A voice-driven mock interview app. User pastes a job description, 
AI generates role-specific interview questions, asks them via voice 
(ElevenLabs TTS), listens to the user's spoken answer (ElevenLabs STT), 
asks a follow-up question based on the answer, then gives a scored debrief.

## Core flow
1. User pastes a job description
2. Backend parses JD and generates 5 interview questions using Gemini
3. Frontend displays question and plays it via ElevenLabs TTS
4. User speaks their answer — ElevenLabs STT transcribes it
5. Gemini generates a follow-up question based on the answer
6. After all questions, backend generates a scored debrief

## Tech stack
- Backend: FastAPI (Python)
- Frontend: Next.js + TailwindCSS
- Voice: ElevenLabs TTS + STT
- LLM: Google Gemini
- Deployment: Vercel (frontend) + Render (backend)

## MVP constraints
- No auth
- No database
- No coding challenges
- One session at a time