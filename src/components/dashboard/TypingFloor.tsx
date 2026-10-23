"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getRandomPassage, TextCategory } from "@/src/lib/textGenerator";
import { soundEngine } from "@/src/lib/soundEngine";
import { supabase } from "@/src/lib/supabase";

interface TypingFloorProps {
  userId?: string;
  userName?: string;
  userAvatar?: string | null;
  onTestComplete?: (wpm: number, accuracy: number) => void;
  standalone?: boolean;
}

export default function TypingFloor({
  userId,
  userName = "Typist",
  userAvatar = null,
  onTestComplete,
  standalone = false,
}: TypingFloorProps) {
  const [category, setCategory] = useState<TextCategory>("digital_literacy");
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);

  const [words, setWords] = useState<string[]>([]);
  const [currWordIndex, setCurrWordIndex] = useState<number>(0);
  const [currCharInput, setCurrCharInput] = useState<string>("");

  // History of completed words: array of booleans indicating correctness of each char or word status
  const [wordStatuses, setWordStatuses] = useState<
    { word: string; input: string; isCorrect: boolean }[]
  >([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Live stats
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctCharsCount, setCorrectCharsCount] = useState(0);
  const [incorrectCharsCount, setIncorrectCharsCount] = useState(0);

  // View state
  const [isMaxScreen, setIsMaxScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [switchType, setSwitchType] = useState("Cherry MX Blue");

  // Smooth line scrolling offset
  const [lineOffsetY, setLineOffsetY] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLDivElement | null>(null);

  // Initialize long passage (enough words to last 120s+)
  useEffect(() => {
    resetTest();
  }, [category, durationSeconds]);

  // Countdown timer effect
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer: NodeJS.Timeout = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished]);

  // Live WPM / accuracy recalculated on every tick and keystroke batch
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const elapsed = durationSeconds - remainingSeconds;
    const minutes = elapsed / 60;
    if (minutes > 0.03) {
      setWpm(Math.max(0, Math.round(correctCharsCount / 5 / minutes)));
      const totalChars = correctCharsCount + incorrectCharsCount;
      setAccuracy(
        totalChars > 0
          ? Math.round((correctCharsCount / totalChars) * 100)
          : 100
      );
    }
  }, [
    remainingSeconds,
    isStarted,
    isFinished,
    durationSeconds,
    correctCharsCount,
    incorrectCharsCount,
  ]);

  // Finish the test when the countdown reaches zero (outside of state updaters)
  useEffect(() => {
    if (isStarted && !isFinished && remainingSeconds === 0) {
      finishTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, isStarted, isFinished]);

  // Keymash.io-style 3-second countdown before official test start
  useEffect(() => {
    if (countdown === null) return;

    // Optional audio tone cue for Keymash countdown
    try {
      if (soundEnabled && typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const freq = countdown === 0 ? 880 : 440;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      }
    } catch {
      // Audio not permitted yet
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0 ("GO!"), brief burst then start
      const timer = setTimeout(() => {
        setCountdown(null);
        setIsStarted(true);
        setStartTime(Date.now());
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, soundEnabled]);

  // Line-by-line smooth scrolling based on measured layout, so it stays
  // correct across font sizes, padding and container heights
  useEffect(() => {
    const wordEl = activeWordRef.current;
    const contentEl = scrollContentRef.current;
    const containerEl = wordsContainerRef.current;
    if (!wordEl || !contentEl || !containerEl) return;

    const wordStyle = window.getComputedStyle(wordEl);
    const linePitch =
      wordEl.getBoundingClientRect().height +
      parseFloat(wordStyle.marginTop) +
      parseFloat(wordStyle.marginBottom);
    if (linePitch <= 0) return;

    // Word and content wrapper are both inside the translated element, so
    // this delta is unaffected by the current scroll offset
    const relTop =
      wordEl.getBoundingClientRect().top - contentEl.getBoundingClientRect().top;
    const lineIndex = Math.max(0, Math.round(relTop / linePitch));

    const containerStyle = window.getComputedStyle(containerEl);
    const visibleHeight =
      containerEl.clientHeight -
      parseFloat(containerStyle.paddingTop) -
      parseFloat(containerStyle.paddingBottom);
    const visibleLines = Math.max(2, Math.floor(visibleHeight / linePitch));

    // Scroll just enough that the line below the active one stays visible
    const hiddenLines = Math.max(0, lineIndex - (visibleLines - 2));
    setLineOffsetY(hiddenLines * linePitch);
  }, [currWordIndex, isMaxScreen]);

  const resetTest = () => {
    // Generate a long passage with 300+ words so user never runs out
    const text = getRandomPassage(category, 350);
    const splitWords = text.trim().split(/\s+/);
    setWords(splitWords);
    setWordStatuses([]);
    setCurrWordIndex(0);
    setCurrCharInput("");
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setRemainingSeconds(durationSeconds);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectCharsCount(0);
    setIncorrectCharsCount(0);
    setLineOffsetY(0);
    setCountdown(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const startPlayCountdown = () => {
    resetTest();
    setCountdown(3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || countdown !== null) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    const currentTargetWord = words[currWordIndex] || "";

    // Handle space key press: submit current word and advance to next
    if (val.endsWith(" ")) {
      const typedWord = val.trim();
      const isWordCorrect = typedWord === currentTargetWord;

      // Count characters
      let correctInWord = 0;
      let incorrectInWord = 0;
      for (let i = 0; i < currentTargetWord.length; i++) {
        if (i < typedWord.length && typedWord[i] === currentTargetWord[i]) {
          correctInWord++;
        } else {
          incorrectInWord++;
        }
      }
      // Add space character to correct count if word was right
      if (isWordCorrect) correctInWord++;

      setCorrectCharsCount((prev) => prev + correctInWord);
      setIncorrectCharsCount((prev) => prev + incorrectInWord);

      setWordStatuses((prev) => [
        ...prev,
        {
          word: currentTargetWord,
          input: typedWord,
          isCorrect: isWordCorrect,
        },
      ]);

      // Sound for space
      soundEngine.playKeySound(true, !isWordCorrect);

      // Advance word
      setCurrWordIndex((prev) => prev + 1);
      setCurrCharInput("");

      // If reached the end of word pool, regenerate more words
      if (currWordIndex >= words.length - 15) {
        const extraText = getRandomPassage(category, 150);
        setWords((prev) => [...prev, ...extraText.trim().split(/\s+/)]);
      }
      return;
    }

    // Play tactile mechanical audio
    const isError =
      val.length > currentTargetWord.length ||
      val[val.length - 1] !== currentTargetWord[val.length - 1];
    soundEngine.playKeySound(false, isError);

    setCurrCharInput(val);
  };

  const finishTest = async () => {
    setIsFinished(true);

    const actualDuration = durationSeconds;
    const minutes = actualDuration / 60;
    const totalChars = correctCharsCount + incorrectCharsCount;
    const finalNetWpm = Math.max(
      0,
      Math.round(correctCharsCount / 5 / (minutes || 0.01))
    );
    const finalRawWpm = Math.max(
      0,
      Math.round(totalChars / 5 / (minutes || 0.01))
    );
    const finalAcc =
      totalChars > 0 ? Math.round((correctCharsCount / totalChars) * 100) : 100;

    setWpm(finalNetWpm);
    setRawWpm(finalRawWpm);
    setAccuracy(finalAcc);

    onTestComplete?.(finalNetWpm, finalAcc);

    // Save the result to Supabase so it shows up for everyone
    if (userId && userId !== "guest") {
      const { error } = await supabase.from("test_results").insert({
        user_id: userId,
        wpm: finalNetWpm,
        accuracy: finalAcc,
        test_mode: `${durationSeconds}s`,
        test_duration: durationSeconds,
      });
      if (error) {
        console.warn("Result sync failed:", error.message);
      }
    }
  };

  return (
    <div
      className={`relative flex flex-col transition-all duration-300 ${
        isMaxScreen
          ? "fixed inset-0 z-50 bg-[#070c0f] text-white p-6 sm:p-12 overflow-hidden flex justify-between"
          : "w-full rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8"
      }`}
    >
      {/* Top Floor Bar: Settings, Categories & Countdown Seconds */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>The Typing Floor</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              {durationSeconds}s Countdown
            </span>
          </h2>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold overflow-x-auto">
          {[
            { id: "digital_literacy", label: "Digital Literacy" },
            { id: "technology", label: "Technology" },
            { id: "literature", label: "Literature" },
            { id: "philosophy", label: "Philosophy" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as TextCategory)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                category === cat.id
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Seconds Duration Selector: 15s, 30s, 60s, 120s */}
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-amber-500 mr-1" />
          {[15, 30, 60, 120].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => {
                setDurationSeconds(sec);
                setRemainingSeconds(sec);
                resetTest();
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                durationSeconds === sec
                  ? "text-amber-600 dark:text-amber-400 bg-amber-400/20 border border-amber-400/40 font-extrabold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Audio switch & Fullscreen floor toggle */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundEngine.setEnabled(next);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
            }`}
            title="Toggle mechanical switch audio"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Switch sound select */}
          <select
            value={switchType}
            onChange={(e) => {
              setSwitchType(e.target.value);
              soundEngine.setSwitchType(e.target.value);
            }}
            className="text-xs px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="Cherry MX Blue">Cherry MX Blue</option>
            <option value="Cherry MX Red">Cherry MX Red</option>
            <option value="Thocky Custom">Thocky Custom</option>
            <option value="Vintage Typewriter">Typewriter</option>
          </select>

          {/* Maximize / Zen Floor Mode Toggle */}
          {!standalone && (
            <button
              type="button"
              onClick={() => setIsMaxScreen(!isMaxScreen)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              title={isMaxScreen ? "Exit Fullscreen Floor" : "Maximize Screen Floor"}
            >
              {isMaxScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Regenerate Text */}
          <button
            type="button"
            onClick={resetTest}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Reset test"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Keymash-style Play Button on the right corner */}
          <button
            type="button"
            onClick={startPlayCountdown}
            disabled={countdown !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Start official 3-second countdown typing run (Keymash.io style)"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Play</span>
          </button>
        </div>
      </div>

      {/* Live Metrics HUD */}
      <div className="flex items-center justify-between py-4 px-2 text-xs">
        <div className="flex items-center gap-6">
          {/* Countdown Clock (Highlights in Amber/Red when low) */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-400 font-semibold uppercase text-[10px]">
              Time Left:
            </span>
            <span
              className={`text-2xl font-black font-mono transition-colors ${
                remainingSeconds <= 5
                  ? "text-red-500 animate-ping"
                  : remainingSeconds <= 10
                  ? "text-orange-500"
                  : "text-amber-500"
              }`}
            >
              {remainingSeconds}s
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-400 font-semibold uppercase text-[10px]">
              Live WPM:
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {wpm}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-400 font-semibold uppercase text-[10px]">
              Accuracy:
            </span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
          Words completed: <strong>{currWordIndex}</strong>
        </div>
      </div>

      {/* The Maximum Screen Plain Text Floor with Line-by-Line Smooth Scrolling */}
      <div
        ref={wordsContainerRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative w-full rounded-2xl bg-zinc-50/90 dark:bg-[#070c10] border border-zinc-200 dark:border-zinc-800/90 p-6 sm:p-10 font-mono text-xl sm:text-2xl leading-[50px] select-none cursor-text overflow-hidden shadow-inner ${
          isMaxScreen ? "flex-1 max-h-[65vh]" : "h-[160px] sm:h-[180px]"
        }`}
      >
        {/* Animated scrolling wrapper that shifts lines up as user finishes each line */}
        <div
          ref={scrollContentRef}
          className="transition-transform duration-300 ease-out flex flex-wrap gap-x-3"
          style={{ transform: `translateY(-${lineOffsetY}px)` }}
        >
          {words.map((word, wIdx) => {
            const isCompletedWord = wIdx < currWordIndex;
            const isCurrentWord = wIdx === currWordIndex;
            const status = wordStatuses[wIdx];

            return (
              <div
                key={wIdx}
                ref={isCurrentWord ? activeWordRef : null}
                className="inline-flex tracking-normal relative my-0.5"
              >
                {/* Completed Word Rendering */}
                {isCompletedWord && (
                  <span
                    className={`font-semibold ${
                      status?.isCorrect
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 line-through decoration-2"
                    }`}
                  >
                    {word}
                  </span>
                )}

                {/* Currently Active Word Rendering character by character */}
                {isCurrentWord && (
                  <span className="relative">
                    {word.split("").map((char, cIdx) => {
                      const userChar = currCharInput[cIdx];
                      const isTyped = cIdx < currCharInput.length;
                      const isCorrect = isTyped && userChar === char;
                      const isError = isTyped && userChar !== char;

                      let colorClass = "text-zinc-400 dark:text-zinc-500";
                      if (isCorrect) {
                        colorClass =
                          "text-emerald-600 dark:text-emerald-400 font-bold";
                      } else if (isError) {
                        colorClass =
                          "text-red-500 bg-red-500/20 rounded px-0.5";
                      }

                      return (
                        <span key={cIdx} className={colorClass}>
                          {cIdx === currCharInput.length && (
                            <span className="absolute -left-0.5 top-1 bottom-1 w-[2.5px] bg-amber-400 animate-pulse rounded-full" />
                          )}
                          {char}
                        </span>
                      );
                    })}

                    {/* Extra characters typed past word length */}
                    {currCharInput.length > word.length && (
                      <span className="text-red-500 bg-red-500/30 font-bold px-0.5">
                        {currCharInput.slice(word.length)}
                      </span>
                    )}

                    {/* Caret at end of typed word */}
                    {currCharInput.length >= word.length && (
                      <span className="inline-block w-[2.5px] h-6 bg-amber-400 animate-pulse align-middle ml-0.5" />
                    )}
                  </span>
                )}

                {/* Upcoming Word in clean muted tone */}
                {!isCompletedWord && !isCurrentWord && (
                  <span className="text-zinc-400/80 dark:text-zinc-600">
                    {word}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Hidden Input Layer for Capturing Real Keystrokes */}
        <input
          ref={inputRef}
          type="text"
          value={currCharInput}
          onChange={handleInputChange}
          disabled={isFinished || countdown !== null}
          autoFocus
          className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
        />
      </div>

      {/* Floor Footer Instruction */}
      <div className="flex items-center justify-between pt-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Press space after each word. As you complete a line, upcoming text slides up automatically.
        </span>
        <button
          type="button"
          onClick={resetTest}
          className="flex items-center gap-1.5 font-bold text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Test</span>
        </button>
      </div>

      {/* Full-Screen Keymash-style 3-second Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn select-none pointer-events-auto">
          <div className="relative flex flex-col items-center justify-center">
            {/* Outer pulsing rings */}
            <div className="w-40 h-40 rounded-full border-4 border-amber-400/20 animate-ping absolute inset-0 m-auto pointer-events-none" />
            <div className="w-48 h-48 rounded-full border border-amber-400/30 animate-pulse absolute inset-0 m-auto pointer-events-none" />

            <div className="w-36 h-36 rounded-full bg-zinc-950/90 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(251,191,36,0.45)] flex items-center justify-center">
              {countdown > 0 ? (
                <span
                  key={countdown}
                  className="text-7xl sm:text-8xl font-black font-mono text-amber-400 animate-[bounce_0.5s_ease-in-out] tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                >
                  {countdown}
                </span>
              ) : (
                <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-wider animate-pulse drop-shadow-[0_0_25px_rgba(52,211,153,0.7)]">
                  GO!
                </span>
              )}
            </div>

            <div className="mt-5 text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-200 bg-zinc-900/95 px-5 py-2 rounded-full border border-zinc-700/80 shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {countdown > 0 ? "Get Ready to Type" : "Type Now!"}
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md rounded-3xl animate-fadeIn">
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#0f171e] border border-zinc-200 dark:border-zinc-700 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-500 border border-amber-400/30">
                {durationSeconds}s Floor Test Finished
              </span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                Speed Recorded!
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your score has been registered on the live leaderboard.
              </p>
            </div>

            {/* Final Stats Cards */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                  Net Speed
                </div>
                <div className="text-2xl font-black text-emerald-500">{wpm}</div>
                <div className="text-[10px] text-zinc-400">WPM</div>
              </div>
              <div className="border-x border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                  Accuracy
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {accuracy}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  Errors: {incorrectCharsCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                  Words
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {currWordIndex}
                </div>
                <div className="text-[10px] text-zinc-400">Completed</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetTest}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Try Again ({durationSeconds}s)
              </button>
              {isMaxScreen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMaxScreen(false);
                    resetTest();
                  }}
                  className="px-4 py-3 rounded-xl font-bold text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Exit Floor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
