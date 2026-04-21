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
          throw new Error(`Failed to fetch debrief: ${response.status}`);
        }

        const data = await response.json();
        setDebriefData(data);
      } catch (err) {
        console.error("Failed to fetch debrief:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load debrief"
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
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs work";
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-accent"
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
          <p className="text-lg text-foreground font-medium">
            Generating your debrief...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-foreground/60 mb-6">{error}</p>
          <button
            onClick={handleStartNewInterview}
            className="w-full py-3 px-6 font-semibold text-white bg-accent hover:bg-accent-dark transition-colors duration-200"
          >
            Start New Interview
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
      <header className="px-8 py-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">PrepMate</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Title Section */}
        <div className="mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Interview complete
          </h2>
          <p className="text-foreground/60 text-lg max-w-3xl">
            {session.jobDescription.substring(0, 150)}...
          </p>
        </div>

        {/* Overall Score - Asymmetric Layout */}
        <div className="grid lg:grid-cols-12 gap-12 mb-24 pb-16 border-b border-border">
          <div className="lg:col-span-4">
            <div className="text-7xl font-bold text-foreground mb-2">
              {debriefData.overall_score}
              <span className="text-3xl text-foreground/40">/100</span>
            </div>
            <div className="text-foreground/60 text-lg">Overall score</div>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {debriefData.feedback.length}
              </div>
              <div className="text-foreground/60">Questions answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {debriefData.feedback.filter((f) => f.improvements.length > 0).length}
              </div>
              <div className="text-foreground/60">Areas to improve</div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-12">
            Question breakdown
          </h3>

          <div className="space-y-16">
            {debriefData.feedback.map((item, index) => (
              <div key={index} className="border-t border-border pt-12">
                {/* Question Header */}
                <div className="grid lg:grid-cols-12 gap-8 mb-8">
                  <div className="lg:col-span-2">
                    <div className="text-4xl font-bold text-accent mb-2">
                      {item.score.toFixed(0)}
                      <span className="text-xl text-foreground/40">/100</span>
                    </div>
                    <div className="text-foreground/60 text-sm">
                      {getScoreLabel(item.score)}
                    </div>
                  </div>
                  <div className="lg:col-span-10">
                    <h4 className="text-xl font-bold text-foreground mb-4">
                      {item.question}
                    </h4>
                    <p className="text-foreground/60 leading-relaxed">
                      {session.answers[index]?.transcript.substring(0, 200)}...
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="grid lg:grid-cols-12 gap-8">
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
                            <li key={i} className="text-foreground/80 leading-relaxed">
                              • {strength}
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
                            <li key={i} className="text-foreground/80 leading-relaxed">
                              • {improvement}
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

        {/* Action Button */}
        <div className="pt-8 border-t border-border">
          <button
            onClick={handleStartNewInterview}
            className="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold transition-all duration-200"
          >
            Practice again →
          </button>
        </div>
      </div>
    </main>
  );
}
