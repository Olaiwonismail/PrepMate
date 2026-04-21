"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "../../contexts/InterviewSessionContext";
import QuestionCard from "../../components/QuestionCard";
import AudioRecorder from "../../components/AudioRecorder";
import TranscriptDisplay from "../../components/TranscriptDisplay";

export default function InterviewPage() {
  const router = useRouter();
  const { session, submitAnswer, submitFollowupAnswer, error } =
    useInterviewSession();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [showClosingMessage, setShowClosingMessage] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Determine the current transcript to display
  const getCurrentTranscript = (): string | null => {
    if (session.answers.length === 0) return null;

    const lastAnswer = session.answers[session.answers.length - 1];

    if (session.phase === "followup") {
      return lastAnswer.transcript;
    }

    if (session.phase === "asking" && session.currentIndex > 0) {
      const previousAnswer = session.answers[session.currentIndex - 1];
      return previousAnswer?.followupTranscript || null;
    }

    return null;
  };

  const currentTranscript = getCurrentTranscript();

  // Redirect to home if no session
  useEffect(() => {
    if (session.phase === "idle") {
      router.push("/");
    }
  }, [session.phase, router]);

  // Navigate to debrief page when interview is complete
  useEffect(() => {
    if (session.phase === "debrief") {
      setShowClosingMessage(true);
      
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 3000);

      const navTimer = setTimeout(() => {
        router.push("/debrief");
      }, 4000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(navTimer);
      };
    }
  }, [session.phase, router]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsTranscribing(true);
    setNetworkError(null);

    try {
      if (session.phase === "asking") {
        await submitAnswer(blob);
      } else if (session.phase === "followup") {
        await submitFollowupAnswer(blob);
      }
    } catch (err) {
      console.error("Failed to process recording:", err);
      setNetworkError(
        "Connection lost. Check your network and try recording again."
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const retryConnection = () => {
    setNetworkError(null);
  };

  // Calculate progress
  const totalQuestions = 5;
  const currentQuestionNumber = session.currentIndex + 1;

  // Determine current question to display
  const getCurrentQuestion = () => {
    if (session.phase === "asking") {
      return session.questions[session.currentIndex];
    } else if (session.phase === "followup") {
      const lastAnswer = session.answers[session.answers.length - 1];
      return lastAnswer?.followup || "";
    }
    return "";
  };

  const currentQuestion = getCurrentQuestion();

  // Loading state
  if (session.phase === "idle" || session.phase === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-accent"
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
          <p className="text-lg text-muted">Loading interview...</p>
        </div>
      </main>
    );
  }

  // Closing message
  if (session.phase === "debrief") {
    return (
      <main 
        className={`flex min-h-screen flex-col bg-background transition-opacity duration-slow ${
          isFadingOut ? "opacity-0" : "opacity-100"
        }`}
      >
        {showClosingMessage && (
          <div className="flex-1 flex items-center justify-center px-6 md:px-8">
            <div className="max-w-2xl">
              <h2 className="mb-4">That's all for today</h2>
              <p className="text-xl text-muted">
                Let's review how you did.
              </p>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Top Bar - Mobile-first */}
      <div className="bg-surface border-b border-border px-6 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-2 h-2 bg-accent rounded-full" aria-hidden="true"></div>
            <span className="text-foreground font-medium text-sm md:text-base">Mock Interview</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm font-mono" aria-label={`Question ${currentQuestionNumber} of ${totalQuestions}`}>
              {currentQuestionNumber}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Fluid spacing */}
      <div className="flex-1 px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Question Display */}
          {currentQuestion && (
            <div className="mb-8 md:mb-12">
              {session.phase === "asking" && session.currentIndex > 0 && session.answers[session.currentIndex - 1]?.acknowledgment && (
                <div className="text-muted text-base md:text-lg mb-6 italic animate-fade-in">
                  "{session.answers[session.currentIndex - 1].acknowledgment}"
                </div>
              )}
              
              <div className="mb-6 md:mb-8">
                <h2 className="leading-relaxed animate-fade-in">
                  {currentQuestion}
                </h2>
              </div>

              {session.phase === "followup" && (
                <div className="mb-6 md:mb-8 p-4 bg-accent/10 border-l-4 border-accent animate-fade-in" role="alert">
                  <div className="text-accent text-xs font-bold mb-2 uppercase tracking-wide">
                    Follow-up Question
                  </div>
                  {session.answers.length > 0 && session.answers[session.answers.length - 1].missing && (
                    <div className="text-foreground/80 text-sm">
                      <span className="font-medium">Your answer needs more detail:</span>{" "}
                      {session.answers[session.answers.length - 1].missing}
                    </div>
                  )}
                </div>
              )}

              <QuestionCard question={currentQuestion} />
            </div>
          )}

          {/* Transcript Display */}
          {currentTranscript && (
            <div className="mb-6 md:mb-8">
              {!showTranscript ? (
                <button
                  onClick={() => setShowTranscript(true)}
                  className="text-muted hover:text-foreground transition-colors duration-base text-sm font-medium min-h-touch"
                  aria-expanded="false"
                  aria-controls="transcript-content"
                >
                  View transcript →
                </button>
              ) : (
                <div id="transcript-content" className="border-t border-border pt-6 md:pt-8 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-semibold text-base md:text-lg">Your Answer</h3>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className="text-muted hover:text-foreground text-sm transition-colors duration-base min-h-touch"
                      aria-expanded="true"
                      aria-controls="transcript-content"
                    >
                      Hide
                    </button>
                  </div>
                  <TranscriptDisplay
                    transcript={currentTranscript}
                    isProcessing={isTranscribing}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Messages - Helpful and actionable */}
          {networkError && (
            <div className="mb-6 md:mb-8 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <p className="text-foreground">{networkError}</p>
                <button
                  onClick={retryConnection}
                  className="text-accent hover:text-accent-hover font-medium underline flex-shrink-0 transition-colors duration-base min-h-touch"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 md:mb-8 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
              <p className="text-foreground">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar - Sticky on mobile */}
      <div className="bg-surface border-t border-border px-6 md:px-8 py-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isTranscribing || !!networkError}
            isProcessing={isTranscribing}
          />
        </div>
      </div>
    </main>
  );
}
