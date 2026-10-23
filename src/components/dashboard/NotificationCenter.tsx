"use client";

import React, { useState } from "react";
import {
  Bell,
  Crown,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface DashboardNotification {
  id: string;
  sender: string;
  title: string;
  message: string;
  type: "admin" | "achievement" | "system";
  isRead: boolean;
  date: string;
}

interface NotificationCenterProps {
  notifications: DashboardNotification[];
  onMarkRead: (id: string) => void;
  onOpenTop3Form: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onOpenTop3Form,
}: NotificationCenterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <span>Notification & Message Center</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Incoming communications and performance reviews from the admin.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-2xl border transition-all ${
              notif.isRead
                ? "bg-white dark:bg-[#0c141a] border-zinc-200 dark:border-zinc-800 opacity-80"
                : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.type === "achievement"
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {notif.type === "achievement" ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="block text-[10px] text-zinc-400 mt-1">
                    From {notif.sender} • {notif.date}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {notif.type === "achievement" && (
                  <button
                    type="button"
                    onClick={onOpenTop3Form}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>Fill Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notif.id)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
