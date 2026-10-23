"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Rocket,
  Lightbulb,
  Award,
  Zap,
  Globe2,
} from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2 -translate-x-1/2 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Origin & Visionary Story</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Built for the Demands of the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400">
              Modern World
            </span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            How a commitment to digital literacy and keystroke fluency inspired
            VubaTrustTyping.
          </p>
        </div>

        {/* Two-Column Layout: Left (Uneven Curved Encircled Image) & Right (Story Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image encircled in uneven curved-lines circle */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Outer Decorative Animated Gradient Rings */}
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
              {/* Outer organic rotating ring 1 (Orange & Muted Yellow) */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50 dark:border-amber-400/40 animate-spin"
                style={{ animationDuration: "28s" }}
              />

              {/* Middle organic uneven ring (Dark & Light Green) */}
              <div
                className="absolute inset-2 uneven-curved-frame border-2 border-emerald-500/60 dark:border-emerald-400/50 bg-gradient-to-tr from-emerald-900/20 via-transparent to-amber-500/20 shadow-2xl shadow-emerald-500/10"
              />

              {/* Uneven Curved Frame Image Container with Real Founder Photograph */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 uneven-curved-frame overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-950 p-2 shadow-2xl border-4 border-emerald-500/50 dark:border-emerald-400/50 group">
                <div className="w-full h-full uneven-curved-frame overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                  <Image
                    src="/founder.jpg"
                    alt="Djibril Mugisha - Founder and Creator of VubaTrustTyping"
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
                    priority
                  />
                  {/* Subtle dark gradient overlay at the base for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-center">
                    <span className="text-white font-black text-base drop-shadow-md">
                      Djibril Mugisha
                    </span>
                    <span className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase drop-shadow">
                      Founder & Creator
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: 160+ WPM */}
              <div className="absolute -top-2 -left-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-emerald-500/40 shadow-lg flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 animate-bounce">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>160+ Peak WPM</span>
              </div>

              {/* Floating Badge 2: Visionary Creator */}
              <div className="absolute -bottom-3 -right-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-amber-500/40 shadow-lg flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Architect</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                Honoring Founder Djibril Mugisha
              </span>
            </div>
          </div>

          {/* Right Column: Origin Story & Demands of Digital Literacy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-400/20 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Where The Idea Came From</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-snug">
              "In a digital-first civilization, your typing speed is the bandwidth of your thought."
            </h3>

            <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              <p>
                The concept of <strong className="text-zinc-900 dark:text-zinc-100 font-bold">VubaTrustTyping</strong> was conceived and brought to reality by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Djibril Mugisha</strong>. Observing how swiftly our modern society is shaped by digital interfaces, Djibril recognized a critical bottleneck: while technological complexity is skyrocketing, human interaction with computers often remains sluggish due to untrained keyboard habits.
              </p>
              <p>
                Modern digital literacy demands more than simply knowing how to open an app. It requires fluent, tactile, subconscious keystroke execution. When students in lectures, software engineers building scalable platforms, and professionals drafting high-stakes reports can type effortlessly at 100+ words per minute, their creative and intellectual friction disappears.
              </p>
              <p>
                Djibril believed firmly that <span className="text-zinc-900 dark:text-white font-semibold">people should start early</span>—cultivating muscle memory, competitive drive, and rhythmic accuracy before inefficient typing habits take root.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <Rocket className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Start Early
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Youth & student practice tracks to instill lifelong muscle memory.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <Globe2 className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Global Competition
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Real-time multiplayer race lobbies with sub-second live syncing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <Award className="w-5 h-5 text-orange-500 mb-2" />
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Top 3 Recognition
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Automatic recognition and personal advice showcase for leaders.
                </p>
              </div>
            </div>

            {/* Founder Quote Card */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 italic">
              "We built VubaTrustTyping so every person, regardless of background, has the competitive tools to become faster, more confident, and digitally articulate."
              <div className="mt-2 text-right not-italic font-bold text-emerald-600 dark:text-emerald-400">
                — Djibril Mugisha, Founder
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
