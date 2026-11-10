import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Check your .env.local configuration."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

export const ADMIN_EMAIL = "mugishadjibril2020@gmail.com";

// Every signed-in user must have a profiles row so the admin panel and
// leaderboards can see them. Safe to call on every login: existing rows are
// left untouched (roles and typing levels are strictly preserved).
export async function ensureProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
}) {
  const email = (user.email || "").trim().toLowerCase();
  const meta = user.user_metadata || {};
  const fullName =
    meta.full_name || meta.name || email.split("@")[0] || "Typist";
  const avatar = meta.avatar_url || meta.picture || null;

  try {
    // Check if profile row already exists to avoid resetting role or custom stats
    const { data: existing, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, role, typing_level")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      const { error: insertErr } = await supabase.from("profiles").insert({
        id: user.id,
        email,
        full_name: fullName,
        avatar_url: avatar,
        role: email === ADMIN_EMAIL ? "admin" : "user",
        typing_level: "Beginner",
      });
      if (insertErr) {
        console.warn("ensureProfile insert error:", insertErr.message);
      }
      return insertErr;
    } else {
      // Existing profile: Guarantee admin email gets admin role if not already
      if (email === ADMIN_EMAIL && existing.role !== "admin") {
        await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", user.id);
      }
    }
  } catch (err: any) {
    console.warn("ensureProfile exception:", err?.message);
  }
  return null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  selected_theme: string;
  typing_level: "Beginner" | "Intermediate" | "Advanced" | "Pro" | "Grandmaster";
  role: "user" | "moderator" | "admin";
  created_at: string;
}

export interface RaceLobby {
  id: string;
  host_id: string;
  host_name?: string;
  invite_code: string;
  status: "waiting" | "countdown" | "racing" | "finished";
  target_text?: string;
  winner_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RaceParticipant {
  id?: string;
  lobby_code: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  car_name: string;
  progress: number;
  wpm: number;
  is_ready: boolean;
  is_finished: boolean;
  finish_rank?: number | null;
  updated_at?: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  test_mode: string;
  test_duration: number;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  sender_id: string | null;
  title?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TopPerformer {
  id: string;
  user_id?: string | null;
  name?: string;
  email?: string;
  wpm?: number;
  accuracy?: number;
  advice_message: string;
  custom_avatar_url: string | null;
  rank_position: 1 | 2 | 3;
  typing_level?: string;
  updated_at: string;
}
