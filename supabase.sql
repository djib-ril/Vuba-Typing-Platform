-- ============================================================================
-- VubaTrustTyping — Complete Production Database Setup & Realtime Schema
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/cnqxqiqzvteznfkcgobc
-- 2. Go to "SQL Editor" in the left navigation.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  selected_theme text DEFAULT 'dark',
  typing_level text DEFAULT 'Beginner',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS typing_level text DEFAULT 'Beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. TEST RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  wpm numeric DEFAULT 0,
  accuracy numeric DEFAULT 100,
  test_mode text DEFAULT '30s',
  test_duration integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS wpm numeric DEFAULT 0;
ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT 100;
ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS test_mode text DEFAULT '30s';
ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS test_duration integer DEFAULT 30;

-- 3. TOP PERFORMERS (WHO'S THE BEST HALL OF FAME) TABLE
CREATE TABLE IF NOT EXISTS public.top_performers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text,
  name text NOT NULL,
  rank_position integer DEFAULT 1,
  wpm numeric DEFAULT 120,
  accuracy numeric DEFAULT 99.0,
  typing_level text DEFAULT 'Pro',
  advice_message text NOT NULL,
  custom_avatar_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS wpm numeric DEFAULT 120;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT 99.0;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS typing_level text DEFAULT 'Pro';
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS advice_message text;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS custom_avatar_url text;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS rank_position integer DEFAULT 1;
ALTER TABLE public.top_performers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  sender_id text,
  title text DEFAULT 'Direct Admin Directive',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text DEFAULT 'Direct Admin Directive';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id text;

-- 5. RACE LOBBIES TABLE
CREATE TABLE IF NOT EXISTS public.race_lobbies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id text NOT NULL,
  host_name text DEFAULT 'Host',
  invite_code text NOT NULL UNIQUE,
  status text DEFAULT 'waiting', -- 'waiting', 'countdown', 'racing', 'finished'
  target_text text,
  winner_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS host_id text;
ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS host_name text DEFAULT 'Host';
ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS invite_code text;
ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting';
ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS target_text text;
ALTER TABLE public.race_lobbies ADD COLUMN IF NOT EXISTS winner_id text;

-- 6. RACE PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.race_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_code text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_avatar text,
  car_name text DEFAULT '🏎️ Cyber Roadster',
  progress integer DEFAULT 0,
  wpm integer DEFAULT 0,
  is_ready boolean DEFAULT false,
  is_finished boolean DEFAULT false,
  finish_rank integer,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_lobby_participant UNIQUE (lobby_code, user_id)
);

-- ---------------------------------------------------------------------------
-- 7. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, typing_level)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(COALESCE(new.email, 'typist'), '@', 1)
    ),
    NULLIF(new.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN new.email = 'mugishadjibril2020@gmail.com' THEN 'admin' ELSE 'user' END,
    'Beginner'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    role = CASE WHEN EXCLUDED.email = 'mugishadjibril2020@gmail.com' THEN 'admin' ELSE public.profiles.role END;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users who don't have a profile yet
INSERT INTO public.profiles (id, email, full_name, role, typing_level)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(COALESCE(u.email, 'typist'), '@', 1)
  ),
  CASE WHEN u.email = 'mugishadjibril2020@gmail.com' THEN 'admin' ELSE 'user' END,
  'Beginner'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Ensure master admin always has role = 'admin'
UPDATE public.profiles SET role = 'admin' WHERE email = 'mugishadjibril2020@gmail.com';

-- ---------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY POLICIES (PERMISSIVE ACCESS FOR APP FUNCTIONALITY)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to avoid conflicts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END;
$$;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_all" ON public.profiles FOR DELETE USING (true);

-- TEST RESULTS POLICIES
CREATE POLICY "results_select_all" ON public.test_results FOR SELECT USING (true);
CREATE POLICY "results_insert_all" ON public.test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "results_update_all" ON public.test_results FOR UPDATE USING (true);
CREATE POLICY "results_delete_all" ON public.test_results FOR DELETE USING (true);

-- TOP PERFORMERS POLICIES
CREATE POLICY "performers_select_all" ON public.top_performers FOR SELECT USING (true);
CREATE POLICY "performers_insert_all" ON public.top_performers FOR INSERT WITH CHECK (true);
CREATE POLICY "performers_update_all" ON public.top_performers FOR UPDATE USING (true);
CREATE POLICY "performers_delete_all" ON public.top_performers FOR DELETE USING (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select_all" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_all" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete_all" ON public.notifications FOR DELETE USING (true);

-- RACE LOBBIES POLICIES
CREATE POLICY "race_lobbies_select_all" ON public.race_lobbies FOR SELECT USING (true);
CREATE POLICY "race_lobbies_insert_all" ON public.race_lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "race_lobbies_update_all" ON public.race_lobbies FOR UPDATE USING (true);
CREATE POLICY "race_lobbies_delete_all" ON public.race_lobbies FOR DELETE USING (true);

-- RACE PARTICIPANTS POLICIES
CREATE POLICY "race_participants_select_all" ON public.race_participants FOR SELECT USING (true);
CREATE POLICY "race_participants_insert_all" ON public.race_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "race_participants_update_all" ON public.race_participants FOR UPDATE USING (true);
CREATE POLICY "race_participants_delete_all" ON public.race_participants FOR DELETE USING (true);

-- ---------------------------------------------------------------------------
-- 9. SUPABASE REALTIME REPLICATION
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.race_lobbies;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.race_participants;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.top_performers;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN
    -- already in publication
  END;
END;
$$;
