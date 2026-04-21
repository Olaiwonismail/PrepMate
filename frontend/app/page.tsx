"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "../contexts/InterviewSessionContext";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [showStartForm, setShowStartForm] = useState(false);
  const { session, startSession, error } = useInterviewSession();
  const router = useRouter();

  const handleSubmit = async () => {
    await startSession(jobDescription);
  };

  // Navigate to interview page when questions are loaded
  useEffect(() => {
    if (session.phase === "asking") {
      router.push("/interview");
    }
  }, [session.phase, router]);

  const isButtonDisabled =
    jobDescription.trim() === "" || session.phase === "loading";

  if (!showStartForm) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="px-6 md:px-8 py-6 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">PrepMate</h1>
          </div>
        </header>

        {/* Hero Section - Asymmetric, Mobile-First */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Main Content */}
            <div className="lg:col-span-7 animate-fade-in stagger-1">
              <h2 className="mb-6 md:mb-8">
                Practice until<br />the interview<br />feels <span className="text-accent">easy</span>
              </h2>
              <p className="text-lg md:text-xl text-muted mb-8 md:mb-12">
                Your AI interviewer asks real questions, listens to your answers, and pushes back — just like a real interview.
              </p>
              <button
                onClick={() => setShowStartForm(true)}
                className="px-6 md:px-8 py-3 md:py-4 bg-accent hover:bg-accent-hover text-white text-base md:text-lg font-semibold transition-all duration-base ease-smooth min-h-touch"
                aria-label="Start practicing interviews"
              >
                Start practicing →
              </button>
            </div>

            {/* Right: Stats - Staggered Animation */}
            <div className="lg:col-span-5 space-y-8 md:space-y-12">
              <div className="animate-fade-in stagger-2">
                <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">Complete</div>
                <div className="text-muted">Interview experience</div>
              </div>
              <div className="animate-fade-in stagger-3">
                <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">∞</div>
                <div className="text-muted">Practice sessions</div>
              </div>
              <div className="animate-fade-in stagger-4">
                <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">0</div>
                <div className="text-muted">Scheduling required</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - List Layout */}
        <section className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20 lg:py-24">
            <h3 className="mb-12 md:mb-16">How it works</h3>
            <div className="space-y-12 md:space-y-16">
              {[
                {
                  num: "01",
                  title: "Paste a job description",
                  desc: "We analyze the role and generate 5 tailored questions that match what you'll actually be asked."
                },
                {
                  num: "02",
                  title: "Answer out loud",
                  desc: "Use your voice to answer. The AI listens, transcribes, and generates follow-up questions based on your response."
                },
                {
                  num: "03",
                  title: "Get detailed feedback",
                  desc: "After the session, review your scores, strengths, and specific areas to improve for each question."
                }
              ].map((item, index) => (
                <div key={item.num} className="grid lg:grid-cols-12 gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="lg:col-span-2">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent">{item.num}</div>
                  </div>
                  <div className="lg:col-span-10">
                    <h4 className="mb-3 md:mb-4">{item.title}</h4>
                    <p className="text-base md:text-lg text-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Question Types Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20 lg:py-24">
          <h3 className="mb-4">The 5 questions we ask</h3>
          <p className="text-muted mb-12 md:mb-16">
            Every interview follows a structured format designed to test the skills that matter most
          </p>
          <div className="space-y-6 md:space-y-8">
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
              <div key={item.num} className="grid lg:grid-cols-12 gap-6 md:gap-8 py-6 border-t border-border">
                <div className="lg:col-span-1">
                  <div className="text-2xl md:text-3xl font-bold text-accent">{item.num}</div>
                </div>
                <div className="lg:col-span-11">
                  <h4 className="mb-2">{item.title}</h4>
                  <p className="text-muted">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-16">
            <button
              onClick={() => setShowStartForm(true)}
              className="px-6 md:px-8 py-3 md:py-4 bg-accent hover:bg-accent-hover text-white text-base md:text-lg font-semibold transition-all duration-base ease-smooth min-h-touch"
              aria-label="Ready to start practicing"
            >
              Ready to start →
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 md:px-8 py-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowStartForm(false)}
            className="text-muted hover:text-foreground transition-colors duration-base min-h-touch flex items-center gap-2"
            aria-label="Go back to home"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">PrepMate</h1>
          <div className="w-16 md:w-20"></div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <h2 className="mb-4">Start your practice session</h2>
        <p className="text-muted text-base md:text-lg mb-8 md:mb-12">
          Paste a job description and we'll generate tailored interview questions
        </p>

        {/* Job Description Input */}
        <div className="mb-6 md:mb-8">
          <label htmlFor="job-description" className="block text-muted text-sm mb-3 font-medium">
            Job description
          </label>
          <textarea
            id="job-description"
            className="w-full h-48 md:h-56 bg-surface text-foreground p-4 md:p-6 border border-border focus:border-accent focus:outline-none resize-none placeholder-muted transition-colors duration-base"
            placeholder="e.g. Backend Engineer at Paystack — Python, FastAPI, PostgreSQL..."
            maxLength={10000}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={session.phase === "loading"}
            aria-describedby={error ? "job-description-error" : undefined}
          />
        </div>

        {/* Error Message - Helpful and actionable */}
        {error && (
          <div id="job-description-error" className="mb-6 md:mb-8 p-4 bg-error/10 border-l-4 border-error" role="alert">
            <p className="text-foreground mb-2">{error}</p>
            <button
              onClick={handleSubmit}
              className="text-accent hover:text-accent-hover font-medium underline transition-colors duration-base"
            >
              Try again
            </button>
          </div>
        )}

        {/* Start Button - Clear, active label */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`w-full py-3 md:py-4 font-semibold transition-all duration-base min-h-touch ${
            isButtonDisabled
              ? "bg-surface text-muted cursor-not-allowed"
              : "bg-foreground text-background hover:opacity-90"
          }`}
          aria-label={session.phase === "loading" ? "Generating questions" : "Start interview"}
        >
          {session.phase === "loading" ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5"
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
