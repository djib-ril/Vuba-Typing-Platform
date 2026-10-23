"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Zap,
  Flame,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
  School,
  Code2,
  Briefcase,
  Volume2,
  ChevronRight,
} from "lucide-react";

interface HeroSectionProps {
  onOpenCoach?: () => void;
}

const SCENARIOS = [
  {
    id: 1,
    title: "Classroom Student",
    role: "Academic Speed Mastery",
    wpm: "98 WPM",
    accuracy: "99.2%",
    description: "Taking rapid lecture notes in real time, outpacing spoken lectures.",
    icon: School,
    badgeColor: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.4)",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&auto=format&fit=crop&q=85",
    alt: "Student typing fast in classroom",
    codeSnippet:
      "Biology notes: Mitochondrial ATP synthesis accelerates during cellular respiration...",
  },
  {
    id: 2,
    title: "Software Engineer",
    role: "Tech Floor Code Sprint",
    wpm: "144 WPM",
    accuracy: "99.8%",
    description:
      "Surrounded by multi-monitor workstations, typing algorithms at terminal velocity.",
    icon: Code2,
    badgeColor: "from-amber-500 to-yellow-600",
    glowColor: "rgba(234, 179, 8, 0.4)",
    image:
      "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1920&auto=format&fit=crop&q=85",
    alt: "Software engineer typing code in tech company",
    codeSnippet:
      "const stream = await supabase.channel('race-live').on('presence', syncPlayerPos)...",
  },
  {
    id: 3,
    title: "Executive Office Analyst",
    role: "High-Stakes Report Filing",
    wpm: "118 WPM",
    accuracy: "99.5%",
    description:
      "Drafting quarterly financial assessments and strategic filings with flawless accuracy.",
    icon: Briefcase,
    badgeColor: "from-orange-500 to-amber-600",
    glowColor: "rgba(249, 115, 22, 0.4)",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&auto=format&fit=crop&q=85",
    alt: "Executive office analyst typing report quickly",
    codeSnippet:
      "Executive Brief: Q4 digital literacy initiatives expanded throughput across 24 corporate sectors...",
  },
];

export default function HeroSection({ onOpenCoach }: HeroSectionProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Live mini typing test state on Hero
  const samplePhrase = "Speed is nothing without accuracy in the modern digital age.";
  const [typedInput, setTypedInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [heroWpm, setHeroWpm] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-cycle through the 3 scenarios every 6 seconds
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 6000;
    const stepTime = 100;
    const stepIncrement = (stepTime / intervalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveScenarioIdx((curr) => (curr + 1) % SCENARIOS.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle typing inside interactive mini tester
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setTypedInput(val);

    if (val === samplePhrase) {
      setIsCompleted(true);
      if (startTime) {
        const timeElapsedMinutes = (Date.now() - startTime) / 60000;
        const words = samplePhrase.length / 5;
        const calculatedWpm = Math.round(words / (timeElapsedMinutes || 0.01));
        setHeroWpm(calculatedWpm);
      }
    }
  };

  const handleResetTest = () => {
    setTypedInput("");
    setStartTime(null);
    setHeroWpm(null);
    setIsCompleted(false);
  };

  const currentScenario = SCENARIOS[activeScenarioIdx];

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Scenario Carousel Control Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 shadow-md max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Live Scenario ({activeScenarioIdx + 1}/3):
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            {SCENARIOS.map((sc, idx) => {
              const Icon = sc.icon;
              const isActive = idx === activeScenarioIdx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioIdx(idx);
                    setProgress(0);
                  }}
                  className={`flex-1 relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 dark:bg-emerald-500/25 dark:text-emerald-300 dark:border dark:border-emerald-500/40"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{sc.title}</span>
                  {isActive && isPlaying && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-amber-400 dark:bg-emerald-500 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause scenario loop" : "Play scenario loop"}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>Next-Gen Competitive Typing & Analytics Engine</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
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
            <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
              Equip yourself for modern digital literacy. Whether you are a student taking lectures, a developer writing code, or a professional drafting reports, master the keyboard with custom solo practice, multiplayer car tracks, and our interactive AI Coach.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#racing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all text-sm sm:text-base"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Multiplayer Race</span>
              </a>

              <button
                type="button"
                onClick={onOpenCoach}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium text-amber-800 dark:text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 transition-all text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Typing Coach</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span>OAuth Google & GitHub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span>Sub-15ms Live WebSockets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Mechanical Soundpacks</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Active Scenario Card & Mini Interactive Keystroke Tester */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Scenario Card Highlight */}
            <div className="relative p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-700/80 shadow-xl overflow-hidden group">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"
                style={{ backgroundColor: currentScenario.glowColor }}
              />

              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${currentScenario.badgeColor}`}
                  >
                    {React.createElement(currentScenario.icon, {
                      className: "w-5 h-5",
                    })}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentScenario.title}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {currentScenario.role}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {currentScenario.wpm}
                  </span>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Acc: {currentScenario.accuracy}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {currentScenario.description}
              </p>

              {/* Live Mock Text stream */}
              <div className="mt-3 p-3 rounded-xl bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-300 select-none">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">❯ </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  {currentScenario.codeSnippet}
                </span>
                <span className="inline-block w-2 h-3.5 ml-1 bg-amber-400 animate-pulse align-middle" />
              </div>
            </div>

            {/* Interactive Quick Typing Tester Bar */}
            <div className="p-5 rounded-2xl bg-zinc-900 text-white dark:bg-[#0e161c] border border-emerald-900/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Test Your Speed in 5 Seconds
                </span>
                {heroWpm && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {heroWpm} WPM!
                  </span>
                )}
              </div>

              {/* Sample Target Text */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 font-mono text-xs leading-relaxed">
                {samplePhrase.split("").map((char, i) => {
                  let colorClass = "text-zinc-500";
                  if (i < typedInput.length) {
                    colorClass =
                      typedInput[i] === char
                        ? "text-emerald-400 font-semibold"
                        : "text-red-400 bg-red-950/40";
                  } else if (i === typedInput.length) {
                    colorClass = "text-yellow-300 underline decoration-2";
                  }
                  return (
                    <span key={i} className={colorClass}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Input Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typedInput}
                  onChange={handleInputChange}
                  disabled={isCompleted}
                  placeholder={
                    isCompleted
                      ? "Test finished! Click Reset to try again."
                      : "Type the sentence above..."
                  }
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleResetTest}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {isCompleted && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span>
                    Great job! Final speed: <strong>{heroWpm} WPM</strong>
                  </span>
                  <Link
                    href="/login"
                    className="underline font-bold hover:text-white"
                  >
                    Save your score →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
