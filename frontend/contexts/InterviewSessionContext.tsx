"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useInterviewSession as useInterviewSessionHook,
  UseInterviewSessionReturn,
} from "../hooks/useInterviewSession";

const InterviewSessionContext = createContext<UseInterviewSessionReturn | null>(
  null
);

export function InterviewSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const session = useInterviewSessionHook();

  return (
    <InterviewSessionContext.Provider value={session}>
      {children}
    </InterviewSessionContext.Provider>
  );
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const context = useContext(InterviewSessionContext);

  if (!context) {
    throw new Error(
      "useInterviewSession must be used within InterviewSessionProvider"
    );
  }

  return context;
}
