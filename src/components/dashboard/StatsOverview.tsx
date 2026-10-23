"use client";

import React from "react";
import {
  Zap,
  Target,
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface StatsOverviewProps {
  userLevel?: "Beginner" | "Intermediate" | "Advanced" | "Pro" | "Grandmaster";
  testsCount: number;
  highestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export default function StatsOverview({
  userLevel = "Beginner",
  testsCount = 0,
  highestWpm = 0,
  avgWpm = 0,
  avgAccuracy = 100,
}: StatsOverviewProps) {
  // Determine dynamic next tier and target
  let currentTierName = "Beginner";
  let nextTierName = "Intermediate";
  let nextTierTarget = 50;
  let prevTierFloor = 0;

  if (highestWpm >= 140) {
    currentTierName = "Grandmaster";
    nextTierName = "Apex Legend (Max)";
    nextTierTarget = 140;
    prevTierFloor = 140;
  } else if (highestWpm >= 110) {
    currentTierName = "Pro";
    nextTierName = "Grandmaster";
    nextTierTarget = 140;
    prevTierFloor = 110;
  } else if (highestWpm >= 80) {
    currentTierName = "Advanced";
    nextTierName = "Pro";
    nextTierTarget = 110;
    prevTierFloor = 80;
  } else if (highestWpm >= 50) {
    currentTierName = "Intermediate";
    nextTierName = "Advanced";
    nextTierTarget = 80;
    prevTierFloor = 50;
  } else {
    currentTierName = "Beginner";
    nextTierName = "Intermediate";
    nextTierTarget = 50;
    prevTierFloor = 0;
  }

  const wpmAway = Math.max(0, nextTierTarget - highestWpm);
  const tierRange = nextTierTarget - prevTierFloor || 1;
  const progressPercent =
    highestWpm >= 140
      ? 100
      : Math.min(
          100,
          Math.max(5, Math.round(((highestWpm - prevTierFloor) / tierRange) * 100))
        );

  const stats = [
    {
      label: "Highest Speed",
      value: `${highestWpm} WPM`,
      sub: testsCount > 0 ? "Personal Best Record" : "Take a test to set record",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/30",
    },
    {
      label: "Average Speed",
      value: `${avgWpm} WPM`,
      sub: testsCount > 0 ? `Across ${testsCount} tests taken` : "No tests recorded yet",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-400/10 dark:bg-amber-400/20",
      border: "border-amber-400/30",
    },
    {
      label: "Overall Accuracy",
      value: testsCount > 0 ? `${avgAccuracy}%` : "—",
      sub: "Keystroke precision",
      icon: Target,
      color: "text-teal-500",
      bg: "bg-teal-500/10 dark:bg-teal-500/20",
      border: "border-teal-500/30",
    },
    {
      label: "Total Tests Taken",
      value: `${testsCount}`,
      sub: "Floor practice sessions",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Core Real Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.bg} ${item.border} ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {item.value}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{item.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing Tier Progress Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-[#121c24] text-white border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Dynamic Speed Tier Analytics</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Current Tier:{" "}
            <span className="text-emerald-400 font-extrabold">
              {userLevel || currentTierName} Typist
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            {highestWpm >= 140 ? (
              <span>
                You have reached the pinnacle <strong>Grandmaster Tier</strong> (140+ WPM). Keep racing to defend your world ranking!
              </span>
            ) : (
              <span>
                You are only <strong>{wpmAway} WPM</strong> away from unlocking the prestigious{" "}
                <strong className="text-amber-400">{nextTierName} Tier</strong> ({nextTierTarget} WPM). Practice on The Typing Floor to level up!
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
          <div className="text-right">
            <span className="text-xs text-zinc-400 font-semibold">Progress to Next Tier</span>
            <div className="text-xl font-mono font-black text-amber-400">
              {progressPercent}%
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-md">
            ⚡
          </div>
        </div>
      </div>
    </div>
  );
}
