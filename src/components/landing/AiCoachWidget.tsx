"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Maximize2,
  Minimize2,
  BookOpen,
  Keyboard,
  Award,
  Loader2,
  Flame,
} from "lucide-react";

interface AiCoachWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  stats?: {
    highestWpm?: number;
    avgWpm?: number;
    avgAccuracy?: number;
    testsCount?: number;
  };
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

const TOPIC_PRESETS = [
  { label: "🚀 Break Past 80 WPM", query: "How do I break through the 80 WPM speed plateau?" },
  { label: "🖐️ Home Row & Finger Placement", query: "What is the optimal finger placement on the home row?" },
  { label: "⚡ Accuracy vs Raw Speed", query: "How much does a backspace error penalize my net WPM?" },
  { label: "⌨️ Mechanical Switch Types", query: "Which keyboard switches are best for typing speed?" },
  { label: "🧘 Posture & Wrist Ergonomics", query: "How can I prevent wrist fatigue and tendon pain while typing?" },
  { label: "💻 Number Row & Code Syntax", query: "How do I learn touch typing on the number row and coding symbols?" },
];

export default function AiCoachWidget({
  isOpen,
  onClose,
  onToggle,
  stats,
}: AiCoachWidgetProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "👋 Hello! I am your VubaTrust AI Master Typing Coach. Ask me anything about breaking speed plateaus, biomechanical finger reach, keyboard switch selection, or race strategies. How can I assist your typing journey today?",
      timestamp: "Just now",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          stats,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Focus on floating your wrists and locking in 98% accuracy!";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "Anchor your index fingers on the F and J nubs, keep wrists floating, and aim for rhythmic flow!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Open AI Typing Coach"
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-bold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
          <span className="hidden sm:inline text-xs font-black tracking-wide uppercase">
            AI Typing Coach
          </span>
          {/* Notification pulse badge */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
          </span>
        </button>
      </div>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white dark:bg-[#0c131a] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-fadeIn transition-all duration-300 ${
            isMaximized
              ? "inset-2 sm:inset-6 md:inset-10 rounded-3xl"
              : "bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[440px] h-[560px] max-h-[82vh] rounded-3xl"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-950 via-[#111c24] to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-400/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>Vuba AI Master Coach</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Biomechanical & High-Velocity Speed Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Maximize / Minimize Screen Toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isMaximized ? "Exit Full Screen" : "Maximize Full Screen"}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close Coach"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Maximized Layout (Split with Topic Library) vs Compact Window */}
          <div className="flex-1 flex overflow-hidden">
            {isMaximized && (
              <div className="hidden md:flex flex-col w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-4 space-y-4 overflow-y-auto">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>Curated Master Topics</span>
                </div>
                <div className="space-y-1.5">
                  {TOPIC_PRESETS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(t.query)}
                      className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {stats && (
                  <div className="mt-auto p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Your Current Metrics</span>
                    <div className="flex justify-between font-bold text-zinc-900 dark:text-white">
                      <span>Best Speed:</span>
                      <span className="text-emerald-500">{stats.highestWpm || 0} WPM</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-900 dark:text-white">
                      <span>Avg Accuracy:</span>
                      <span>{stats.avgAccuracy || 100}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conversation Messages */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0c131a]">
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${
                      m.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        m.sender === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-400 text-zinc-950"
                      }`}
                    >
                      {m.sender === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.sender === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none shadow-md"
                          : "bg-zinc-100 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-none whitespace-pre-wrap"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="block text-[9px] mt-1.5 opacity-60 text-right">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>AI Master Coach is formulating personalized advice...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Preset Questions Bar */}
              <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-200/70 dark:border-zinc-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
                {TOPIC_PRESETS.slice(0, 4).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#0c131a] border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask any question about typing speed, drills, ergonomics, or switches..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim()}
                  className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold transition-all hover:scale-105 cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
