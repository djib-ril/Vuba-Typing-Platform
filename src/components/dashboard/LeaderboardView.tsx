"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Zap, Flame, Filter, Search, User } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string | null;
  level: "Grandmaster" | "Pro" | "Advanced" | "Intermediate" | "Beginner";
  wpm: number;
  accuracy: number;
  racesWon: number;
}

const SPEED_LEVELS = [
  { id: "All", label: "All Levels" },
  { id: "Grandmaster", label: "Grandmaster (140+)" },
  { id: "Pro", label: "Pro (110-139)" },
  { id: "Advanced", label: "Advanced (80-109)" },
  { id: "Intermediate", label: "Intermediate (50-79)" },
  { id: "Beginner", label: "Beginner (<50)" },
];

export default function LeaderboardView() {
  const [activeLevel, setActiveLevel] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [{ data: results, error }, { data: profiles }] = await Promise.all([
        supabase
          .from("test_results")
          .select("id, user_id, wpm, accuracy")
          .order("wpm", { ascending: false })
          .limit(200),
        supabase.from("profiles").select("id, full_name, email, avatar_url"),
      ]);

      if (error) throw error;

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = p;
      });

      // Results arrive sorted by wpm desc, so the first hit per user is best
      const bestByUser: Record<string, any> = {};
      (results || []).forEach((r: any) => {
        if (!bestByUser[r.user_id]) bestByUser[r.user_id] = r;
      });

      const levelFor = (wpm: number): LeaderboardEntry["level"] =>
        wpm >= 140
          ? "Grandmaster"
          : wpm >= 110
          ? "Pro"
          : wpm >= 80
          ? "Advanced"
          : wpm >= 50
          ? "Intermediate"
          : "Beginner";

      const entries: LeaderboardEntry[] = Object.values(bestByUser)
        .map((r: any) => {
          const profile = profileMap[r.user_id] || {};
          return {
            id: r.id,
            rank: 0,
            name: profile.full_name || profile.email?.split("@")[0] || "Typist",
            avatar: profile.avatar_url || null,
            level: levelFor(Number(r.wpm) || 0),
            wpm: Number(r.wpm) || 0,
            accuracy: Math.round(Number(r.accuracy) || 0),
            racesWon: 0,
          };
        })
        .sort((a, b) => b.wpm - a.wpm);

      entries.forEach((e, i) => {
        e.rank = i + 1;
      });

      setUsers(entries);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesLevel = activeLevel === "All" || user.level === activeLevel;
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Global Leaderboard</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real rankings recorded from tests taken on The Typing Floor.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search typists..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Clickable side-by-side level tabs as required in UI_UX_design.md */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {SPEED_LEVELS.map((lvl) => {
          const isActive = activeLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setActiveLevel(lvl.id)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>

      {/* Empty State or Populated Table */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0c141a] border-2 border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-500 border border-amber-400/20 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
              No Leaderboard Entries Yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No users have completed tests for this level tier yet. Go to The Typing Floor, finish your countdown seconds, and record your score!
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 uppercase tracking-wider text-[11px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Typist</th>
                  <th className="py-3.5 px-4">Level Tier</th>
                  <th className="py-3.5 px-4">Speed</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 font-black">
                      {user.rank === 1 ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Crown className="w-4 h-4 fill-current" /> #1
                        </span>
                      ) : user.rank === 2 ? (
                        <span className="text-zinc-400 font-bold">#2</span>
                      ) : user.rank === 3 ? (
                        <span className="text-orange-400 font-bold">#3</span>
                      ) : (
                        <span className="text-zinc-400 font-medium">
                          #{user.rank}
                        </span>
                      )}
                    </td>

                    {/* Typist Profile Picture & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-zinc-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Verified Typist
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Speed Level Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          user.level === "Grandmaster"
                            ? "bg-amber-400/10 text-amber-500 border-amber-400/30"
                            : user.level === "Pro"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : user.level === "Advanced"
                            ? "bg-teal-500/10 text-teal-500 border-teal-500/30"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        {user.level}
                      </span>
                    </td>

                    {/* WPM */}
                    <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>{user.wpm}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          WPM
                        </span>
                      </div>
                    </td>

                    {/* Accuracy */}
                    <td className="py-3 px-4 font-bold text-zinc-700 dark:text-zinc-300">
                      {user.accuracy}%
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      Active
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
