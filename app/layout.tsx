import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VubaTrustTyping | Real-Time Multiplayer Typing Platform",
  description:
    "Elevate your typing speed and accuracy with real-time multiplayer races, custom solo practice modes, deep keystroke analytics, and an interactive AI typing coach.",
  keywords: [
    "typing speed",
    "typing race",
    "wpm test",
    "multiplayer typing",
    "monkeytype alternative",
    "VubaTrustTyping",
    "Djibril Mugisha",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
