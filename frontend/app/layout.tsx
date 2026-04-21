import type { Metadata } from "next";
import "./globals.css";
import { InterviewSessionProvider } from "../contexts/InterviewSessionContext";

export const metadata: Metadata = {
  title: "PrepMate — AI Mock Interviewer",
  description:
    "Voice-driven mock interview app powered by Google Gemini and ElevenLabs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <InterviewSessionProvider>{children}</InterviewSessionProvider>
      </body>
    </html>
  );
}
