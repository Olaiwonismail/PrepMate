"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "../contexts/InterviewSessionContext";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState<"behavioral" | "technical" | "mixed">("mixed");
  const [showStartForm, setShowStartForm] = useState(false);
  const { session, startSession, error } = useInterviewSession();
  const router = useRouter();

  const handleSubmit = async () => {
    await startSession(jobDescription);
  };

  // Navigate to interview page when questions are loaded
  useEffect(() => {
    console.log("Home page - session.phase:", session.phase);
    if (session.phase === "asking") {
      console.log("Navigating to /interview");
      router.push("/interview");
    }
  }, [session.phase, router]);

  const isButtonDisabled =
    jobDescription.trim() === "" || session.phase === "loading";

  if (!showStartForm) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">PrepMate</h1>
          </div>
        </header>

        {/* Hero Section - Asymmetric Layout */}
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Left: Main Content */}
            <div className="lg:col-span-7">
              <h2 className="text-6xl font-bold text-foreground mb-6 leading-tight">
                Practice until<br />the interview<br />feels <span className="text-accent">easy</span>
              </h2>
              <p className="text-xl text-foreground/60 mb-12 max-w-xl">
                Your AI interviewer asks real questions, listens to your answers, and pushes back — just like a real interview.
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="px-8 py-4 bg-accent hover:bg-accent-dark text-white text-lg font-semibold transition-all duration-200 ease-smooth"
              >
                Start practicing →
              </button>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <div className="text-5xl font-bold text-foreground mb-2">5</div>
                <div className="text-foreground/60">Questions per session</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-foreground mb-2">∞</div>
                <div className="text-foreground/60">Practice sessions</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-foreground mb-2">0</div>
                <div className="text-foreground/60">Scheduling required</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - List Layout */}
        <div className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-8 py-24">
            <h3 className="text-3xl font-bold text-foreground mb-16">
              How it works
            </h3>
            <div className="space-y-16">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-6xl font-bold text-accent">01</div>
                </div>
                <div className="lg:col-span-10">
                  <h4 className="text-2xl font-bold text-foreground mb-4">
                    Paste a job description
                  </h4>
                  <p className="text-lg text-foreground/60 max-w-2xl">
                    We analyze the role and generate 5 tailored questions that match what you'll actually be asked.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-6xl font-bold text-accent">02</div>
                </div>
                <div className="lg:col-span-10">
                  <h4 className="text-2xl font-bold text-foreground mb-4">
                    Answer out loud
                  </h4>
                  <p className="text-lg text-foreground/60 max-w-2xl">
                    Use your voice to answer. The AI listens, transcribes, and generates follow-up questions based on your response.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-6xl font-bold text-accent">03</div>
                </div>
                <div className="lg:col-span-10">
                  <h4 className="text-2xl font-bold text-foreground mb-4">
                    Get detailed feedback
                  </h4>
                  <p className="text-lg text-foreground/60 max-w-2xl">
                    After the session, review your scores, strengths, and specific areas to improve for each question.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Types Section */}
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            The 5 questions we ask
          </h3>
          <p className="text-foreground/60 mb-16 max-w-2xl">
            Every interview follows a structured format designed to test the skills that matter most
          </p>
          <div className="space-y-8">
            {[
              {
                num: "1",
                title: "The Icebreaker",
                desc: "Tell us about a relevant project you've worked on. We want to understand your hands-on experience."
              },
              {
                num: "2",
                title: "The Core Concept",
                desc: "Deep dive into technical knowledge specific to the job description. Can you explain the fundamentals?"
              },
              {
                num: "3",
                title: "The System Design",
                desc: "Architect a feature from the job description. How would you design it from scratch?"
              },
              {
                num: "4",
                title: "The Behavioral",
                desc: "How do you handle disagreements or failed deadlines? We test your soft skills and team dynamics."
              },
              {
                num: "5",
                title: "The Production Fire",
                desc: "A live incident just happened. How do you respond under pressure? We simulate real crisis scenarios."
              }
            ].map((item) => (
              <div key={item.num} className="grid lg:grid-cols-12 gap-8 py-6 border-t border-border">
                <div className="lg:col-span-1">
                  <div className="text-3xl font-bold text-accent">{item.num}</div>
                </div>
                <div className="lg:col-span-11">
                  <h4 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="text-foreground/60 max-w-3xl">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <button
              onClick={() => setShowStartForm(true)}
              className="px-8 py-4 bg-accent hover:bg-accent-dark text-white text-lg font-semibold transition-all duration-200 ease-smooth"
            >
              Ready to start →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowStartForm(false)}
            className="text-foreground/60 hover:text-foreground transition-colors duration-200"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">PrepMate</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Start your practice session
        </h2>
        <p className="text-foreground/60 text-lg mb-12">
          Paste a job description and we'll generate tailored interview questions
        </p>

        {/* Job Description Input */}
        <div className="mb-8">
          <label className="block text-foreground/60 text-sm mb-3 font-medium">
            Job description
          </label>
          <textarea
            className="w-full h-48 bg-surface text-foreground p-6 border border-border focus:border-accent focus:outline-none resize-none placeholder-foreground/40 transition-colors duration-200"
            placeholder="e.g. Backend Engineer at Paystack — Python, FastAPI, PostgreSQL..."
            maxLength={10000}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={session.phase === "loading"}
          />
        </div>

        {/* Interview Type Selection */}
        <div className="mb-8">
          <label className="block text-foreground/60 text-sm mb-3 font-medium">
            Interview type
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setInterviewType("behavioral")}
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                interviewType === "behavioral"
                  ? "bg-accent text-white"
                  : "bg-surface text-foreground hover:bg-border"
              }`}
            >
              Behavioral
            </button>
            <button
              type="button"
              onClick={() => setInterviewType("technical")}
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                interviewType === "technical"
                  ? "bg-accent text-white"
                  : "bg-surface text-foreground hover:bg-border"
              }`}
            >
              Technical
            </button>
            <button
              type="button"
              onClick={() => setInterviewType("mixed")}
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                interviewType === "mixed"
                  ? "bg-accent text-white"
                  : "bg-surface text-foreground hover:bg-border"
              }`}
            >
              Mixed
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-accent/10 border-l-4 border-accent">
            <p className="text-foreground mb-2">{error}</p>
            <button
              onClick={handleSubmit}
              className="text-accent hover:text-accent-dark font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`w-full py-4 font-semibold transition-all duration-200 ${
            isButtonDisabled
              ? "bg-surface text-foreground/40 cursor-not-allowed"
              : "bg-foreground text-background hover:opacity-90"
          }`}
        >
          {session.phase === "loading" ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5"
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
              Generating questions...
            </span>
          ) : (
            "Start interview"
          )}
        </button>
      </div>
    </main>
  );
}
