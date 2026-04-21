"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "../../contexts/InterviewSessionContext";

interface FeedbackItem {
  question: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

interface DebriefData {
  overall_score: number;
  summary: string;
  feedback: FeedbackItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DebriefPage() {
  const router = useRouter();
  const { session, reset } = useInterviewSession();
  const [debriefData, setDebriefData] = useState<DebriefData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebrief = async () => {
      // Redirect to home if no session data
      if (session.phase === "idle" || session.answers.length === 0) {
        router.push("/");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/debrief`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_description: session.jobDescription,
            qa_pairs: session.answers.map((answer) => ({
              question: answer.question,
              answer: answer.transcript,
              followup: answer.followup,
              followup_answer: answer.followupTranscript,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate feedback. Please try again.`);
        }

        const data = await response.json();
        setDebriefData(data);
      } catch (err) {
        console.error("Failed to fetch debrief:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load feedback. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebrief();
  }, [session, router]);

  const handleStartNewInterview = () => {
    reset();
    router.push("/");
  };

  const getScoreLabel = (score: number) => {
    // scores are 0–10 from the backend
    if (score >= 8) return "Strong";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs work";
  };

  // Loading state - Skeleton pattern
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-accent"
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
          <p className="text-lg text-foreground font-medium">
            Analyzing your answers...
          </p>
        </div>
      </main>
    );
  }

  // Error state - Helpful message
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
        <div className="max-w-md w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted mb-6">{error}</p>
          <button
            onClick={handleStartNewInterview}
            className="w-full py-3 px-6 font-semibold text-white bg-accent hover:bg-accent-hover transition-colors duration-base min-h-touch"
            aria-label="Start a new interview"
          >
            Start new interview
          </button>
        </div>
      </main>
    );
  }

  if (!debriefData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 md:px-8 py-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">PrepMate</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Title Section */}
        <div className="mb-12 md:mb-16 animate-fade-in stagger-1">
          <h2 className="mb-4 md:mb-6">Interview complete</h2>
          <p className="text-muted text-base md:text-lg max-w-3xl">
            {session.jobDescription.substring(0, 150)}...
          </p>
        </div>

        {/* Overall Score - Asymmetric Layout */}
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 mb-16 md:mb-24 pb-12 md:pb-16 border-b border-border">
          <div className="lg:col-span-4 animate-fade-in stagger-2">
            <div className="text-6xl md:text-7xl font-bold text-foreground mb-2">
              {debriefData.overall_score}
              <span className="text-2xl md:text-3xl text-muted">/100</span>
            </div>
            <div className="text-muted text-base md:text-lg">Overall score</div>
          </div>
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="animate-fade-in stagger-3">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {debriefData.feedback.length}
              </div>
              <div className="text-muted">Questions answered</div>
            </div>
            <div className="animate-fade-in stagger-4">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {debriefData.feedback.filter((f) => f.improvements.length > 0).length}
              </div>
              <div className="text-muted">Areas to improve</div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="mb-12 md:mb-16">
          <h3 className="mb-8 md:mb-12">Question breakdown</h3>

          <div className="space-y-12 md:space-y-16">
            {debriefData.feedback.map((item, index) => (
              <div key={index} className="border-t border-border pt-8 md:pt-12 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Question Header */}
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div className="lg:col-span-2">
                    <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                      {item.score.toFixed(1)}
                      <span className="text-lg md:text-xl text-muted">/10</span>
                    </div>
                    <div className="text-muted text-sm">
                      {getScoreLabel(item.score)}
                    </div>
                  </div>
                  <div className="lg:col-span-10">
                    <h4 className="mb-3 md:mb-4">{item.question}</h4>
                    <p className="text-muted leading-relaxed">
                      {session.answers[index]?.transcript.substring(0, 200)}...
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
                  <div className="lg:col-span-2"></div>
                  <div className="lg:col-span-10 space-y-6">
                    {/* Strengths */}
                    {item.strengths.length > 0 && (
                      <div>
                        <h5 className="text-foreground font-semibold mb-3 text-sm uppercase tracking-wide">
                          Strengths
                        </h5>
                        <ul className="space-y-2">
                          {item.strengths.map((strength, i) => (
                            <li key={i} className="text-foreground/80 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-accent">
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {item.improvements.length > 0 && (
                      <div>
                        <h5 className="text-foreground font-semibold mb-3 text-sm uppercase tracking-wide">
                          To improve
                        </h5>
                        <ul className="space-y-2">
                          {item.improvements.map((improvement, i) => (
                            <li key={i} className="text-foreground/80 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-accent">
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button - Clear label */}
        <div className="pt-8 border-t border-border">
          <button
            onClick={handleStartNewInterview}
            className="px-6 md:px-8 py-3 md:py-4 bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-base min-h-touch"
            aria-label="Start another practice session"
          >
            Practice again →
          </button>
        </div>
      </div>
    </main>
  );
}
