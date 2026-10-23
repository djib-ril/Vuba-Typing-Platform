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
// left untouched.
export async function ensureProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
}) {
  const email = user.email || "";
  const meta = user.user_metadata || {};
  const fullName =
    meta.full_name || meta.name || email.split("@")[0] || "Typist";
  const avatar = meta.avatar_url || meta.picture || null;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: avatar,
      role: email === ADMIN_EMAIL ? "admin" : "user",
      typing_level: "Beginner",
    },
    { onConflict: "id" }
  );

  if (!error && email === ADMIN_EMAIL) {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
  }

  if (error) {
    console.warn("ensureProfile:", error.message);
  }
  return error;
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
