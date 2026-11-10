"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Keyboard,
  BarChart3,
  Users,
  Trophy,
  Bell,
  ShieldCheck,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Zap,
  Menu,
  X,
  User as UserIcon,
  Crown,
  Maximize2,
  Minimize2,
  CheckCircle,
  BookOpen,
  Bot,
  Mail,
  AlertCircle,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  supabase,
  ADMIN_EMAIL,
  ensureProfile,
  Profile,
  TopPerformer,
} from "@/src/lib/supabase";
import { useTheme } from "@/src/context/ThemeContext";
import TypingFloor from "@/src/components/dashboard/TypingFloor";
import TypingLessons from "@/src/components/dashboard/TypingLessons";
import StatsOverview from "@/src/components/dashboard/StatsOverview";
import RaceArena from "@/src/components/dashboard/RaceArena";
import LeaderboardView from "@/src/components/dashboard/LeaderboardView";
import NotificationCenter, {
  DashboardNotification,
} from "@/src/components/dashboard/NotificationCenter";
import AdminPanel from "@/src/components/dashboard/AdminPanel";
import MusicPlayer from "@/src/components/dashboard/MusicPlayer";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
//Changed by Djibril
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
//Changes end here
  const [activeTab, setActiveTab] = useState<
    | "floor"
    | "lessons"
    | "stats"
    | "racing"
    | "leaderboard"
    | "notifications"
    | "admin"
    | "coach"
  >("floor");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showTop3Modal, setShowTop3Modal] = useState(false);

  // Unread messages center popup on initial sign in
  const [showUnreadPopup, setShowUnreadPopup] = useState(false);
  const [hasShownUnreadPopup, setHasShownUnreadPopup] = useState(false);

  // Top 3 qualification state
  const [top3UnqualifiedNotice, setTop3UnqualifiedNotice] = useState<{
    userSpeed: number;
    top3: { name: string; wpm: number; rank: number }[];
  } | null>(null);

  // User state
  const [userId, setUserId] = useState<string>("guest");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("Typist");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"user" | "moderator" | "admin">("user");
  const [userLevel, setUserLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "Pro" | "Grandmaster"
  >("Beginner");

  // Dynamic stats
  const [highestWpm, setHighestWpm] = useState(0);
  const [avgWpm, setAvgWpm] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(100);
  const [testsCount, setTestsCount] = useState(0);

  // Top 3 submission in dashboard state
  const [top3Advice, setTop3Advice] = useState("");
  const [top3AvatarUrl, setTop3AvatarUrl] = useState("");
  const [top3SubmittedSuccess, setTop3SubmittedSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Dedicated AI Typing Coach State
  const [coachInput, setCoachInput] = useState("");
  const [coachIsTyping, setCoachIsTyping] = useState(false);
  const [coachIsMaximized, setCoachIsMaximized] = useState(false);
  const [coachMessages, setCoachMessages] = useState<
    Array<{ id: string; sender: "ai" | "user"; text: string; timestamp: string }>
  >([
    {
      id: "msg-coach-init",
      sender: "ai",
      text: "👋 Hello! I am your VubaTrust AI Master Typing Coach. Ask me anything about breaking speed plateaus, biomechanical finger reach, keyboard switch selection, or race strategies. How can I assist your typing journey today?",
      timestamp: "Just now",
    },
  ]);
  const coachMessagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      coachMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [coachMessages, coachIsTyping]);

  const handleSendCoachMessage = async (queryText?: string) => {
    const text = queryText || coachInput.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text,
      timestamp: timeStr,
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setCoachInput("");
    setCoachIsTyping(true);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          stats: {
            highestWpm,
            avgWpm,
            avgAccuracy,
            testsCount,
          },
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        "Focus on floating your wrists and locking in 98% accuracy!";

      setCoachMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: reply,
          timestamp: new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setCoachMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: "Anchor your index fingers on the F and J nubs, keep wrists floating, and aim for rhythmic flow!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setCoachIsTyping(false);
    }
  };

  // Notifications: server-side messages loaded from Supabase per user
  const [notifications, setNotifications] = useState<DashboardNotification[]>([
    {
      id: "n-1",
      sender: "Admin (Djibril Mugisha)",
      title: "Welcome to VubaTrustTyping!",
      message:
        "Welcome to your personal dashboard. Practice on The Floor with our auto-generated long texts to unlock higher speed tiers.",
      type: "admin",
      isRead: false,
      date: "Today",
    },
    {
      id: "n-2",
      sender: "System",
      title: "Top 3 Performer Recognition",
      message:
        "Rank among the top typists to submit your personal advice and avatar for the global landing page showcase.",
      type: "achievement",
      isRead: false,
      date: "Today",
    },
  ]);

  const loadNotifications = React.useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) {
      const serverNotes: DashboardNotification[] = data.map((n: any) => {
        let senderName = "Admin";
        if (n.title && n.title.includes("from ")) {
          senderName = n.title.replace(/^.*from\s+/i, "");
        } else if (n.title?.includes("Admin")) {
          senderName = "Admin (Djibril Mugisha)";
        }

        const isAchievement =
          n.type === "achievement" ||
          n.title?.toLowerCase().includes("top 3") ||
          n.message?.toLowerCase().includes("top 3") ||
          n.message?.toLowerCase().includes("fill form");

        return {
          id: n.id,
          sender: senderName,
          title: n.title || "Message",
          message: n.message,
          type: isAchievement ? ("achievement" as const) : ("admin" as const),
          isRead: !!n.is_read,
          date: n.created_at
            ? new Date(n.created_at).toLocaleDateString()
            : "Recent",
        };
      });

      setNotifications((prev) => {
        const localOnly = prev.filter(
          (p) => !serverNotes.some((s) => s.id === p.id)
        );
        return [...serverNotes, ...localOnly];
      });

      // Show unread messages popup on immediate sign-in
      setHasShownUnreadPopup((alreadyShown) => {
        if (!alreadyShown) {
          const unread = serverNotes.filter((n) => !n.isRead);
          if (unread.length > 0) {
            setShowUnreadPopup(true);
            return true;
          }
        }
        return alreadyShown;
      });
    }
  }, []);

  const handleDeleteNotification = async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      console.warn("handleDeleteNotification error:", err?.message);
    }
  };

  // Load auth session and historical user stats
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        setUserId(sessionUser.id);
        const email = sessionUser.email || "";
        setUserEmail(email);

        const metadata = sessionUser.user_metadata || {};
        const name =
          metadata.full_name ||
          metadata.name ||
          email.split("@")[0] ||
          "Typist";
        setUserName(name);

        const avatar = metadata.avatar_url || metadata.picture || null;
        setUserAvatar(avatar);

        // Check Admin privilege
        if (email === ADMIN_EMAIL) {
          setUserRole("admin");
        }

        // Safety net: guarantee a profile row exists for this account
        await ensureProfile(sessionUser);

        // 1. Fetch user profile from Supabase
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionUser.id)
            .single();

          if (prof) {
            if (prof.role) setUserRole(prof.role);
            if (prof.typing_level) setUserLevel(prof.typing_level);
          }
        } catch {
          // Handled
        }

        // 2. Fetch real test history from Supabase
        try {
          const { data: results } = await supabase
            .from("test_results")
            .select("*")
            .eq("user_id", sessionUser.id);

          if (results && results.length > 0) {
            setTestsCount(results.length);
            const best = Math.max(
              ...results.map((r: any) => Number(r.wpm) || 0)
            );
            const avg = Math.round(
              results.reduce(
                (acc: number, r: any) => acc + (Number(r.wpm) || 0),
                0
              ) / results.length
            );
            const accAvg = Math.round(
              results.reduce(
                (acc: number, r: any) => acc + (Number(r.accuracy) || 0),
                0
              ) / results.length
            );

            setHighestWpm(best);
            setAvgWpm(avg);
            setAvgAccuracy(accAvg);

            // Compute speed tier
            if (best >= 140) setUserLevel("Grandmaster");
            else if (best >= 110) setUserLevel("Pro");
            else if (best >= 80) setUserLevel("Advanced");
            else if (best >= 50) setUserLevel("Intermediate");
            else setUserLevel("Beginner");
          }
        } catch {
          // Handled
        }

        // 3. Load real notifications sent by the admin
        loadNotifications(sessionUser.id);

        // 4. Live Realtime listeners: chain .on('postgres_changes', ...) BEFORE calling .subscribe()
        const profileSyncChannel = supabase.channel(`profile-sync:${sessionUser.id}`);
        profileSyncChannel
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${sessionUser.id}`,
            },
            (payload: any) => {
              if (payload.new && payload.new.role) {
                setUserRole(payload.new.role);
                if (payload.new.role !== "admin") {
                  setActiveTab((prev) => (prev === "admin" ? "floor" : prev));
                }
              }
              if (payload.new && payload.new.typing_level) {
                setUserLevel(payload.new.typing_level);
              }
            }
          )
          .subscribe();

        const roleBroadcastChannel = supabase.channel("system:roles");
        roleBroadcastChannel
          .on("broadcast", { event: "role_updated" }, ({ payload }) => {
            if (payload?.userId === sessionUser.id && payload?.newRole) {
              setUserRole(payload.newRole);
              if (payload.newRole !== "admin") {
                setActiveTab((prev) => (prev === "admin" ? "floor" : prev));
              }
            }
          })
          .subscribe();
      }
    }

    loadUser();
  }, [router, loadNotifications]);

  // Poll for new admin notifications while logged in
  useEffect(() => {
    if (userId === "guest") return;
    const interval = setInterval(() => loadNotifications(userId), 20000);
    return () => clearInterval(interval);
  }, [userId, loadNotifications]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleTestComplete = (wpm: number, accuracy: number) => {
    const newTestsCount = testsCount + 1;
    const newHighest = Math.max(highestWpm, wpm);
    const newAvg = avgWpm === 0 ? wpm : Math.round((avgWpm * testsCount + wpm) / newTestsCount);
    const newAcc =
      avgAccuracy === 100
        ? accuracy
        : Math.round((avgAccuracy * testsCount + accuracy) / newTestsCount);

    let nextTier = userLevel;
    if (newHighest >= 140) nextTier = "Grandmaster";
    else if (newHighest >= 110) nextTier = "Pro";
    else if (newHighest >= 80) nextTier = "Advanced";
    else if (newHighest >= 50) nextTier = "Intermediate";

    setTestsCount(newTestsCount);
    setHighestWpm(newHighest);
    setAvgWpm(newAvg);
    setAvgAccuracy(newAcc);
    setUserLevel(nextTier);

    // Persist level to the Supabase profile
    if (userId && userId !== "guest") {
      supabase
        .from("profiles")
        .update({ typing_level: nextTier })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) console.warn("Level sync failed:", error.message);
        });

      // Automatically sync their WPM in "Who's The Best" (top_performers) so it always matches their highest WPM!
      supabase
        .from("top_performers")
        .update({
          wpm: newHighest,
          accuracy: newAcc,
          typing_level: nextTier,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.warn("top_performers sync error:", error.message);
        });
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // Persist read state for server-side notifications (uuid ids)
    if (id.length > 20) {
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .then(() => {});
    }
  };

  const handleMarkAllRead = async () => {
    if (userId && userId !== "guest") {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setShowUnreadPopup(false);
  };

  const handleAdminSendMessage = (targetUser: string, message: string) => {
    const newNotif: DashboardNotification = {
      id: `admin-${Date.now()}`,
      sender: `Admin (${userName})`,
      title: "Direct Admin Directive",
      message: message,
      type: "admin",
      isRead: false,
      date: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRoleChange = (
    targetUserId: string,
    newRole: "user" | "moderator" | "admin"
  ) => {
    if (targetUserId === userId) {
      setUserRole(newRole);
      if (newRole !== "admin") {
        setActiveTab((prev) => (prev === "admin" ? "floor" : prev));
      }
    }
  };

  const handleTop3SubmitFromDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!top3Advice.trim()) return;

    const speed = highestWpm > 0 ? highestWpm : 120;
    const accuracyVal = avgAccuracy > 0 ? avgAccuracy : 99.2;
    setTop3UnqualifiedNotice(null);

    // 1. Enforce Top 3 Qualification Rule: Check against current podium performers
    try {
      const { data: currentTop } = await supabase
        .from("top_performers")
        .select("*")
        .order("wpm", { ascending: false });

      const otherPerformers = (currentTop || []).filter(
        (p: any) => p.user_id !== userId
      );

      if (
        otherPerformers.length >= 3 &&
        otherPerformers.every((p: any) => (Number(p.wpm) || 0) >= speed)
      ) {
        setTop3UnqualifiedNotice({
          userSpeed: speed,
          top3: otherPerformers.slice(0, 3).map((p: any, idx: number) => ({
            name: p.name || `Top Typist #${idx + 1}`,
            wpm: Number(p.wpm) || 0,
            rank: idx + 1,
          })),
        });
        return;
      }

      // 2. Publish or update in Supabase
      if (userId && userId !== "guest") {
        const { data: existing } = await supabase
          .from("top_performers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("top_performers")
            .update({
              name: userName,
              wpm: speed,
              accuracy: accuracyVal,
              typing_level: userLevel,
              advice_message: top3Advice.trim(),
              custom_avatar_url: top3AvatarUrl.trim() || userAvatar || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("top_performers").insert({
            user_id: userId,
            name: userName,
            rank_position: 1,
            wpm: speed,
            accuracy: accuracyVal,
            typing_level: userLevel,
            advice_message: top3Advice.trim(),
            custom_avatar_url: top3AvatarUrl.trim() || userAvatar || null,
          });
          if (error) throw error;
        }

        // Trim excess to strictly 3 max
        const { data: allPerformers } = await supabase
          .from("top_performers")
          .select("*")
          .order("wpm", { ascending: false });

        if (allPerformers && allPerformers.length > 3) {
          const excessIds = allPerformers.slice(3).map((p: any) => p.id);
          if (excessIds.length > 0) {
            await supabase.from("top_performers").delete().in("id", excessIds);
          }
        }
      }
    } catch {
      setErrorBanner(
        "Could not publish your advice to the server. Please try again."
      );
      setTimeout(() => setErrorBanner(null), 4000);
      return;
    }

    setTop3SubmittedSuccess(true);
    setTimeout(() => {
      setTop3SubmittedSuccess(false);
      setShowTop3Modal(false);
      setTop3Advice("");
      setTop3UnqualifiedNotice(null);
    }, 1500);
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const isAdmin = userRole === "admin" || userEmail === ADMIN_EMAIL;
//Changed by Djibril
if (!isMounted) {
    return null;
  }
//Changes end here
  const navItems = [
    { id: "floor", label: "The Typing Floor", icon: Keyboard, badge: "Max Screen" },
    { id: "lessons", label: "Typing Lessons", icon: BookOpen, badge: "Beginner → Pro" },
    { id: "coach", label: "AI Typing Coach", icon: Sparkles, badge: "Master AI" },
    { id: "stats", label: "Analytics & Stats", icon: BarChart3 },
    { id: "racing", label: "Multiplayer Race", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    {
      id: "notifications",
      label: "Messages",
      icon: Bell,
      badgeCount: unreadNotifCount,
    },
    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin Command",
            icon: ShieldCheck,
            badge: "Admin",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#070c0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#090e13] p-5 justify-between flex-shrink-0 z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-500/25">
              <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                Vuba<span className="text-emerald-500">Trust</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest -mt-1">
                Typing Dashboard
              </span>
            </div>
          </Link>

          {/* User Profile Card with speed level displayed near profile picture */}
          <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-[#0e161c] border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-sm flex-shrink-0 bg-zinc-200 dark:bg-zinc-800">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black">
                    ★
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xs text-zinc-900 dark:text-white truncate">
                  {userName}
                </div>
                {/* Speed level name displayed near profile picture after name */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {userLevel}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">
                    {highestWpm} WPM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sign Out Button - Placed directly below the last navigation link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:text-white hover:bg-red-500/90 border border-red-500/20 hover:border-transparent transition-all cursor-pointer shadow-sm group"
              title="Sign out of your account"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] font-mono opacity-60 uppercase">Exit</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Theme Switch */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Toggle theme"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#090e13] border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-sm">VubaTrust</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="md:hidden p-4 bg-white dark:bg-[#090e13] border-b border-zinc-200 dark:border-zinc-800 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                    activeTab === item.id
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left p-2.5 text-xs font-bold text-red-500"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Body content based on activeTab */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {errorBanner && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold animate-fadeIn">
              {errorBanner}
            </div>
          )}
          {activeTab === "floor" && (
            <TypingFloor
              userId={userId}
              userName={userName}
              userAvatar={userAvatar}
              onTestComplete={handleTestComplete}
            />
          )}

          {activeTab === "lessons" && (
            <TypingLessons
              userId={userId}
              onLessonFinish={handleTestComplete}
            />
          )}

          {activeTab === "stats" && (
            <StatsOverview
              userLevel={userLevel}
              testsCount={testsCount}
              highestWpm={highestWpm}
              avgWpm={avgWpm}
              avgAccuracy={avgAccuracy}
            />
          )}

          {activeTab === "racing" && (
            <RaceArena
              userId={userId}
              userName={userName}
              userAvatar={userAvatar}
            />
          )}

          {activeTab === "leaderboard" && <LeaderboardView />}

          {activeTab === "coach" && (
            <div
              className={`space-y-6 transition-all duration-300 ${
                coachIsMaximized
                  ? "fixed inset-2 sm:inset-6 z-50 bg-white dark:bg-[#090e13] p-4 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
                  : ""
              }`}
            >
              {/* Header Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-[#121c24] border border-amber-400/30 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Vuba AI Master Coach</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Biomechanical Engine
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    Interactive Speed & Technique Master
                  </h2>
                  <p className="text-xs text-zinc-300 max-w-xl">
                    Get instantaneous feedback on breaking speed plateaus, floating wrist posture, home-row anchor points, and mechanical switch performance tailored to your metrics.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs">
                    <span className="text-zinc-400">Peak:</span>
                    <strong className="text-emerald-400">{highestWpm} WPM</strong>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-400">Acc:</span>
                    <strong className="text-amber-400">{avgAccuracy}%</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCoachIsMaximized(!coachIsMaximized)}
                    className="p-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title={coachIsMaximized ? "Exit Full Screen" : "Maximize Full Screen"}
                  >
                    {coachIsMaximized ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span>Compact</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Full Screen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main Coach Workspace: Grid of Core Topics + Active Chat */}
              <div
                className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
                  coachIsMaximized ? "flex-1 min-h-0 overflow-hidden" : ""
                }`}
              >
                {/* Core Drill Topics */}
                <div
                  className={`md:col-span-1 p-5 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col ${
                    coachIsMaximized ? "overflow-y-auto" : ""
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span>Curated Master Topics</span>
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-semibold">1-Click Ask</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {[
                      { title: "🚀 Breaking Past 80 WPM", query: "How do I break through the 80 WPM speed plateau?" },
                      { title: "🖐️ Home Row Anchor Nubs", query: "What is the optimal finger placement on the home row?" },
                      { title: "⚡ The 98% Accuracy Rule", query: "How much does a backspace error penalize my net WPM?" },
                      { title: "⌨️ Switch Types & Latency", query: "Which keyboard switches are best for typing speed?" },
                      { title: "🧘 Wrist Fatigue & Ergonomics", query: "How can I prevent wrist fatigue and tendon pain while typing?" },
                      { title: "💻 Code Syntax Touch Typing", query: "How do I learn touch typing on the number row and coding symbols?" },
                    ].map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendCoachMessage(topic.query)}
                        className="w-full text-left p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-amber-400/10 hover:border-amber-400/30 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{topic.title}</span>
                        <span className="text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Ask →
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Real-time stats box */}
                  <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                    <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-between text-[11px]">
                      <span>Biomechanical Profile</span>
                      <span className="text-emerald-500">{userLevel}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Based on {testsCount} completed typing tests.
                    </div>
                  </div>
                </div>

                {/* Direct Interactive AI Chat Room */}
                <div
                  className={`md:col-span-2 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden ${
                    coachIsMaximized ? "min-h-0" : "h-[620px]"
                  }`}
                >
                  {/* Messages Flow */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    {coachMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${
                          m.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            m.sender === "user"
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-400 text-zinc-950"
                          }`}
                        >
                          {m.sender === "user" ? (
                            <UserIcon className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>

                        <div
                          className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
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

                    {coachIsTyping && (
                      <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>AI Master Coach is formulating personalized biomechanical advice...</span>
                      </div>
                    )}
                    <div ref={coachMessagesEndRef} />
                  </div>

                  {/* Input Footer */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCoachMessage()}
                      placeholder="Ask any question about typing speed, drills, ergonomics, or switches..."
                      className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendCoachMessage()}
                      disabled={!coachInput.trim() || coachIsTyping}
                      className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold transition-all hover:scale-105 cursor-pointer flex-shrink-0"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <NotificationCenter
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onOpenTop3Form={() => setShowTop3Modal(true)}
              currentUserId={userId}
              currentUserName={userName}
              onRefreshNotifications={() => userId && loadNotifications(userId)}
              onDeleteNotification={handleDeleteNotification}
            />
          )}

          {activeTab === "admin" && isAdmin && (
            <AdminPanel
              onSendMessage={handleAdminSendMessage}
              onRoleChange={handleRoleChange}
              currentUserId={userId}
              currentUserName={userName}
              currentUserEmail={userEmail}
            />
          )}
        </main>
      </div>

      {/* Ambient YouTube Slow Music Player Dock */}
      <MusicPlayer />

      {/* Top 3 Submission Form Modal */}
      {showTop3Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f171e] border border-zinc-200 dark:border-zinc-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Top 3 Leaderboard Submission Form
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTop3Modal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Submit your typing advice. Once published, your words of wisdom will appear immediately on the global landing page!
            </p>

            {top3UnqualifiedNotice && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 text-xs space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Podium Full: Higher Speeds Required</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  There are currently <strong>three people with higher WPM</strong> than your speed (<strong>{top3UnqualifiedNotice.userSpeed} WPM</strong>) on the podium:
                </p>
                <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800">
                  {top3UnqualifiedNotice.top3.map((tp) => (
                    <div
                      key={tp.rank}
                      className="flex items-center justify-between font-bold text-zinc-900 dark:text-white"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-500 font-mono">#{tp.rank}</span>
                        <span>{tp.name}</span>
                      </span>
                      <span className="text-emerald-500 font-mono font-black">
                        {tp.wpm} WPM
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  ⚡ You must exceed these speeds to be posted on "Who's The Best". Go to The Floor, set a new personal speed record, and try again!
                </p>
              </div>
            )}

            {top3SubmittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  Published to Landing Page!
                </h4>
                <p className="text-xs text-zinc-400">
                  Your advice and profile are now live in the "Who's The Best" showcase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTop3SubmitFromDashboard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Typist Display Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userName}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Wisdom & Advice for Aspiring Typists *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={top3Advice}
                    onChange={(e) => setTop3Advice(e.target.value)}
                    placeholder="Share the techniques, rhythm cadence, and practice habits that took you to the top..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white resize-none focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={top3AvatarUrl}
                    onChange={(e) => setTop3AvatarUrl(e.target.value)}
                    placeholder="https://... (or leave blank to use your account picture)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTop3Modal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                  >
                    Publish to Landing Page
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Centered Unread Messages Pop-up on Immediate Sign-In */}
      {showUnreadPopup && notifications.filter((n) => !n.isRead).length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Unread Messages</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white font-mono">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    You received new communications while away.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUnreadPopup(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable list of unread messages */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {notifications
                .filter((n) => !n.isRead)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {notif.date}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                      From {notif.sender}
                    </div>
                  </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Mark All as Read
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("notifications");
                  setShowUnreadPopup(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Go to Messages Inbox →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
