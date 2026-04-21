# Implementation Plan: PrepMate — AI Mock Interviewer

## Overview

Implement PrepMate as a stateless, voice-driven mock interview app. The backend is a FastAPI service that orchestrates calls to Google Gemini (LLM) and ElevenLabs (TTS/STT). The frontend is a Next.js app that manages all session state in the browser and walks the user through the interview loop. Tasks are ordered so each step builds on the previous one, ending with full integration.

## Tasks

- [x] 1. Set up project structure and configuration
  - Create `backend/` directory with FastAPI app skeleton (`main.py`, `requirements.txt`, `.env.example`)
  - Create `frontend/` directory with Next.js app (`npx create-next-app --typescript --tailwind`)
  - Add environment variable loading to backend (`python-dotenv`); define `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
  - Add `NEXT_PUBLIC_API_URL` to `frontend/.env.local.example`
  - Add startup validation in `main.py` that raises `RuntimeError` if any required API key is missing
  - _Requirements: Tech stack, MVP constraints_

- [x] 2. Implement backend Gemini integration and question generation
  - [x] 2.1 Implement Gemini client wrapper and prompt construction
    - Install `google-generativeai` SDK; create `backend/services/gemini.py`
    - Write `build_question_prompt(job_description: str) -> str` function
    - Write `call_gemini(prompt: str) -> dict` function using `gemini-1.5-flash` with `response_mime_type: application/json`
    - _Requirements: Core flow step 2_

  - [ ]* 2.2 Write property test for question generation (Property 1)
    - **Property 1: Question generation always returns exactly 5 questions**
    - Mock Gemini response; use `@given(st.text(min_size=1))` with `@settings(max_examples=100)`
    - Verify `len(result["questions"]) == 5` and all entries are non-empty strings for any non-empty JD
    - **Validates: Requirements — Core flow step 2**

  - [x] 2.3 Implement `POST /api/session/start` endpoint
    - Create `backend/routers/session.py`; define Pydantic request model `SessionStartRequest(job_description: str)`
    - Validate non-empty/non-whitespace JD; return `400` with `{"error": "job_description is required"}` otherwise
    - Call Gemini, parse response with Pydantic `QuestionsResponse(questions: list[str])`; pad to 5 with generic fallback questions if fewer returned
    - Return `{"questions": [...]}` (exactly 5 strings)
    - Handle Gemini errors and malformed JSON per error-handling spec (retry once, then `502`)
    - _Requirements: Core flow step 2_

  - [ ]* 2.4 Write unit tests for session start endpoint
    - Test: valid JD returns 5 questions
    - Test: empty/whitespace JD returns `400`
    - Test: Gemini returning 3 questions is padded to 5
    - Test: Gemini returning malformed JSON triggers retry then `502`
    - _Requirements: Core flow step 2_

- [x] 3. Implement backend ElevenLabs TTS endpoint
  - [x] 3.1 Implement ElevenLabs TTS client and `POST /api/tts` endpoint
    - Create `backend/services/elevenlabs.py`; implement `synthesize_speech(text: str, voice_id: str) -> bytes`
    - Call `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with `model_id: eleven_flash_v2_5`
    - Create `backend/routers/tts.py`; accept `{"text": str, "voice_id": str?}`, return `StreamingResponse` with `Content-Type: audio/mpeg`
    - Handle ElevenLabs errors; return `502` with `{"error": "TTS service unavailable"}`
    - _Requirements: Core flow step 3_

  - [ ]* 3.2 Write unit tests for TTS endpoint
    - Test: valid text returns audio bytes with correct content-type header
    - Test: ElevenLabs error returns `502`
    - Test: uses `ELEVENLABS_VOICE_ID` env var as default when `voice_id` not provided
    - _Requirements: Core flow step 3_

- [x] 4. Implement backend ElevenLabs STT endpoint
  - [x] 4.1 Implement ElevenLabs STT client and `POST /api/stt` endpoint
    - Add `transcribe_audio(audio_bytes: bytes, filename: str) -> str` to `backend/services/elevenlabs.py`
    - Call `POST https://api.elevenlabs.io/v1/speech-to-text` with `model_id=scribe_v2` as multipart form
    - Create `backend/routers/stt.py`; accept `multipart/form-data` with `audio` field; return `{"transcript": str}`
    - Return `400` if audio field is missing; `502` on ElevenLabs error
    - _Requirements: Core flow step 4_

  - [ ]* 4.2 Write unit tests for STT endpoint
    - Test: valid audio blob returns non-empty transcript
    - Test: missing audio field returns `400`
    - Test: ElevenLabs error returns `502`
    - _Requirements: Core flow step 4_

- [x] 5. Implement backend follow-up and debrief endpoints
  - [x] 5.1 Implement `POST /api/followup` endpoint
    - Add `build_followup_prompt(question: str, answer: str) -> str` to `backend/services/gemini.py`
    - Create `backend/routers/followup.py`; accept `{"question": str, "answer": str}`; return `{"followup": str}`
    - Parse Gemini response with Pydantic `FollowupResponse(followup: str)`
    - Handle errors per error-handling spec
    - _Requirements: Core flow step 5_

  - [ ]* 5.2 Write property test for follow-up generation (Property 2)
    - **Property 2: Follow-up generation always returns a non-empty question**
    - Mock Gemini; use `@given(st.text(min_size=1), st.text(min_size=1))` with `@settings(max_examples=100)`
    - Verify `result["followup"]` is a non-empty string for any non-empty (question, answer) pair
    - **Validates: Requirements — Core flow step 5**

  - [x] 5.3 Implement `POST /api/debrief` endpoint
    - Add `build_debrief_prompt(job_description: str, qa_pairs: list) -> str` to `backend/services/gemini.py`
    - Create `backend/routers/debrief.py`; accept full debrief request body per design spec
    - Parse Gemini response with Pydantic `DebriefResponse`; clamp `overall_score` to [0, 100] and each `feedback[i].score` to [0, 10]
    - Return structured debrief JSON; handle errors per error-handling spec
    - _Requirements: Core flow step 6_

  - [ ]* 5.4 Write property test for debrief response (Property 3)
    - **Property 3: Debrief response always has valid structure and scores within range**
    - Mock Gemini; use `@given(st.lists(qa_pair_strategy(), min_size=1, max_size=5))` with `@settings(max_examples=100)`
    - Verify `0 <= overall_score <= 100`, all `0 <= feedback[i].score <= 10`, `summary` is non-empty, `len(feedback) == len(qa_pairs)`
    - **Validates: Requirements — Core flow step 6**

  - [ ]* 5.5 Write unit tests for debrief endpoint
    - Test: valid Q&A pairs return correctly structured debrief
    - Test: out-of-range scores from Gemini are clamped to valid ranges
    - Test: prompt construction correctly interpolates JD and Q&A pairs
    - _Requirements: Core flow step 6_

- [x] 6. Checkpoint — Ensure all backend tests pass
  - Ensure all backend unit tests and property tests pass, ask the user if questions arise.

- [x] 7. Implement frontend session state and job description page
  - [x] 7.1 Implement `useInterviewSession` hook
    - Create `frontend/hooks/useInterviewSession.ts`
    - Define `InterviewSession` and `AnswerRecord` TypeScript interfaces per design spec
    - Implement state with `phase` transitions: `"idle" | "loading" | "asking" | "recording" | "processing" | "followup" | "debrief"`
    - Expose actions: `startSession(jd)`, `submitAnswer(blob)`, `submitFollowupAnswer(blob)`, `reset()`
    - _Requirements: Core flow steps 1–6_

  - [ ]* 7.2 Write unit tests for `useInterviewSession`
    - Test: `startSession` transitions phase from `idle` → `loading` → `asking`
    - Test: `submitAnswer` transitions phase from `recording` → `processing` → `followup`
    - Test: after all questions answered, phase transitions to `debrief`
    - _Requirements: Core flow steps 1–6_

  - [x] 7.3 Implement `JobDescriptionPage`
    - Create `frontend/app/page.tsx` (or `pages/index.tsx`)
    - Render textarea for JD input and "Start Interview" button
    - Disable button when textarea is empty; call `startSession` on submit
    - Show loading state while backend generates questions
    - Display inline error message on backend error with retry option
    - _Requirements: Core flow step 1_

  - [ ]* 7.4 Write unit tests for `JobDescriptionPage`
    - Test: "Start Interview" button is disabled when textarea is empty
    - Test: button is enabled when textarea has content
    - Test: loading state is shown while fetching questions
    - _Requirements: Core flow step 1_

- [x] 8. Implement frontend interview flow components
  - [x] 8.1 Implement `QuestionCard` component
    - Create `frontend/components/QuestionCard.tsx`
    - Display current question text
    - Fetch TTS audio from `POST /api/tts` on mount; render `<audio>` element and auto-play
    - If TTS fails, show question text only and allow user to proceed without audio
    - _Requirements: Core flow step 3_

  - [ ]* 8.2 Write unit tests for `QuestionCard`
    - Test: question text is rendered
    - Test: audio element is present when TTS succeeds
    - Test: question text is still shown when TTS fails
    - _Requirements: Core flow step 3_

  - [x] 8.3 Implement `AudioRecorder` component
    - Create `frontend/components/AudioRecorder.tsx`
    - Wrap `MediaRecorder` API; handle microphone permission request
    - Expose `idle → recording → processing` state transitions via UI (record/stop buttons)
    - On stop, send audio blob to `POST /api/stt`; pass transcript up via callback
    - Show permission-denied message if microphone access is blocked
    - Show error toast with "Try again" button on recording failure
    - _Requirements: Core flow step 4_

  - [ ]* 8.4 Write unit tests for `AudioRecorder`
    - Test: recording state transitions from idle → recording → processing
    - Test: permission-denied state is shown when microphone is blocked
    - _Requirements: Core flow step 4_

  - [x] 8.5 Implement `TranscriptDisplay` component
    - Create `frontend/components/TranscriptDisplay.tsx`
    - Render transcript text returned from STT
    - Show placeholder text while processing
    - _Requirements: Core flow step 4_

  - [x] 8.6 Implement `InterviewPage` orchestration component
    - Create `frontend/app/interview/page.tsx` (or `pages/interview.tsx`)
    - Compose `QuestionCard`, `AudioRecorder`, and `TranscriptDisplay`
    - Drive UI from `useInterviewSession` phase state machine
    - Handle main question loop (5 questions) and follow-up question per answer
    - On completion of all Q&A, call `POST /api/debrief` and transition to debrief phase
    - Show "Connection issue" message with retry button on network timeout
    - _Requirements: Core flow steps 3–6_

- [x] 9. Implement `DebriefPage` component
  - [x] 9.1 Implement `DebriefPage`
    - Create `frontend/components/DebriefPage.tsx`
    - Render `overall_score`, `summary`, and per-question feedback cards
    - Each feedback card shows `question`, `score`, `strengths` list, and `improvements` list
    - Add "Start New Interview" button that calls `reset()` and navigates back to `JobDescriptionPage`
    - _Requirements: Core flow step 6_

  - [ ]* 9.2 Write unit tests for `DebriefPage`
    - Test: overall score is rendered
    - Test: per-question feedback cards are rendered with correct count
    - Test: strengths and improvements lists are displayed
    - _Requirements: Core flow step 6_

- [x] 10. Wire backend routers and configure CORS
  - Register all routers (`session`, `tts`, `stt`, `followup`, `debrief`) in `backend/main.py`
  - Add CORS middleware to allow requests from the frontend origin (`NEXT_PUBLIC_API_URL`)
  - Verify all endpoints are reachable at their defined paths
  - _Requirements: Tech stack, Core flow steps 1–6_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all backend and frontend tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Property tests (Properties 1–3) validate universal correctness guarantees using Hypothesis
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests (gated behind `RUN_INTEGRATION_TESTS=true`) are not included as coding tasks since they require live API credentials
- All session state lives in the browser — the backend is stateless and requires no database
