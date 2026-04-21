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
