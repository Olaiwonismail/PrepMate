import { useState } from "react";

// TypeScript interfaces matching the design spec
export interface AnswerRecord {
  question: string;
  transcript: string;
  followup?: string;
  followupTranscript?: string;
  missing?: string; // What the answer was missing (if followup was needed)
  acknowledgment?: string; // Brief acknowledgment before moving to next question
}

export interface InterviewSession {
  jobDescription: string;
  questions: string[];
  currentIndex: number; // 0-4 for main questions
  answers: AnswerRecord[];
  phase:
    | "idle"
    | "loading"
    | "asking"
    | "recording"
    | "processing"
    | "followup"
    | "debrief";
}

export interface UseInterviewSessionReturn {
  session: InterviewSession;
  startSession: (jd: string) => Promise<void>;
  submitAnswer: (blob: Blob) => Promise<void>;
  submitFollowupAnswer: (blob: Blob) => Promise<void>;
  reset: () => void;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useInterviewSession(): UseInterviewSessionReturn {
  const [session, setSession] = useState<InterviewSession>({
    jobDescription: "",
    questions: [],
    currentIndex: 0,
    answers: [],
    phase: "idle",
  });

  const [error, setError] = useState<string | null>(null);

  const startSession = async (jd: string) => {
    setError(null);
    setSession((prev) => ({ ...prev, phase: "loading" }));

    try {
      const response = await fetch(`${API_URL}/api/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_description: jd }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to start session: ${response.status}`
        );
      }

      const data = await response.json();

      setSession({
        jobDescription: jd,
        questions: data.questions,
        currentIndex: 0,
        answers: [],
        phase: "asking",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      setSession((prev) => ({ ...prev, phase: "idle" }));
    }
  };

  const submitAnswer = async (blob: Blob) => {
    console.log("=== submitAnswer START ===");
    setError(null);
    
    // Capture current state before async operations
    let currentQuestion: string;
    setSession((prev) => {
      currentQuestion = prev.questions[prev.currentIndex];
      console.log("Setting phase to processing, currentQuestion:", currentQuestion);
      return { ...prev, phase: "processing" };
    });

    try {
      // Step 1: Transcribe the audio
      console.log("Step 1: Transcribing audio...");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const sttResponse = await fetch(`${API_URL}/api/stt`, {
        method: "POST",
        body: formData,
      });

      console.log("STT Response status:", sttResponse.status);

      if (!sttResponse.ok) {
        const errorData = await sttResponse.json().catch(() => ({}));
        console.error("STT Error:", errorData);
        throw new Error(
          errorData.error || `Failed to transcribe audio: ${sttResponse.status}`
        );
      }

      const sttData = await sttResponse.json();
      const transcript = sttData.transcript;
      console.log("Transcript received:", transcript);

      // Step 2: Get follow-up question
      console.log("Step 2: Getting follow-up question...");
      const followupResponse = await fetch(`${API_URL}/api/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion!,
          answer: transcript,
        }),
      });

      console.log("Followup Response status:", followupResponse.status);

      if (!followupResponse.ok) {
        const errorData = await followupResponse.json().catch(() => ({}));
        console.error("Followup Error:", errorData);
        throw new Error(
          errorData.error ||
            `Failed to generate follow-up: ${followupResponse.status}`
        );
      }

      const followupData = await followupResponse.json();
      console.log("Follow-up received:", followupData);

      // Check if follow-up is needed
      if (followupData.needs_followup && followupData.followup) {
        // Update session with answer and follow-up
        console.log("Follow-up needed - updating session to followup phase");
        setSession((prev) => ({
          ...prev,
          answers: [
            ...prev.answers,
            {
              question: currentQuestion!,
              transcript,
              followup: followupData.followup,
              missing: followupData.missing,
            },
          ],
          phase: "followup",
        }));
      } else {
        // No follow-up needed - move to next question with acknowledgment
        console.log("Answer is sufficient - moving to next question");
        setSession((prev) => {
          const nextIndex = prev.currentIndex + 1;
          const isComplete = nextIndex >= prev.questions.length;

          return {
            ...prev,
            answers: [
              ...prev.answers,
              {
                question: currentQuestion!,
                transcript,
                acknowledgment: followupData.acknowledgment,
              },
            ],
            currentIndex: nextIndex,
            phase: isComplete ? "debrief" : "asking",
          };
        });
      }
      console.log("=== submitAnswer SUCCESS ===");
    } catch (err) {
      console.error("=== submitAnswer ERROR ===", err);
      setError(
        err instanceof Error ? err.message : "Failed to process answer"
      );
      setSession((prev) => ({ ...prev, phase: "asking" }));
      // Re-throw the error so the caller knows it failed
      throw err;
    }
  };

  const submitFollowupAnswer = async (blob: Blob) => {
    console.log("=== submitFollowupAnswer START ===");
    setError(null);
    setSession((prev) => ({ ...prev, phase: "processing" }));

    try {
      // Transcribe the follow-up answer
      console.log("Transcribing follow-up answer...");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const sttResponse = await fetch(`${API_URL}/api/stt`, {
        method: "POST",
        body: formData,
      });

      console.log("STT Response status:", sttResponse.status);

      if (!sttResponse.ok) {
        const errorData = await sttResponse.json().catch(() => ({}));
        console.error("STT Error:", errorData);
        throw new Error(
          errorData.error || `Failed to transcribe audio: ${sttResponse.status}`
        );
      }

      const sttData = await sttResponse.json();
      const followupTranscript = sttData.transcript;
      console.log("Follow-up transcript received:", followupTranscript);

      // Generate acknowledgment for the follow-up answer
      console.log("Generating acknowledgment for follow-up answer...");
      const ackResponse = await fetch(`${API_URL}/api/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "follow-up",
          answer: followupTranscript,
        }),
      });

      let acknowledgment = null;
      if (ackResponse.ok) {
        const ackData = await ackResponse.json();
        acknowledgment = ackData.acknowledgment;
        console.log("Acknowledgment received:", acknowledgment);
      }

      // Update the last answer with the follow-up transcript and acknowledgment
      setSession((prev) => {
        const updatedAnswers = [...prev.answers];
        updatedAnswers[updatedAnswers.length - 1] = {
          ...updatedAnswers[updatedAnswers.length - 1],
          followupTranscript,
          acknowledgment,
        };

        const nextIndex = prev.currentIndex + 1;
        const isComplete = nextIndex >= prev.questions.length;

        console.log("Next index:", nextIndex, "Is complete:", isComplete);

        return {
          ...prev,
          answers: updatedAnswers,
          currentIndex: nextIndex,
          phase: isComplete ? "debrief" : "asking",
        };
      });
      console.log("=== submitFollowupAnswer SUCCESS ===");
    } catch (err) {
      console.error("=== submitFollowupAnswer ERROR ===", err);
      setError(
        err instanceof Error ? err.message : "Failed to process follow-up answer"
      );
      setSession((prev) => ({ ...prev, phase: "followup" }));
      // Re-throw the error so the caller knows it failed
      throw err;
    }
  };

  const reset = () => {
    setSession({
      jobDescription: "",
      questions: [],
      currentIndex: 0,
      answers: [],
      phase: "idle",
    });
    setError(null);
  };

  return {
    session,
    startSession,
    submitAnswer,
    submitFollowupAnswer,
    reset,
    error,
  };
}
