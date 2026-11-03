"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface HeroSectionProps {
  onOpenCoach?: () => void;
}

const SCENARIOS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&auto=format&fit=crop&q=85",
    alt: "Classroom student typing fast",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1920&auto=format&fit=crop&q=85",
    alt: "Software engineer typing code in tech company",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&auto=format&fit=crop&q=85",
    alt: "Executive office analyst typing report quickly",
  },
];

export default function HeroSection({ onOpenCoach }: HeroSectionProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);

  // Auto-cycle through the 3 background photos every 6 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScenarioIdx((curr) => (curr + 1) % SCENARIOS.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen pt-28 pb-20 flex flex-col justify-center overflow-hidden bg-white dark:bg-[#070c0f] transition-colors duration-300">
      {/* Three Alternating High-Resolution Background Images with Tremendous Animated Transitions */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {SCENARIOS.map((sc, idx) => {
          const isActive = idx === activeScenarioIdx;
          return (
            <div
              key={sc.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                isActive
                  ? "opacity-100 scale-105 filter blur-0"
                  : "opacity-0 scale-100 filter blur-sm"
              }`}
            >
              <img
                src={sc.image}
                alt={sc.alt}
                className="w-full h-full object-cover object-center"
              />
            </div>
          );
        })}

        {/* Crisp Overlay: On light theme, clean white semi-transparent wash; on dark theme, deep cyber wash */}
        <div className="absolute inset-0 bg-white/80 dark:bg-[#070c0f]/85 backdrop-blur-[2px] transition-colors duration-500" />

        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center flex flex-col items-center">
        {/* Hero Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1] max-w-4xl">
          Type at the Speed of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300">
            Thought.
          </span>{" "}
          Race Globally in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500">
            Real-Time.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-700 dark:text-zinc-300 max-w-3xl leading-relaxed">
          Equip yourself for modern digital literacy. Whether you are a student taking lectures, a developer writing code, or a professional drafting reports, master the keyboard with custom solo practice, multiplayer car tracks, and our interactive AI Coach.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base cursor-pointer"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#racing"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-zinc-800 dark:text-zinc-100 bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all text-sm sm:text-base backdrop-blur-sm"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Multiplayer Race</span>
          </a>

          <button
            type="button"
            onClick={onOpenCoach}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-medium text-amber-800 dark:text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 transition-all text-sm cursor-pointer backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Typing Coach</span>
          </button>
        </div>
      </div>
    </section>
  );
}
