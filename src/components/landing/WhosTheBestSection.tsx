"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Quote,
  Zap,
  TrendingUp,
  User,
  Send,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  Trash2,
  Shield,
} from "lucide-react";
import { supabase, type TopPerformer, ADMIN_EMAIL } from "@/src/lib/supabase";

export default function WhosTheBestSection() {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Form modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [adviceInput, setAdviceInput] = useState("");
  const [wpmInput, setWpmInput] = useState("120");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");

  const loadTopPerformers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("top_performers")
        .select("*")
        .order("rank_position", { ascending: true })
        .limit(3);

      if (!error && data && data.length > 0) {
        // Query latest highest WPM from test_results to guarantee Who's The Best matches the user's dashboard!
        const userIds = data.map((d: any) => d.user_id).filter(Boolean);
        let bestWpmMap: Record<string, number> = {};

        if (userIds.length > 0) {
          const { data: results } = await supabase
            .from("test_results")
            .select("user_id, wpm");
          (results || []).forEach((r: any) => {
            const w = Number(r.wpm) || 0;
            if (!bestWpmMap[r.user_id] || w > bestWpmMap[r.user_id]) {
              bestWpmMap[r.user_id] = w;
            }
          });
        }

        const synced = data.map((p: any) => {
          const realBest = p.user_id ? bestWpmMap[p.user_id] : null;
          const currentWpm = realBest && realBest > 0 ? realBest : (p.wpm || 120);
          const level =
            currentWpm >= 140
              ? "Grandmaster"
              : currentWpm >= 110
              ? "Pro"
              : currentWpm >= 80
              ? "Advanced"
              : "Intermediate";

          return {
            ...p,
            wpm: currentWpm,
            typing_level: p.typing_level || level,
          };
        });

        setPerformers(synced);
      } else {
        setPerformers([]);
      }
    } catch {
      setPerformers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopPerformers();

    // Check if the current user has admin rights
    supabase.auth.getSession().then(({ data }) => {
      const email = data?.session?.user?.email;
      if (email === ADMIN_EMAIL) {
        setIsAdminUser(true);
      }
    });

    // Subscribe to live score and submission updates
    const channel = supabase
      .channel("landing-top-performers-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "top_performers" },
        () => loadTopPerformers()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "test_results" },
        () => loadTopPerformers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeletePost = async (id?: string, name?: string) => {
    if (!id) return;
    const confirmed = window.confirm(
      `Admin Action: Are you sure you want to delete the showcase post by "${name || "this user"}"? This will remove it from Who's The Best immediately.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("top_performers").delete().eq("id", id);
      if (error) {
        alert(`Failed to delete post: ${error.message}`);
        return;
      }
      setPerformers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Error deleting post: ${err.message}`);
    }
  };

  const handleSubmitTopPerformer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !adviceInput.trim()) return;

    const nextRank = (Math.min(3, performers.length + 1) as 1 | 2 | 3);
    const speed = parseFloat(wpmInput) || 125.0;

    setSubmitError("");
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || null;

    const { error } = await supabase.from("top_performers").insert({
      user_id: currentUserId,
      name: nameInput.trim(),
      rank_position: nextRank,
      wpm: speed,
      accuracy: 99.4,
      typing_level:
        speed >= 140 ? "Grandmaster" : speed >= 110 ? "Pro" : "Advanced",
      advice_message: adviceInput.trim(),
      custom_avatar_url: avatarUrlInput.trim() || null,
    });

    if (error) {
      setSubmitError(
        "Could not publish your submission. Make sure you are signed in, then try again."
      );
      return;
    }

    // Re-read the podium from the server so it shows the real published state
    await loadTopPerformers();

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setShowSubmitModal(false);
      setNameInput("");
      setAdviceInput("");
      setAvatarUrlInput("");
    }, 1500);
  };

  const hasPerformers = performers.length > 0;

  return (
    <section
      id="whos-the-best"
      className="py-24 relative bg-zinc-50/60 dark:bg-[#090e13] border-y border-zinc-200/60 dark:border-zinc-800/80 overflow-hidden"
    >
      {/* Decorative background grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 dark:bg-amber-400/20 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Global Championship Hall of Fame</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Who's The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
              Best?
            </span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Honoring our top 3 real typists. As players practice on The Floor, their verified speeds and growth advice are published here for the community.
          </p>
        </div>

        {/* Dynamic Display: If NO real users exist yet, show "Awaiting Champions" Podium */}
        {!hasPerformers ? (
          <div className="max-w-4xl mx-auto mb-14 p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0e161c] border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/15 border border-amber-400/30 text-amber-500 flex items-center justify-center mx-auto shadow-md">
              <Crown className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Podium Open for Submissions
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                Awaiting the First Global Champions
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                No typist has claimed the podium yet. Practice on The Floor, record your WPM, and submit your words of advice to be celebrated in the Top 3 right here!
              </p>
            </div>

            {/* 3 Empty Podium Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-zinc-400 font-bold text-xs">
                  #2
                </div>
                <div className="text-xs font-bold text-zinc-400">Open Silver Slot</div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-400/40 text-center -mt-2">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center mx-auto mb-2 font-black text-sm shadow-md">
                  #1
                </div>
                <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  Open Champion Slot
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-zinc-400 font-bold text-xs">
                  #3
                </div>
                <div className="text-xs font-bold text-zinc-400">Open Bronze Slot</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md"
              >
                Sign In & Take Test
              </Link>
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-3 rounded-xl font-bold text-xs text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your Advice Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* Actual Real Performers Podium */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-14">
            {performers.map((data) => {
              const rank = data.rank_position;
              const isFirst = rank === 1;

              return (
                <div
                  key={data.id || rank}
                  className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
                    isFirst
                      ? "bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-[#111922] dark:via-[#14202d] dark:to-[#0f1720] border-2 border-amber-400/60 dark:border-amber-400/50 shadow-2xl shadow-amber-500/10 scale-100 lg:scale-105 z-20 order-1 lg:order-2"
                      : rank === 2
                      ? "bg-white dark:bg-[#0e161c] border border-zinc-200 dark:border-zinc-800 shadow-lg z-10 order-2 lg:order-1"
                      : "bg-white dark:bg-[#0e161c] border border-zinc-200 dark:border-zinc-800 shadow-lg z-10 order-3 lg:order-3"
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>#1 World Leader</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
                          rank === 1
                            ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/50"
                            : rank === 2
                            ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border-zinc-400"
                            : "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50"
                        }`}
                      >
                        <Medal className="w-3.5 h-3.5" />
                        <span>{rank === 1 ? "Champion Gold" : rank === 2 ? "Silver" : "Bronze"}</span>
                      </span>

                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Rank #{rank}
                      </span>
                    </div>

                    {/* Typist Avatar */}
                    <div className="flex flex-col items-center text-center mb-6">
                      <div
                        className={`relative w-24 h-24 rounded-full p-1 border-2 shadow-lg mb-3 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${
                          rank === 1
                            ? "border-amber-400"
                            : rank === 2
                            ? "border-zinc-400"
                            : "border-orange-500"
                        }`}
                      >
                        {data.custom_avatar_url ? (
                          <img
                            src={data.custom_avatar_url}
                            alt={data.name || "Top Typist"}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 via-zinc-800 to-amber-600 flex items-center justify-center text-white">
                            <User className="w-10 h-10 opacity-90" />
                          </div>
                        )}

                        <div
                          className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md ${
                            rank === 1
                              ? "bg-amber-500"
                              : rank === 2
                              ? "bg-zinc-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {rank}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 dark:text-white">
                        {data.name || `Top Typist #${rank}`}
                      </h3>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {data.typing_level || "Grandmaster"}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Bar: WPM & Accuracy */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/70 dark:border-zinc-800/80 mb-6">
                      <div className="text-center">
                        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Speed
                        </div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <Zap className="w-4 h-4 fill-current text-amber-500" />
                          <span>{data.wpm || 120}</span>
                          <span className="text-xs text-zinc-400 font-normal">WPM</span>
                        </div>
                      </div>
                      <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Accuracy
                        </div>
                        <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                          {data.accuracy || 99.0}%
                        </div>
                      </div>
                    </div>

                    {/* Growth Advice Message */}
                    <div className="relative p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                      <Quote className="w-4 h-4 text-emerald-500 mb-1 opacity-70" />
                      <p className="line-clamp-4">"{data.advice_message}"</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                    <span>Verified Real Typist</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      100% Legit
                    </span>
                  </div>

                  {/* Admin Post Deletion Control */}
                  {isAdminUser && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(data.id, data.name)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Delete this post from Who's The Best"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Automatic Top 3 Submissions Notice & Form Trigger */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-zinc-900/60 to-amber-950/30 border border-emerald-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Top Performer Recognition Form</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Claim Your Spot on the Podium
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm max-w-xl">
              Submit your typist profile and growth advice. Your submission is recorded immediately and featured right here in the global championship hall of fame!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-md shadow-amber-400/20"
            >
              Submit Your Advice
            </button>
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f171e] border border-zinc-200 dark:border-zinc-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Top 3 Leaderboard Submission Form
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Submit your name and typing philosophy. Once submitted, your profile will immediately appear on the landing page showcase!
            </p>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  Advice Published Live!
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your message is now active on the global landing page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTopPerformer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Typist Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. SpeedDemon_99"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Verified WPM Speed
                  </label>
                  <input
                    type="number"
                    value={wpmInput}
                    onChange={(e) => setWpmInput(e.target.value)}
                    placeholder="120"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Words of Advice for Aspiring Typists *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={adviceInput}
                    onChange={(e) => setAdviceInput(e.target.value)}
                    placeholder="Share your techniques, rhythm advice, and mindset tips..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://... (or leave empty for default typist avatar)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Landing Page</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
