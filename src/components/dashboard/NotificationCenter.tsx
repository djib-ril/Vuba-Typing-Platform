"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Crown,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Search,
  Send,
  User,
  AlertCircle,
  Mail,
  Trash2,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

export interface DashboardNotification {
  id: string;
  sender: string;
  title: string;
  message: string;
  type: "admin" | "achievement" | "system" | "chat";
  isRead: boolean;
  date: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
}

interface NotificationCenterProps {
  notifications: DashboardNotification[];
  onMarkRead: (id: string) => void;
  onOpenTop3Form: () => void;
  currentUserId?: string;
  currentUserName?: string;
  onRefreshNotifications?: () => void;
  onDeleteNotification?: (id: string) => Promise<void> | void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onOpenTop3Form,
  currentUserId,
  currentUserName = "Typist",
  onRefreshNotifications,
  onDeleteNotification,
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox");

  // User search & direct messaging state
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<UserSearchResult | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Load all registered users for direct messaging (names only, no private WPMs)
  useEffect(() => {
    async function loadRegisteredUsers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped: UserSearchResult[] = data
            .filter((p: any) => !currentUserId || p.id !== currentUserId)
            .map((p: any) => ({
              id: p.id,
              name: p.full_name || p.email?.split("@")[0] || "Typist",
              email: p.email,
              avatar_url: p.avatar_url,
            }));
          setAllUsers(mapped);
        }
      } catch {
        // Handled gracefully
      }
    }

    loadRegisteredUsers();
  }, [currentUserId]);

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !messageText.trim()) return;

    setIsSending(true);
    setSendError(null);

    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: selectedRecipient.id,
        sender_id: currentUserId || null,
        title: `Direct Message from ${currentUserName}`,
        message: messageText.trim(),
        is_read: false,
      });

      if (error) throw error;

      setSendSuccess(true);
      setMessageText("");
      setSelectedRecipient(null);
      setTimeout(() => {
        setSendSuccess(false);
        setActiveTab("inbox");
      }, 1800);
      onRefreshNotifications?.();
    } catch (err: any) {
      setSendError(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <span>Messages & Direct Chat</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Send direct messages to any user on the platform and review system updates.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "inbox"
                ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "compose"
                ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message</span>
          </button>
        </div>
      </div>

      {/* Tab: Compose / Direct Message to Any User */}
      {activeTab === "compose" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Direct Message Any Typist</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Search by name and start a direct conversation. Your recipient will receive the message in your name.
            </p>
          </div>

          {sendSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn font-bold">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Message dispatched successfully! Redirecting to inbox...</span>
            </div>
          )}

          {sendError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-fadeIn font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            {/* Step 1: Select User */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Select Recipient (Search Users)
              </label>

              {selectedRecipient ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {selectedRecipient.avatar_url ? (
                        <img
                          src={selectedRecipient.avatar_url}
                          alt={selectedRecipient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedRecipient.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-zinc-900 dark:text-white">
                        {selectedRecipient.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">Recipient Selected</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecipient(null)}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search typists by name..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Filtered users list */}
                  <div className="max-h-48 overflow-y-auto space-y-1 p-1 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
                    {filteredUsers.length === 0 ? (
                      <div className="py-6 text-center text-xs text-zinc-400">
                        {searchQuery ? "No typists match that name." : "No other users registered yet."}
                      </div>
                    ) : (
                      filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedRecipient(u);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center overflow-hidden">
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                u.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="font-bold text-xs text-zinc-900 dark:text-white">
                              {u.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Select →
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Message Content */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your Message
              </label>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message, typing challenge, or friendly race invitation..."
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !selectedRecipient || !messageText.trim()}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? "Sending..." : "Send Direct Message"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Inbox Messages */}
      {activeTab === "inbox" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0c141a] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <Mail className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                No Messages Yet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Your inbox is currently clear. You can click "Send Message" above to initiate a chat with any typist on the platform!
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isFormFillingMessage =
                notif.type === "achievement" ||
                notif.title?.toLowerCase().includes("top 3") ||
                notif.title?.toLowerCase().includes("form") ||
                notif.message?.toLowerCase().includes("fill form") ||
                notif.message?.toLowerCase().includes("who's the best");

              return (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-white dark:bg-[#0c141a] border-zinc-200 dark:border-zinc-800 opacity-85"
                      : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isFormFillingMessage
                            ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                            : notif.type === "admin"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                            : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        }`}
                      >
                        {isFormFillingMessage ? (
                          <Crown className="w-5 h-5" />
                        ) : notif.type === "admin" ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <MessageSquare className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                              New
                            </span>
                          )}
                          {isFormFillingMessage && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                              Official
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {notif.message}
                        </p>
                        <span className="block text-[10px] text-zinc-400 font-medium mt-1">
                          From <strong className="text-zinc-700 dark:text-zinc-300">{notif.sender}</strong> • {notif.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        {isFormFillingMessage ? (
                          <button
                            type="button"
                            onClick={onOpenTop3Form}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <span>Fill Form</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          onDeleteNotification && (
                            <button
                              type="button"
                              onClick={() => onDeleteNotification(notif.id)}
                              className="p-1.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete this message"
                              aria-label="Delete message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>

                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
