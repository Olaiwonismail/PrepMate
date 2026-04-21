"use client";

import { useEffect, useState, useRef } from "react";

interface QuestionCardProps {
  question: string;
  acknowledgment?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function QuestionCard({ question, acknowledgment }: QuestionCardProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTTS = async () => {
      setIsLoadingAudio(true);
      setAudioError(false);

      try {
        // Combine acknowledgment and question for TTS
        const textToSpeak = acknowledgment 
          ? `${acknowledgment} ${question}`
          : question;

        const response = await fetch(`${API_URL}/api/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: textToSpeak }),
        });

        if (!response.ok) {
          throw new Error(`TTS request failed: ${response.status}`);
        }

        // Get the audio blob and create an object URL
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (error) {
        console.error("Failed to fetch TTS audio:", error);
        setAudioError(true);
      } finally {
        setIsLoadingAudio(false);
      }
    };

    fetchTTS();

    // Cleanup: revoke the object URL when component unmounts or question changes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [question, acknowledgment]);

  // Auto-play when audio is loaded
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Auto-play failed:", error);
      });
    }
  }, [audioUrl]);

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Replay failed:", error);
        setAudioError(true);
      });
    }
  };

  return (
    <div className="w-full">
      {/* Hidden audio element */}
      {audioUrl && !audioError && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onError={() => setAudioError(true)}
          aria-label="Question audio"
        />
      )}

      {/* Replay Button - Clear state */}
      {audioUrl && !audioError && !isLoadingAudio && (
        <div className="mb-4">
          <button
            onClick={handleReplay}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-base ease-smooth min-h-touch ${
              isPlaying
                ? "bg-surface text-muted cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover text-white"
            }`}
            aria-label={isPlaying ? "Playing question" : "Replay question"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isPlaying ? "Playing..." : "Replay question"}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoadingAudio && !audioError && (
        <div className="flex items-center gap-2 text-sm text-muted py-4" role="status" aria-live="polite">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading audio...
        </div>
      )}

      {/* Error state - Helpful message */}
      {audioError && (
        <div className="p-3 bg-accent/10 border-l-4 border-accent" role="alert">
          <p className="text-sm text-foreground/80">
            Audio unavailable. Please read the question above.
          </p>
        </div>
      )}
    </div>
  );
}
