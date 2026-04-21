# PrepMate Application Flow Verification

## Complete User Journey

### ✅ Step 1: Home Page (`/`)
**File**: `frontend/app/page.tsx`

**Flow**:
1. User lands on home page
2. User enters job description in textarea
3. "Start Interview" button is disabled when textarea is empty
4. User clicks "Start Interview"
5. `startSession(jobDescription)` is called
6. Phase changes: `idle` → `loading`
7. Backend API call: `POST /api/session/start`
8. Backend generates 5 questions using Gemini
9. Phase changes: `loading` → `asking`
10. `useEffect` detects phase === "asking" and navigates to `/interview`

**Backend Endpoint**: `POST /api/session/start`
- Input: `{ job_description: string }`
- Output: `{ questions: string[] }` (exactly 5 questions)

---

### ✅ Step 2: Interview Page (`/interview`) - Main Question Loop

**File**: `frontend/app/interview/page.tsx`

**Flow** (for each of 5 questions):

#### 2a. Display Question
1. `QuestionCard` component displays current question
2. Fetches TTS audio: `POST /api/tts`
3. Plays audio automatically
4. If TTS fails, shows text-only fallback

#### 2b. Record Answer
1. User clicks "Start Recording"
2. `AudioRecorder` requests microphone permission
3. User speaks their answer
4. User clicks "Stop Recording"
5. Audio blob is created

#### 2c. Process Answer
1. `handleRecordingComplete(blob)` is called
2. Phase changes: `asking` → `processing`
3. Audio is transcribed: `POST /api/stt`
4. Follow-up question is generated: `POST /api/followup`
5. Answer record is created with transcript and followup
6. Phase changes: `processing` → `followup`

#### 2d. Display Follow-up Question
1. `QuestionCard` displays the follow-up question
2. Fetches TTS audio for follow-up
3. User records follow-up answer (same as 2b)

#### 2e. Process Follow-up Answer
1. `submitFollowupAnswer(blob)` is called
2. Phase changes: `followup` → `processing`
3. Audio is transcribed: `POST /api/stt`
4. Answer record is updated with followup transcript
5. `currentIndex` is incremented
6. If `currentIndex < 5`: Phase changes to `asking` (next question)
7. If `currentIndex === 5`: Phase changes to `debrief`

**Backend Endpoints**:
- `POST /api/tts`: Text → Audio (MP3)
- `POST /api/stt`: Audio → Text transcript
- `POST /api/followup`: Question + Answer → Follow-up question

---

### ✅ Step 3: Debrief Page (`/debrief`)

**File**: `frontend/app/debrief/page.tsx`

**Flow**:
1. `useEffect` detects phase === "debrief" on interview page
2. Navigates to `/debrief`
3. `DebriefPage` loads
4. Checks if session has data (redirects to home if not)
5. Calls `POST /api/debrief` with all Q&A pairs
6. Backend generates scored debrief using Gemini
7. Displays:
   - Overall score (0-100) with color-coded bar
   - Summary text
   - Per-question feedback cards with:
     - Question text
     - Score (0-10)
     - Strengths list
     - Improvements list
8. User clicks "Start New Interview"
9. `reset()` is called
10. Phase changes: `debrief` → `idle`
11. Navigates back to `/`

**Backend Endpoint**: `POST /api/debrief`
- Input: `{ job_description: string, qa_pairs: QAPair[] }`
- Output: `{ overall_score: number, summary: string, feedback: FeedbackItem[] }`

---

## State Management

### Session State Structure
```typescript
interface InterviewSession {
  jobDescription: string;
  questions: string[];        // 5 questions from Gemini
  currentIndex: number;        // 0-4 for main questions
  answers: AnswerRecord[];     // Array of Q&A records
  phase: Phase;                // Current phase
}

interface AnswerRecord {
  question: string;            // Main question
  transcript: string;          // Main answer transcript
  followup?: string;           // Follow-up question
  followupTranscript?: string; // Follow-up answer transcript
}

type Phase = 
  | "idle"       // Home page, no session
  | "loading"    // Generating questions
  | "asking"     // Displaying main question
  | "recording"  // User is recording (not used in state, only in AudioRecorder)
  | "processing" // Transcribing audio
  | "followup"   // Displaying follow-up question
  | "debrief";   // Interview complete, generating debrief
```

### State Sharing via Context
- `InterviewSessionProvider` wraps the entire app in `layout.tsx`
- All pages access the same session state via `useInterviewSession()` hook
- State persists across page navigations

---

## Phase Transitions

```
idle → loading → asking → processing → followup → processing → asking → ...
                                                                  ↓
                                                              debrief → idle
```

**Detailed Flow**:
1. `idle`: Initial state, home page
2. `loading`: User submitted JD, fetching questions
3. `asking`: Displaying main question (Q1-Q5)
4. `processing`: Transcribing main answer
5. `followup`: Displaying follow-up question
6. `processing`: Transcribing follow-up answer
7. Back to `asking` for next question (or `debrief` if done)
8. `debrief`: All 5 Q&A pairs complete, showing results
9. `idle`: User clicked "Start New Interview"

---

## Error Handling

### Frontend
- Empty job description → Button disabled
- Backend error during session start → Error message with retry
- Microphone permission denied → Permission prompt
- Audio recording fails → Error toast with retry
- TTS fails → Show text-only fallback
- STT fails → Error message, stay on same question
- Network timeout → Connection error with retry
- Debrief fetch fails → Error page with "Start New Interview" button

### Backend
- Empty/whitespace JD → `400 Bad Request`
- Gemini API error → Retry once, then `502 Bad Gateway`
- Gemini malformed JSON → Retry once, then `502`
- Gemini returns <5 questions → Pad with fallback questions
- ElevenLabs TTS error → `502 Bad Gateway`
- ElevenLabs STT error → `502 Bad Gateway`
- Missing audio in STT request → `400 Bad Request`
- Debrief scores out of range → Clamp to valid ranges

---

## Critical Fixes Applied

### 1. ✅ Router Update During Render
**Issue**: `router.push()` called directly in render function
**Fix**: Wrapped navigation in `useEffect` hook
**Files**: `frontend/app/page.tsx`

### 2. ✅ Session State Not Shared Across Pages
**Issue**: Each page created its own `useInterviewSession` instance
**Fix**: Created `InterviewSessionProvider` context to share state globally
**Files**: 
- `frontend/contexts/InterviewSessionContext.tsx` (new)
- `frontend/app/layout.tsx` (wrapped with provider)
- All pages updated to use context

---

## Testing Checklist

### Manual Testing Steps

#### 1. Home Page
- [ ] Page loads without errors
- [ ] Textarea accepts input
- [ ] Character counter updates
- [ ] Button is disabled when textarea is empty
- [ ] Button is enabled when textarea has content
- [ ] Loading state shows spinner
- [ ] Error message displays on backend failure
- [ ] Retry button works after error

#### 2. Interview Page - Question 1
- [ ] Navigates from home page automatically
- [ ] Question text displays
- [ ] TTS audio plays automatically
- [ ] Fallback works if TTS fails
- [ ] "Start Recording" button works
- [ ] Microphone permission prompt appears
- [ ] Recording indicator shows (red pulsing circle)
- [ ] "Stop Recording" button works
- [ ] Processing spinner shows
- [ ] Transcript displays after STT
- [ ] Follow-up question appears
- [ ] Follow-up TTS plays
- [ ] Follow-up recording works
- [ ] Progress bar shows 0% → 20%

#### 3. Interview Page - Questions 2-5
- [ ] Repeat above for each question
- [ ] Progress bar updates correctly (20%, 40%, 60%, 80%, 100%)
- [ ] Question counter shows correct number (2/5, 3/5, etc.)
- [ ] Phase indicators show correct state

#### 4. Debrief Page
- [ ] Navigates automatically after Q5 follow-up
- [ ] Loading spinner shows while generating debrief
- [ ] Overall score displays with correct color
- [ ] Score bar animates to correct percentage
- [ ] Summary text displays
- [ ] All 5 feedback cards display
- [ ] Each card shows question, score, strengths, improvements
- [ ] Score colors match thresholds (green ≥80%, yellow 60-79%, red <60%)
- [ ] "Start New Interview" button works
- [ ] Returns to home page with clean state

#### 5. Error Scenarios
- [ ] Empty JD → Button disabled
- [ ] Backend down → Error message with retry
- [ ] Microphone blocked → Permission denied message
- [ ] Network timeout → Connection error
- [ ] TTS fails → Text-only fallback
- [ ] STT fails → Error message, can retry recording

---

## Backend Verification

### Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload
```

### Test Endpoints

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Session Start
```bash
curl -X POST http://localhost:8000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"job_description": "Senior Software Engineer at a tech startup"}'
```

#### TTS
```bash
curl -X POST http://localhost:8000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about your experience with React"}' \
  --output test.mp3
```

#### Follow-up
```bash
curl -X POST http://localhost:8000/api/followup \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about your experience", "answer": "I have 5 years of experience"}'
```

---

## Frontend Verification

### Start Frontend Server
```bash
cd frontend
npm run dev
```

### Access Application
- Open browser: `http://localhost:3000`
- Follow manual testing checklist above

---

## Known Limitations (MVP)

1. **No Authentication**: Anyone can access the app
2. **No Database**: Session state is lost on page refresh
3. **No History**: Can't review past interviews
4. **Single Session**: Only one interview at a time
5. **No Coding Challenges**: Text/voice only
6. **Browser Refresh**: Loses all session data
7. **No Mobile Optimization**: Desktop-first design

---

## Next Steps (Post-MVP)

1. Add session persistence (localStorage or database)
2. Implement user authentication
3. Add interview history
4. Mobile responsive design
5. Add optional tests (property tests, unit tests)
6. Deploy to production (Vercel + Render)
7. Add analytics and monitoring
