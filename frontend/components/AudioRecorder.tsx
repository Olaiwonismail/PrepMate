"use client";

import { useState, useRef, useEffect } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

type RecorderState = "idle" | "recording" | "processing";

export default function AudioRecorder({
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Reset state when processing is complete
  useEffect(() => {
    if (!isProcessing && state === "processing") {
      setState("idle");
    }
  }, [isProcessing, state]);

  const startRecording = async () => {
    setError(null);
    setPermissionDenied(false);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setState("processing");
        onRecordingComplete(blob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording failed. Please try again.");
        setState("idle");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);

      if (
        err instanceof DOMException &&
        err.name === "NotAllowedError"
      ) {
        setPermissionDenied(true);
      } else {
        setError("Microphone access failed. Please check your browser settings.");
      }

      setState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const retryRecording = () => {
    setError(null);
    setPermissionDenied(false);
    setState("idle");
  };

  return (
    <div className="w-full">
      {/* Permission Denied Message - Helpful and actionable */}
      {permissionDenied && (
        <div className="mb-6 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
          <h4 className="text-foreground font-semibold mb-2 text-sm md:text-base">
            Microphone access denied
          </h4>
          <p className="text-foreground/80 text-sm">
            Please allow microphone access in your browser settings, then refresh the page to continue.
          </p>
        </div>
      )}

      {/* Error Message - Helpful and actionable */}
      {error && !permissionDenied && (
        <div className="mb-6 p-4 bg-error/10 border-l-4 border-error animate-fade-in" role="alert">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <p className="text-foreground text-sm md:text-base">{error}</p>
            <button
              onClick={retryRecording}
              className="text-accent hover:text-accent-hover font-medium underline flex-shrink-0 transition-colors duration-base min-h-touch"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Control Button - Clear states and labels */}
      <div className="flex justify-center">
        {state === "idle" && (
          <button
            onClick={startRecording}
            disabled={disabled || permissionDenied}
            className={`px-6 md:px-8 py-3 md:py-4 font-semibold transition-all duration-base ease-smooth flex items-center gap-3 min-h-touch ${
              disabled || permissionDenied
                ? "bg-surface text-muted cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover text-white"
            }`}
            aria-label="Start recording your answer"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            <span className="hidden sm:inline">Start talking</span>
            <span className="sm:hidden">Talk</span>
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={stopRecording}
            className="px-6 md:px-8 py-3 md:py-4 font-semibold bg-foreground hover:opacity-90 text-background transition-all duration-base ease-smooth flex items-center gap-3 min-h-touch"
            aria-label="Stop recording"
          >
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" aria-hidden="true"></div>
            <span className="hidden sm:inline">Stop talking</span>
            <span className="sm:hidden">Stop</span>
          </button>
        )}

        {state === "processing" && (
          <button
            disabled
            className="px-6 md:px-8 py-3 md:py-4 font-semibold bg-surface text-muted cursor-not-allowed flex items-center gap-3 min-h-touch"
            aria-label="Processing your answer"
            aria-live="polite"
          >
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
            Processing...
          </button>
        )}
      </div>
    </div>
  );
}
