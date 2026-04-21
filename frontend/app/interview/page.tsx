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

    // If we're in followup phase, show the main answer transcript
    if (session.phase === "followup") {
      return lastAnswer.transcript;
    }

    // If we're in asking phase and have moved to next question, show previous followup
    if (session.phase === "asking" && session.currentIndex > 0) {
      const previousAnswer = session.answers[session.currentIndex - 1];
      return previousAnswer?.followupTranscript || null;
    }

    return null;
  };

  const currentTranscript = getCurrentTranscript();

  // Redirect to home if no session
  useEffect(() => {
    console.log("Interview page - session.phase:", session.phase);
    console.log("Interview page - session.questions:", session.questions.length);
    if (session.phase === "idle") {
      console.log("Redirecting to home - no session");
      router.push("/");
    }
  }, [session.phase, router]);

  // Navigate to debrief page when interview is complete
  useEffect(() => {
    if (session.phase === "debrief") {
      // Show closing message first
      setShowClosingMessage(true);
      
      // After 3 seconds, start fade out
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 3000);

      // After fade completes (1 second), navigate to debrief
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
    console.log("handleRecordingComplete called, phase:", session.phase);
    setIsTranscribing(true);
    setNetworkError(null);

    try {
      if (session.phase === "asking") {
        console.log("Calling submitAnswer...");
        await submitAnswer(blob);
        console.log("submitAnswer completed successfully");
      } else if (session.phase === "followup") {
        console.log("Calling submitFollowupAnswer...");
        await submitFollowupAnswer(blob);
        console.log("submitFollowupAnswer completed successfully");
      }
    } catch (err) {
      console.error("Failed to process recording:", err);
      setNetworkError(
        "Connection issue. Please check your network and try again."
      );
    } finally {
      console.log("Finally block - resetting isTranscribing to false");
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

  // Don't render if no session
  if (session.phase === "idle" || session.phase === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <p className="text-lg text-foreground/60">Loading interview...</p>
        </div>
      </main>
    );
  }

  // Redirect to debrief page (handled by useEffect above)
  if (session.phase === "debrief") {
    return (
      <main 
        className={`flex min-h-screen flex-col bg-background transition-opacity duration-1000 ${
          isFadingOut ? "opacity-0" : "opacity-100"
        }`}
      >
        {showClosingMessage && (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                That's all for today
              </h2>
              <p className="text-xl text-foreground/60">
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
      {/* Top Bar */}
      <div className="bg-surface border-b border-border px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-foreground font-medium">Mock Interview</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-foreground/60 text-sm font-mono">
              {currentQuestionNumber}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Question Display */}
          {currentQuestion && (
            <div className="mb-12">
              {session.phase === "asking" && session.currentIndex > 0 && session.answers[session.currentIndex - 1]?.acknowledgment && (
                <div className="text-foreground/60 text-lg mb-6 italic">
                  "{session.answers[session.currentIndex - 1].acknowledgment}"
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground leading-relaxed">
                  {currentQuestion}
                </h2>
              </div>

              {session.phase === "followup" && (
                <div className="mb-8 p-4 bg-accent/10 border-l-4 border-accent">
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
            <div className="mb-8">
              {!showTranscript ? (
                <button
                  onClick={() => setShowTranscript(true)}
                  className="text-foreground/60 hover:text-foreground transition-colors duration-200 text-sm font-medium"
                >
                  View transcript →
                </button>
              ) : (
                <div className="border-t border-border pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-semibold">Your Answer</h3>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className="text-foreground/60 hover:text-foreground text-sm"
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

          {/* Error Messages */}
          {networkError && (
            <div className="mb-8 p-4 bg-accent/10 border-l-4 border-accent">
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground">{networkError}</p>
                <button
                  onClick={retryConnection}
                  className="text-accent hover:text-accent-dark font-medium underline flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-accent/10 border-l-4 border-accent">
              <p className="text-foreground">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-surface border-t border-border px-8 py-6">
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
