"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Send,
  UserCheck,
  Zap,
  Mail,
  CheckCircle,
  TrendingUp,
  Trash2,
  AlertTriangle,
  Trophy,
  Crown,
  Medal,
  Quote,
} from "lucide-react";
import { supabase, ADMIN_EMAIL, type TopPerformer } from "@/src/lib/supabase";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin";
  wpm: number;
  accuracy: number;
  testsCompleted: number;
}

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: "admin-root",
    name: "Djibril Mugisha",
    email: ADMIN_EMAIL,
    role: "admin",
    wpm: 162.5,
    accuracy: 99.8,
    testsCompleted: 340,
  },
];

interface AdminPanelProps {
  onSendMessage: (targetUser: string, message: string) => void;
  onRoleChange?: (userId: string, newRole: "user" | "moderator" | "admin") => void;
}

export default function AdminPanel({ onSendMessage, onRoleChange }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>(DEFAULT_ADMIN_USERS);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(ADMIN_EMAIL);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Who's The Best Showcase Moderation State
  const [showcasePosts, setShowcasePosts] = useState<TopPerformer[]>([]);
  const [isLoadingShowcase, setIsLoadingShowcase] = useState(false);
  const [showcaseStatus, setShowcaseStatus] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Aggregate real typing performance per user
      const { data: results } = await supabase
        .from("test_results")
        .select("user_id, wpm, accuracy");

      const statsMap: Record<
        string,
        { bestWpm: number; accSum: number; accCount: number; tests: number }
      > = {};
      (results || []).forEach((r: any) => {
        if (!statsMap[r.user_id]) {
          statsMap[r.user_id] = { bestWpm: 0, accSum: 0, accCount: 0, tests: 0 };
        }
        const s = statsMap[r.user_id];
        const wpm = Number(r.wpm) || 0;
        if (wpm > s.bestWpm) s.bestWpm = wpm;
        s.accSum += Number(r.accuracy) || 0;
        s.accCount += 1;
        s.tests += 1;
      });

      const mapped: AdminUser[] = (data || []).map((p: any) => {
        const s = statsMap[p.id];
        return {
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "User",
          email: p.email || "",
          role: p.role || "user",
          wpm: s ? Math.round(s.bestWpm * 10) / 10 : 0,
          accuracy: s && s.accCount ? Math.round(s.accSum / s.accCount) : 0,
          testsCompleted: s ? s.tests : 0,
        };
      });

      // Master admin always visible, even before their profile is backfilled
      if (!mapped.some((u) => u.email === ADMIN_EMAIL)) {
        mapped.unshift(DEFAULT_ADMIN_USERS[0]);
      }
      setUsers(mapped);
    } catch {
      setUsers(DEFAULT_ADMIN_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShowcasePosts = async () => {
    setIsLoadingShowcase(true);
    try {
      const { data, error } = await supabase
        .from("top_performers")
        .select("*")
        .order("rank_position", { ascending: true });

      if (!error && data) {
        setShowcasePosts(data);
      } else {
        setShowcasePosts([]);
      }
    } catch {
      setShowcasePosts([]);
    } finally {
      setIsLoadingShowcase(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadShowcasePosts();

    // Subscribe to showcase changes
    const channel = supabase
      .channel("admin-showcase-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "top_performers" },
        () => loadShowcasePosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteShowcasePost = async (postId?: string, name?: string) => {
    if (!postId) return;

    const confirmed = window.confirm(
      `Admin Action: Are you sure you want to permanently delete the showcase post by "${name || "this user"}"? This will immediately remove it from "Who's The Best".`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("top_performers")
        .delete()
        .eq("id", postId);

      if (error) {
        setSendError(`Failed to delete showcase post: ${error.message}`);
        setTimeout(() => setSendError(null), 4000);
        return;
      }

      setShowcasePosts((prev) => prev.filter((p) => p.id !== postId));
      setShowcaseStatus(`Showcase post by "${name || "user"}" has been permanently removed.`);
      setTimeout(() => setShowcaseStatus(null), 4000);
    } catch (err: any) {
      setSendError(`Error deleting showcase post: ${err.message}`);
      setTimeout(() => setSendError(null), 4000);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "moderator" | "admin"
  ) => {
    // 1. Optimistic local update
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      // 2. Persist update directly in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        setSendError(`Failed to update role in Supabase: ${error.message}`);
        setTimeout(() => setSendError(null), 4000);
        return;
      }

      // 3. Immediately trigger parent dashboard permissions change
      onRoleChange?.(userId, newRole);

      // 4. Broadcast instant role change to all live tabs via Supabase Realtime
      const channel = supabase.channel("system:roles");
      await channel.send({
        type: "broadcast",
        event: "role_updated",
        payload: { userId, newRole },
      });

      setDeleteStatus(`Role updated to "${newRole.toUpperCase()}" immediately.`);
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch (err: any) {
      setSendError(`Role change failed: ${err.message}`);
      setTimeout(() => setSendError(null), 4000);
    }
  };

  const handleDeleteUser = async (userId: string, email: string, name: string) => {
    if (email === ADMIN_EMAIL) {
      alert("Cannot delete the master administrator account.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete user "${name}" (${email})? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      // 1. Delete from Supabase profiles and test_results
      await supabase.from("test_results").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);
    } catch {
      // Handle gracefully
    }

    // 2. Remove from local list
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleteStatus(`User "${name}" (${email}) has been permanently deleted.`);
    setTimeout(() => setDeleteStatus(null), 3500);
  };

  const handleDispatchNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg) return;

    const target = users.find((u) => u.email === selectedUserEmail);
    if (!target) {
      setSendError("No registered account matches that email.");
      setTimeout(() => setSendError(null), 4000);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();

    const { error } = await supabase.from("notifications").insert({
      user_id: target.id,
      sender_id: authData?.user?.id || null,
      title: "Direct Admin Directive",
      message: notificationMsg,
      is_read: false,
    });

    if (error) {
      setSendError(`Delivery failed: ${error.message}`);
      setTimeout(() => setSendError(null), 4500);
      return;
    }

    onSendMessage(selectedUserEmail, notificationMsg);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setNotificationMsg("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-[#121c24] border border-red-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Admin Command Center</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Account Management & Direct Messaging
          </h2>
          <p className="text-xs text-zinc-300">
            Authorized administrator: <code>{ADMIN_EMAIL}</code>
          </p>
        </div>
      </div>

      {deleteStatus && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          <span>{deleteStatus}</span>
        </div>
      )}

      {showcaseStatus && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{showcaseStatus}</span>
        </div>
      )}

      {sendError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account Tracker Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Registered Accounts ({users.length})</span>
            </h3>
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Best WPM</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Tests</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {isLoading && users === DEFAULT_ADMIN_USERS ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-3 text-center text-zinc-400">
                      Loading registered accounts from Supabase...
                    </td>
                  </tr>
                ) : (
                users.map((u) => {
                  const isRootAdmin = u.email === ADMIN_EMAIL;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isRootAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-500 text-white">
                              ROOT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{u.email}</div>
                      </td>

                      <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">
                        {u.wpm || "—"}
                      </td>

                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {u.accuracy ? `${u.accuracy}%` : "—"}
                      </td>

                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {u.testsCompleted || "—"}
                      </td>

                      <td className="py-2.5 px-3">
                        {isRootAdmin ? (
                          <span className="text-[10px] font-extrabold text-red-500 uppercase">
                            Admin (Owner)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                e.target.value as "user" | "moderator" | "admin"
                              )
                            }
                            className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUserEmail(u.email)}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Message
                          </button>

                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.email, u.name)}
                              className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Send Targeted Notification Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>Send Direct Performance Alert</span>
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Admin notifications appear immediately in the recipient's notification tray.
          </p>

          <form onSubmit={handleDispatchNotification} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Performance Feedback Message
              </label>
              <textarea
                rows={4}
                required
                value={notificationMsg}
                onChange={(e) => setNotificationMsg(e.target.value)}
                placeholder="e.g. Great improvement on quotes! Aim to minimize pinky error rates to reach Pro rank..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white resize-none"
              />
            </div>

            {sentSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Notification dispatched successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Notification</span>
            </button>
          </form>
        </div>
      </div>

      {/* Who's The Best Showcase Moderation Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <span>"Who's The Best" Showcase Moderation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                  {showcasePosts.length} Live {showcasePosts.length === 1 ? "Post" : "Posts"}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Review and moderate user posts featured on the global landing page hall of fame. You can permanently delete any post.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadShowcasePosts}
            disabled={isLoadingShowcase}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1 self-start sm:self-auto"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isLoadingShowcase ? "Loading..." : "Refresh Posts"}</span>
          </button>
        </div>

        {showcasePosts.length === 0 ? (
          <div className="py-10 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
            <Crown className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              No Showcase Posts Found
            </div>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              When players submit their advice and profile from the landing page or dashboard, their posts will appear here for admin moderation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {showcasePosts.map((post) => {
              const rank = post.rank_position || 1;
              return (
                <div
                  key={post.id}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-3"
                >
                  <div>
                    {/* Header: Rank + Level */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          rank === 1
                            ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/50"
                            : rank === 2
                            ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border-zinc-400"
                            : "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50"
                        }`}
                      >
                        <Medal className="w-3 h-3" />
                        <span>Slot #{rank}</span>
                      </span>

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {post.typing_level || "Pro"}
                      </span>
                    </div>

                    {/* Performer User Identity */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                        {post.custom_avatar_url ? (
                          <img
                            src={post.custom_avatar_url}
                            alt={post.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-black text-xs text-zinc-500">
                            {post.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                          {post.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                          <span className="font-extrabold text-emerald-500">{post.wpm} WPM</span>
                          <span>•</span>
                          <span>{post.accuracy}% Acc</span>
                        </div>
                      </div>
                    </div>

                    {/* Growth Advice Text Preview */}
                    <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 italic relative">
                      <Quote className="w-3.5 h-3.5 text-amber-500/80 mb-1 inline mr-1" />
                      <span className="line-clamp-3">"{post.advice_message}"</span>
                    </div>
                  </div>

                  {/* Admin Deletion Action */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ID: {post.id?.slice(0, 8)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteShowcasePost(post.id, post.name)}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      title="Permanently delete this user's post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
