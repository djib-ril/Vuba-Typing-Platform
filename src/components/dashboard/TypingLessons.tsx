"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
  Star,
  Award,
  ChevronRight,
  Hand,
} from "lucide-react";
import { soundEngine } from "@/src/lib/soundEngine";
import { supabase } from "@/src/lib/supabase";

export interface Lesson {
  id: string;
  title: string;
  tier: "Beginner" | "Intermediate" | "Advanced" | "Grandmaster";
  description: string;
  targetKeys: string[];
  practiceText: string;
  minAccuracy: number;
}

export const LESSONS: Lesson[] = [
  // --- TIER 1: BEGINNER (HOME ROW) ---
  {
    id: "lesson-1",
    title: "1. Index Anchors: F & J Nubs",
    tier: "Beginner",
    description: "Feel the tactile bumps on F and J. Anchor your left index on F and right index on J.",
    targetKeys: ["f", "j", " "],
    practiceText: "f j fj jf ff jj fff jjj fjf jfj f f j j fj fj jf jf fjj fff jjj",
    minAccuracy: 90,
  },
  {
    id: "lesson-2",
    title: "2. Left Hand Home: D, S, A",
    tier: "Beginner",
    description: "Learn middle finger on D, ring finger on S, and pinky finger on A.",
    targetKeys: ["a", "s", "d", "f", " "],
    practiceText: "a s d f as df fd sa dad sad fad add safe asdf fads dads salads",
    minAccuracy: 90,
  },
  {
    id: "lesson-3",
    title: "3. Right Hand Home: K, L, ;",
    tier: "Beginner",
    description: "Learn middle finger on K, ring finger on L, and pinky finger on semicolon.",
    targetKeys: ["j", "k", "l", ";", " "],
    practiceText: "j k l ; jk l; ;l kj jkl ;lk ask fall flask all lads fall ask",
    minAccuracy: 90,
  },
  {
    id: "lesson-4",
    title: "4. Center Reach: G & H",
    tier: "Beginner",
    description: "Stretch left index to G and right index to H, then return to home anchors.",
    targetKeys: ["g", "h"],
    practiceText: "g h gh hg f g j h flag half glad shall dash flash glass shaft",
    minAccuracy: 90,
  },
  {
    id: "lesson-5",
    title: "5. Home Row Mastery Capstone",
    tier: "Beginner",
    description: "Combine all home row keys into full fluent words with floating wrists.",
    targetKeys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    practiceText: "a flash of glass had fallen as half a glad lad shall dash afar",
    minAccuracy: 92,
  },

  // --- TIER 2: INTERMEDIATE (TOP ROW & VOWELS) ---
  {
    id: "lesson-6",
    title: "6. Left Top Row: R, E, W, Q, T",
    tier: "Intermediate",
    description: "Extend fingers upward from home row: F->R, D->E, S->W, A->Q, F->T.",
    targetKeys: ["q", "w", "e", "r", "t"],
    practiceText: "we were wet water write raw tree treat quest sweet wear tear treat",
    minAccuracy: 90,
  },
  {
    id: "lesson-7",
    title: "7. Right Top Row: U, I, O, P, Y",
    tier: "Intermediate",
    description: "Extend fingers upward: J->U, K->I, L->O, ;->P, J->Y.",
    targetKeys: ["y", "u", "i", "o", "p"],
    practiceText: "you pour your pipe pop loop yellow upper prior pulse youth reply",
    minAccuracy: 90,
  },
  {
    id: "lesson-8",
    title: "8. Vowel Alternation & Hand Fluidity",
    tier: "Intermediate",
    description: "Coordinate cross-hand rhythm using key vowel patterns: A, E, I, O, U.",
    targetKeys: ["a", "e", "i", "o", "u"],
    practiceText: "the quick thought of quiet people who write regular words with ease",
    minAccuracy: 92,
  },
  {
    id: "lesson-9",
    title: "9. Top & Home Row Flow",
    tier: "Intermediate",
    description: "High-frequency English words utilizing both home and upper rows.",
    targetKeys: ["a", "e", "i", "o", "u", "r", "t", "s", "d", "h"],
    practiceText: "their great future relies on steady focus and gentle rhythmic keystrokes",
    minAccuracy: 93,
  },

  // --- TIER 3: ADVANCED (BOTTOM ROW & CAPITALIZATION) ---
  {
    id: "lesson-10",
    title: "10. Left Bottom Row: Z, X, C, V, B",
    tier: "Advanced",
    description: "Curl fingers downward to bottom row: A->Z, S->X, D->C, F->V, F->B.",
    targetKeys: ["z", "x", "c", "v", "b"],
    practiceText: "box voice cave brave zebra exact zinc vivid buzz brave climb",
    minAccuracy: 90,
  },
  {
    id: "lesson-11",
    title: "11. Right Bottom Row: N, M, Commas & Dots",
    tier: "Advanced",
    description: "Curl fingers downward: J->N, J->M, K->,, L->., ;->/.",
    targetKeys: ["n", "m", ",", ".", "/"],
    practiceText: "man moon name plan, move men mind calm, lemon lion moon. run now.",
    minAccuracy: 90,
  },
  {
    id: "lesson-12",
    title: "12. Shift Key Coordination & Capitals",
    tier: "Advanced",
    description: "Use opposite hand Shift: Left Shift for right keys, Right Shift for left keys.",
    targetKeys: ["Shift"],
    practiceText: "The United States, Africa, Europe, Asia, Pacific Ocean, Mount Everest.",
    minAccuracy: 92,
  },
  {
    id: "lesson-13",
    title: "13. Full Alphabet Pangrams",
    tier: "Advanced",
    description: "Every letter of the alphabet in continuous natural phrasing.",
    targetKeys: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    practiceText: "The quick brown fox jumps over the lazy dog while five wizards jump quickly.",
    minAccuracy: 94,
  },

  // --- TIER 4: GRANDMASTER (NUMBERS, SYMBOLS & CODE SYNTAX) ---
  {
    id: "lesson-14",
    title: "14. Number Row Blind Typing",
    tier: "Grandmaster",
    description: "Reach all 10 digits without glancing down at the keyboard.",
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    practiceText: "1984 2026 365 days 24 hours 100 percent 50 miles 789 456 123 000",
    minAccuracy: 90,
  },
  {
    id: "lesson-15",
    title: "15. Complex Punctuation & Quotes",
    tier: "Grandmaster",
    description: "Hyphens, exclamation marks, question marks, and paired quotation marks.",
    targetKeys: ["!", "?", "\"", "'", ":", ";", "-", "_"],
    practiceText: "\"Is this true?\" asked Alex; \"Yes—without a doubt! It's self-evident.\"",
    minAccuracy: 92,
  },
  {
    id: "lesson-16",
    title: "16. Code Syntax & Programming Symbols",
    tier: "Grandmaster",
    description: "Curly braces, brackets, equality operators, and arrow functions.",
    targetKeys: ["{", "}", "[", "]", "(", ")", "=", "+", "$", ";"],
    practiceText: "const users = [1, 2, 3]; const active = users.filter(u => u > 0);",
    minAccuracy: 90,
  },
  {
    id: "lesson-17",
    title: "17. Grandmaster Speed Capstone",
    tier: "Grandmaster",
    description: "The ultimate digital literacy typing trial across the full keyboard spectrum.",
    targetKeys: ["ALL"],
    practiceText: "Mastery is not about rushing; it is the natural byproduct of precision, muscle memory, and relaxed confidence.",
    minAccuracy: 95,
  },
];

// Finger assignments for keyboard visualizer
const KEYBOARD_ROWS = [
  [
    { key: "`", finger: "left-pinky", label: "` ~" },
    { key: "1", finger: "left-pinky", label: "1" },
    { key: "2", finger: "left-ring", label: "2" },
    { key: "3", finger: "left-middle", label: "3" },
    { key: "4", finger: "left-index", label: "4" },
    { key: "5", finger: "left-index", label: "5" },
    { key: "6", finger: "right-index", label: "6" },
    { key: "7", finger: "right-index", label: "7" },
    { key: "8", finger: "right-middle", label: "8" },
    { key: "9", finger: "right-ring", label: "9" },
    { key: "0", finger: "right-pinky", label: "0" },
    { key: "-", finger: "right-pinky", label: "-" },
    { key: "=", finger: "right-pinky", label: "=" },
  ],
  [
    { key: "q", finger: "left-pinky", label: "Q" },
    { key: "w", finger: "left-ring", label: "W" },
    { key: "e", finger: "left-middle", label: "E" },
    { key: "r", finger: "left-index", label: "R" },
    { key: "t", finger: "left-index", label: "T" },
    { key: "y", finger: "right-index", label: "Y" },
    { key: "u", finger: "right-index", label: "U" },
    { key: "i", finger: "right-middle", label: "I" },
    { key: "o", finger: "right-ring", label: "O" },
    { key: "p", finger: "right-pinky", label: "P" },
    { key: "[", finger: "right-pinky", label: "[" },
    { key: "]", finger: "right-pinky", label: "]" },
  ],
  [
    { key: "a", finger: "left-pinky", label: "A" },
    { key: "s", finger: "left-ring", label: "S" },
    { key: "d", finger: "left-middle", label: "D" },
    { key: "f", finger: "left-index", label: "F", isNub: true },
    { key: "g", finger: "left-index", label: "G" },
    { key: "h", finger: "right-index", label: "H" },
    { key: "j", finger: "right-index", label: "J", isNub: true },
    { key: "k", finger: "right-middle", label: "K" },
    { key: "l", finger: "right-ring", label: "L" },
    { key: ";", finger: "right-pinky", label: ";" },
    { key: "'", finger: "right-pinky", label: "'" },
  ],
  [
    { key: "z", finger: "left-pinky", label: "Z" },
    { key: "x", finger: "left-ring", label: "X" },
    { key: "c", finger: "left-middle", label: "C" },
    { key: "v", finger: "left-index", label: "V" },
    { key: "b", finger: "left-index", label: "B" },
    { key: "n", finger: "right-index", label: "N" },
    { key: "m", finger: "right-index", label: "M" },
    { key: ",", finger: "right-middle", label: "," },
    { key: ".", finger: "right-ring", label: "." },
    { key: "/", finger: "right-pinky", label: "/" },
  ],
];

const FINGER_COLORS: Record<string, { bg: string; text: string; border: string; name: string }> = {
  "left-pinky": { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/40", name: "Left Pinky" },
  "left-ring": { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40", name: "Left Ring" },
  "left-middle": { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/40", name: "Left Middle" },
  "left-index": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40", name: "Left Index" },
  "right-index": { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/40", name: "Right Index" },
  "right-middle": { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/40", name: "Right Middle" },
  "right-ring": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/40", name: "Right Ring" },
  "right-pinky": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/40", name: "Right Pinky" },
  "thumb": { bg: "bg-zinc-500/15", text: "text-zinc-300", border: "border-zinc-500/40", name: "Thumbs" },
};

interface TypingLessonsProps {
  userId?: string;
  onLessonFinish?: (wpm: number, accuracy: number) => void;
}

export default function TypingLessons({ userId, onLessonFinish }: TypingLessonsProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSONS[0]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(["lesson-1"]);
  const [activeTier, setActiveTier] = useState<string>("All");

  // In-lesson typing state
  const [typedChars, setTypedChars] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorsCount, setErrorsCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load completed lessons from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vuba_completed_lessons");
      if (saved) {
        setCompletedLessonIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      try {
        localStorage.setItem("vuba_completed_lessons", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setTypedChars("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrorsCount(0);
    setIsFinished(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;
    const targetText = selectedLesson.practiceText;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Play tactile sound
    const lastChar = val[val.length - 1];
    const expectedChar = targetText[val.length - 1];
    const isError = lastChar !== expectedChar;

    soundEngine.playKeySound(lastChar === " ", isError);

    if (isError) {
      setErrorsCount((prev) => prev + 1);
    }

    setTypedChars(val);

    // Calculate live stats
    const totalTyped = val.length;
    const correctCount = val.split("").filter((ch, i) => ch === targetText[i]).length;
    const acc = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
    setAccuracy(acc);

    const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0.01;
    const liveWpm = Math.max(0, Math.round(correctCount / 5 / (elapsedMinutes || 0.01)));
    setWpm(liveWpm);

    // Finish lesson when full text typed
    if (val.length >= targetText.length) {
      finishLesson(liveWpm, acc);
    }
  };

  const finishLesson = (finalWpm: number, finalAcc: number) => {
    setIsFinished(true);
    if (finalAcc >= selectedLesson.minAccuracy) {
      saveCompleted(selectedLesson.id);

      // Save to Supabase test_results
      if (userId && userId !== "guest") {
        supabase.from("test_results").insert({
          user_id: userId,
          wpm: finalWpm,
          accuracy: finalAcc,
          test_mode: `lesson:${selectedLesson.id}`,
          test_duration: 60,
        }).then(() => {});
      }

      onLessonFinish?.(finalWpm, finalAcc);
    }
  };

  const nextLesson = () => {
    const currentIndex = LESSONS.findIndex((l) => l.id === selectedLesson.id);
    if (currentIndex < LESSONS.length - 1) {
      startLesson(LESSONS[currentIndex + 1]);
    }
  };

  const currentCharIndex = typedChars.length;
  const targetChar = selectedLesson.practiceText[currentCharIndex] || "";

  // Find finger for the target key
  const getFingerForChar = (char: string) => {
    const lower = char.toLowerCase();
    if (char === " ") return FINGER_COLORS["thumb"];
    for (const row of KEYBOARD_ROWS) {
      for (const k of row) {
        if (k.key === lower || k.label.toLowerCase() === lower) {
          return FINGER_COLORS[k.finger] || FINGER_COLORS["thumb"];
        }
      }
    }
    return FINGER_COLORS["thumb"];
  };

  const activeFingerInfo = getFingerForChar(targetChar);

  const filteredLessons = LESSONS.filter(
    (l) => activeTier === "All" || l.tier === activeTier
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-[#101b22] border border-emerald-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Keyboard Lessons</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            From Beginner to Advanced Keyboard Typist
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            Master muscle memory row by row. Follow the interactive finger guide, conquer the home row, vowels, and numbers, and advance your speed tier.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
          <div className="text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Lessons Completed</div>
            <div className="text-xl font-mono font-black text-amber-400">
              {completedLessonIds.length} / {LESSONS.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Curriculum Selector */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Curriculum Progression</span>
            </h3>
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-[11px] font-bold overflow-x-auto no-scrollbar">
            {["All", "Beginner", "Intermediate", "Advanced", "Grandmaster"].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTier === tier
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Lessons List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredLessons.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              const isDone = completedLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => startLesson(lesson)}
                  className={`w-full p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {lesson.tier}
                    </span>
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Min: {lesson.minAccuracy}%
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {lesson.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {lesson.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Interactive Lesson Player & Visual Keyboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Lesson Header & HUD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                  {selectedLesson.tier} Drill
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedLesson.description}
                </p>
              </div>

              {/* Live HUD */}
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Speed</span>
                  <div className="text-xl font-black text-emerald-500">{wpm} WPM</div>
                </div>
                <div className="text-center border-l border-zinc-200 dark:border-zinc-800 pl-5">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Accuracy</span>
                  <div className="text-xl font-black text-zinc-900 dark:text-white">{accuracy}%</div>
                </div>
                <button
                  type="button"
                  onClick={() => startLesson(selectedLesson)}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  title="Restart lesson"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Character & Finger Indicator Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-emerald-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Finger to use:</span>
                <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${activeFingerInfo.bg} ${activeFingerInfo.text} border ${activeFingerInfo.border}`}>
                  {activeFingerInfo.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Next Key:</span>
                <span className="px-2.5 py-0.5 rounded bg-zinc-950 text-amber-400 font-mono font-black text-sm border border-amber-400/40">
                  {targetChar === " " ? "SPACE" : targetChar || "DONE"}
                </span>
              </div>
            </div>

            {/* Practice Typing Area */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="relative p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-[#070c10] border border-zinc-200 dark:border-zinc-800 font-mono text-xl sm:text-2xl leading-[48px] select-none cursor-text min-h-[140px]"
            >
              <div className="flex flex-wrap">
                {selectedLesson.practiceText.split("").map((ch, idx) => {
                  const isTyped = idx < typedChars.length;
                  const isCurrent = idx === typedChars.length;
                  const isCorrect = isTyped && typedChars[idx] === ch;
                  const isError = isTyped && typedChars[idx] !== ch;

                  let color = "text-zinc-400/70 dark:text-zinc-600";
                  if (isCorrect) color = "text-emerald-600 dark:text-emerald-400 font-bold";
                  else if (isError) color = "text-red-500 bg-red-500/20 rounded px-0.5";

                  return (
                    <span key={idx} className={`relative ${color}`}>
                      {isCurrent && (
                        <span className="absolute -left-0.5 top-1 bottom-1 w-[2.5px] bg-amber-400 animate-pulse rounded-full" />
                      )}
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  );
                })}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={typedChars}
                onChange={handleInputChange}
                disabled={isFinished}
                autoFocus
                className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
              />
            </div>

            {/* Completion Result Modal */}
            {isFinished && (
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-emerald-500/40 text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {accuracy >= selectedLesson.minAccuracy ? "Lesson Complete!" : "Keep Practicing!"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {accuracy >= selectedLesson.minAccuracy
                      ? "Great precision! You've unlocked the next lesson in your keyboard mastery journey."
                      : `You need at least ${selectedLesson.minAccuracy}% accuracy to pass. Focus on finger anchors!`}
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startLesson(selectedLesson)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    Try Again
                  </button>
                  {accuracy >= selectedLesson.minAccuracy && (
                    <button
                      type="button"
                      onClick={nextLesson}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next Lesson</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Keyboard Visualizer Diagram */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Interactive Finger Mapping Diagram
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Colors indicate designated typing finger
              </span>
            </div>

            {/* Keyboard Rows */}
            <div className="space-y-1.5 select-none font-mono">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5">
                  {row.map((k) => {
                    const fingerInfo = FINGER_COLORS[k.finger] || FINGER_COLORS["thumb"];
                    const isTarget = targetChar.toLowerCase() === k.key;

                    return (
                      <div
                        key={k.key}
                        className={`relative h-10 w-9 sm:w-11 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          isTarget
                            ? "bg-amber-400 text-zinc-950 font-black scale-110 shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10 border-amber-300"
                            : `${fingerInfo.bg} ${fingerInfo.text} ${fingerInfo.border}`
                        }`}
                      >
                        <span className="text-xs font-bold">{k.label}</span>
                        {k.isNub && (
                          <span className="w-2 h-0.5 bg-current rounded-full mt-0.5 opacity-80" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Spacebar Row */}
              <div className="flex justify-center pt-1">
                <div
                  className={`h-10 w-56 sm:w-72 rounded-xl border flex items-center justify-center transition-all ${
                    targetChar === " "
                      ? "bg-amber-400 text-zinc-950 font-black scale-105 shadow-[0_0_15px_rgba(251,191,36,0.8)] border-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold tracking-widest uppercase">Spacebar (Thumbs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
