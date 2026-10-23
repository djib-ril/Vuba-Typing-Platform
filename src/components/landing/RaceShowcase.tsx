"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flag,
  Users,
  Car,
  AlertTriangle,
  Zap,
  ArrowRight,
  Sparkles,
  Flame,
} from "lucide-react";

export default function RaceShowcase() {
  const [djibrilProgress, setDjibrilProgress] = useState(42);
  const [mugishaProgress, setMugishaProgress] = useState(48);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    // Simulate Djibril overtaking Mugisha dynamically
    const timer = setInterval(() => {
      setDjibrilProgress((prev) => {
        const next = (prev + 12) % 100;
        if (next > 55 && prev <= 55) {
          setAlertText("⚡ Djibril has just passed over Mugisha! (1.2s ahead)");
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 2200);
        }
        return next;
      });

      setMugishaProgress((prev) => (prev + 9) % 100);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="racing" className="py-24 relative bg-zinc-50/50 dark:bg-[#070c10] border-t border-zinc-200/60 dark:border-zinc-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>High-Speed Multiplayer Tracks</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Real-Time Racing with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300">
              Live Overtake Alerts
            </span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Create invite-only lobbies (e.g. <code>VTT-8921</code>) or jump into
            ranked matchmaking. When an opponent cuts in front of you, stay
            unshaken with our non-blocking real-time overtake alerts.
          </p>
        </div>

        {/* Visual Racetrack Simulation Box */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-900 text-white p-6 sm:p-10 border border-zinc-800 shadow-2xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                Lobby: VTT-8921
              </div>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Users className="w-3.5 h-3.5" /> 3 Players Live
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-time WebSocket Sync</span>
            </div>
          </div>

          {/* Non-Blocking Overtake Alert Toast */}
          <div
            className={`transition-all duration-300 my-4 p-3 rounded-2xl bg-gradient-to-r from-orange-600/90 via-amber-500/90 to-yellow-600/90 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-orange-500/30 ${
              showAlert
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none h-0 p-0 m-0 overflow-hidden"
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 animate-bounce" />
              <span>{alertText}</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
              Keep Typing!
            </span>
          </div>

          {/* Race Lanes */}
          <div className="space-y-6 my-8">
            {/* Lane 1: Djibril */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-emerald-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Djibril (Cyber Roadster)
                </span>
                <span>138 WPM</span>
              </div>
              <div className="h-10 bg-black/60 rounded-xl relative overflow-hidden border border-zinc-800 flex items-center px-2">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-900/40 to-emerald-500/30 rounded-xl transition-all duration-700"
                  style={{ width: `${djibrilProgress}%` }}
                />
                {/* Racer Vehicle */}
                <div
                  className="absolute transition-all duration-700 flex items-center gap-1 text-emerald-400 text-xs font-bold"
                  style={{ left: `calc(${djibrilProgress}% - 30px)` }}
                >
                  <span className="text-xl">🏎️</span>
                </div>
              </div>
            </div>

            {/* Lane 2: Mugisha */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-amber-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Mugisha (Apex Phantom)
                </span>
                <span>124 WPM</span>
              </div>
              <div className="h-10 bg-black/60 rounded-xl relative overflow-hidden border border-zinc-800 flex items-center px-2">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-900/40 to-amber-500/30 rounded-xl transition-all duration-700"
                  style={{ width: `${mugishaProgress}%` }}
                />
                {/* Racer Vehicle */}
                <div
                  className="absolute transition-all duration-700 flex items-center gap-1 text-amber-400 text-xs font-bold"
                  style={{ left: `calc(${mugishaProgress}% - 30px)` }}
                >
                  <span className="text-xl">🚀</span>
                </div>
              </div>
            </div>

            {/* Lane 3: Challenger */}
            <div className="relative">
              <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  Challenger_89 (Drift Neon)
                </span>
                <span>105 WPM</span>
              </div>
              <div className="h-10 bg-black/60 rounded-xl relative overflow-hidden border border-zinc-800 flex items-center px-2">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-zinc-800/60 rounded-xl"
                  style={{ width: `35%` }}
                />
                <div
                  className="absolute flex items-center gap-1 text-zinc-400 text-xs font-bold"
                  style={{ left: `calc(35% - 30px)` }}
                >
                  <span className="text-xl">⚡</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-zinc-400">
              Host private races with friends or challenge random typists.
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
            >
              <span>Create Race Lobby</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
