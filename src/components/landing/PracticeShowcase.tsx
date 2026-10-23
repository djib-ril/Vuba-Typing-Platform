"use client";

import React from "react";
import { Sliders } from "lucide-react";
import TypingFloor from "@/src/components/dashboard/TypingFloor";

export default function PracticeShowcase() {
  return (
    <section id="practice" className="py-24 relative overflow-hidden bg-white dark:bg-[#070c0f] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Granular Practice Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Solo Typing Modes &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400">
              Tactile Soundpacks
            </span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Choose your countdown seconds (15s, 30s, 60s, 120s), select tactile mechanical switch sounds, and type on our line-by-line smooth scrolling floor right here.
          </p>
        </div>

        {/* The Typing Floor rendered directly right below the text */}
        <div className="max-w-5xl mx-auto">
          <TypingFloor standalone={true} />
        </div>
      </div>
    </section>
  );
}
