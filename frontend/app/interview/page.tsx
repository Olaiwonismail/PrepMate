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
  const [showQuestion, setShowQuestion] = useState(false);

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

  // Check if interviewer is speaking (asking question or followup)
  const isInterviewerSpeaking = session.phase === "asking" || session.phase === "followup";
  const isCandidateSpeaking = session.phase === "recording" || session.phase === "processing";

  // Loading state
  if (session.phase === "idle" || session.phase === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8 bg-background">
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
            <div className="max-w-2xl text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
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
    <main className="flex min-h-screen flex-col bg-[oklch(0.15_0.005_25)]">
      {/* Top Bar - Video Call Style */}
      <div className="bg-[oklch(0.10_0.005_25)] px-4 md:px-6 py-3 md:py-4 border-b border-[oklch(0.20_0.005_25)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="text-[oklch(0.95_0.005_25)] font-medium text-sm md:text-base">Mock Interview</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[oklch(0.70_0.005_25)] text-xs md:text-sm font-mono" aria-label={`Question ${currentQuestionNumber} of ${totalQuestions}`}>
              {currentQuestionNumber}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Video Grid - Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Interviewer Video */}
            <div className="relative bg-[oklch(0.18_0.005_25)] aspect-video overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Avatar */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 md:w-14 md:h-14 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                
                {/* Name */}
                <div className="text-[oklch(0.95_0.005_25)] font-semibold text-lg md:text-xl mb-1">Alex</div>
                <div className="text-[oklch(0.70_0.005_25)] text-sm">AI Interviewer</div>
                
                {/* Speaking Indicator */}
                {isInterviewerSpeaking && (
                  <div className="mt-4 flex items-center gap-2 animate-fade-in">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-6 md:h-8 bg-accent rounded-full"
                          style={{
                            animation: `pulse 1s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-accent text-sm font-medium">Speaking...</span>
                  </div>
                )}
              </div>
              
              {/* Name Tag */}
              <div className="absolute bottom-3 left-3 bg-[oklch(0.10_0.005_25)]/90 backdrop-blur-sm px-3 py-1.5 text-sm">
                <span className="text-[oklch(0.95_0.005_25)] font-medium">Alex</span>
              </div>
            </div>

            {/* Your Video */}
            <div className="relative bg-[oklch(0.18_0.005_25)] aspect-video overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Avatar */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-[oklch(0.25_0.005_25)] rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 md:w-14 md:h-14 text-[oklch(0.60_0.005_25)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                
                {/* Name */}
                <div className="text-[oklch(0.95_0.005_25)] font-semibold text-lg md:text-xl mb-1">You</div>
                <div className="text-[oklch(0.70_0.005_25)] text-sm">Candidate</div>
                
                {/* Speaking/Recording Indicator */}
                {isCandidateSpeaking && (
                  <div className="mt-4 flex items-center gap-2 animate-fade-in">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-accent text-sm font-medium">
                      {session.phase === "recording" ? "Recording..." : "Processing..."}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Name Tag */}
              <div className="absolute bottom-3 left-3 bg-[oklch(0.10_0.005_25)]/90 backdrop-blur-sm px-3 py-1.5 text-sm">
                <span className="text-[oklch(0.95_0.005_25)] font-medium">You</span>
              </div>
            </div>
          </div>

          {/* Question Display - Chat Style */}
          {currentQuestion && (
            <div className="bg-[oklch(0.18_0.005_25)] p-4 md:p-6 mb-4 animate-fade-in">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-semibold text-xs md:text-sm">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Question - Hidden by default with toggle */}
                  {!showQuestion ? (
                    <button
                      onClick={() => setShowQuestion(true)}
                      className="text-[oklch(0.70_0.005_25)] hover:text-[oklch(0.95_0.005_25)] transition-colors duration-base text-sm font-medium min-h-touch mb-4"
                      aria-expanded="false"
                      aria-controls="question-content"
                    >
                      View question →
                    </button>
                  ) : (
                    <div id="question-content" className="animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          {/* Acknowledgment */}
                          {session.phase === "asking" && session.currentIndex > 0 && session.answers[session.currentIndex - 1]?.acknowledgment && (
                            <div className="text-[oklch(0.70_0.005_25)] text-sm md:text-base mb-3 italic">
                              "{session.answers[session.currentIndex - 1].acknowledgment}"
                            </div>
                          )}
                          
                          <div className="text-[oklch(0.95_0.005_25)] text-base md:text-lg leading-relaxed">
                            {currentQuestion}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowQuestion(false)}
                          className="text-[oklch(0.70_0.005_25)] hover:text-[oklch(0.95_0.005_25)] text-sm transition-colors duration-base min-h-touch ml-4 flex-shrink-0"
                          aria-expanded="true"
                          aria-controls="question-content"
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Badge */}
                  {session.phase === "followup" && (
                    <div className="mb-4 p-3 bg-accent/10 border-l-4 border-accent">
                      <div className="text-accent text-xs font-bold mb-1 uppercase tracking-wide">
                        Follow-up Question
                      </div>
                      {session.answers.length > 0 && session.answers[session.answers.length - 1].missing && (
                        <div className="text-[oklch(0.85_0.005_25)] text-sm">
                          <span className="font-medium">Your answer needs more detail:</span>{" "}
                          {session.answers[session.answers.length - 1].missing}
                        </div>
                      )}
                    </div>
                  )}

                  <QuestionCard 
                    question={currentQuestion}
                    acknowledgment={
                      session.phase === "asking" && 
                      session.currentIndex > 0 && 
                      session.answers[session.currentIndex - 1]?.acknowledgment
                        ? session.answers[session.currentIndex - 1].acknowledgment
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {currentTranscript && (
            <div className="mb-4">
              {!showTranscript ? (
                <button
                  onClick={() => setShowTranscript(true)}
                  className="text-[oklch(0.70_0.005_25)] hover:text-[oklch(0.95_0.005_25)] transition-colors duration-base text-sm font-medium min-h-touch"
                  aria-expanded="false"
                  aria-controls="transcript-content"
                >
                  View transcript →
                </button>
              ) : (
                <div id="transcript-content" className="bg-[oklch(0.18_0.005_25)] p-4 md:p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[oklch(0.95_0.005_25)] font-semibold text-sm md:text-base">Your Answer</h3>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className="text-[oklch(0.70_0.005_25)] hover:text-[oklch(0.95_0.005_25)] text-sm transition-colors duration-base min-h-touch"
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

          {/* Error Messages */}
          {networkError && (
            <div className="mb-4 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <p className="text-[oklch(0.95_0.005_25)]">{networkError}</p>
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
            <div className="mb-4 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
              <p className="text-[oklch(0.95_0.005_25)]">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar - Video Call Controls */}
      <div className="bg-[oklch(0.10_0.005_25)] px-4 md:px-6 py-4 md:py-6 border-t border-[oklch(0.20_0.005_25)]">
        <div className="max-w-7xl mx-auto">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isTranscribing || !!networkError}
            isProcessing={isTranscribing}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
