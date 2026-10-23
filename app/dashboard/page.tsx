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
  CheckCircle,
  BookOpen,
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
import AiCoachWidget from "@/src/components/landing/AiCoachWidget";
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
    "floor" | "lessons" | "stats" | "racing" | "leaderboard" | "notifications" | "admin"
  >("floor");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [showTop3Modal, setShowTop3Modal] = useState(false);

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

  // Notifications: server-side messages from the admin, loaded per user
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
      .limit(20);

    if (data) {
      const serverNotes: DashboardNotification[] = data.map((n: any) => ({
        id: n.id,
        sender: "Admin (Djibril Mugisha)",
        title: n.title || "Direct Admin Directive",
        message: n.message,
        type: "admin" as const,
        isRead: !!n.is_read,
        date: new Date(n.created_at).toLocaleDateString(),
      }));
      setNotifications((prev) => {
        const localOnly = prev.filter(
          (p) => !serverNotes.some((s) => s.id === p.id)
        );
        return [...serverNotes, ...localOnly];
      });
    }
  }, []);

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

  const handleAdminSendMessage = (targetUser: string, message: string) => {
    const newNotif: DashboardNotification = {
      id: `admin-${Date.now()}`,
      sender: "Admin (Djibril Mugisha)",
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

    // Publish to Supabase (landing page reads it from there)
    try {
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

        {/* Sidebar Footer: AI Coach & Theme Switch */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {/* AI Coach Button */}
          <button
            type="button"
            onClick={() => setIsCoachOpen(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Typing Coach</span>
          </button>

          {/* Theme Toggle */}
          <div className="pt-1">
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

          {activeTab === "notifications" && (
            <NotificationCenter
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onOpenTop3Form={() => setShowTop3Modal(true)}
            />
          )}

          {activeTab === "admin" && isAdmin && (
            <AdminPanel
              onSendMessage={handleAdminSendMessage}
              onRoleChange={handleRoleChange}
            />
          )}
        </main>
      </div>

      {/* Embedded AI Coach Modal */}
      <AiCoachWidget
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        onToggle={() => setIsCoachOpen((prev) => !prev)}
        stats={{ highestWpm, avgWpm, avgAccuracy, testsCount }}
      />

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
    </div>
  );
}
