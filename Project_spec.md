# Project-spec.md

## 1. Project Overview
**VubaTrustTyping** is a visually rich, high-performance, real-time multiplayer typing platform designed to combine speed, accuracy, competitive racing, and deep typing analytics[cite: 1]. Drawing inspiration from top-tier platforms like **Monkeytype**, **TypeRacer**, **TypeRush**, and **Keymash**, VubaTrustTyping provides custom solo practice modes alongside private invite-based multiplayer lobbies ("races")[cite: 1].

---

## 2. Core Features & Inspiration

┌──────────────────────────────────────────────┐ │ VubaTrustTyping │ └──────────────────────┬───────────────────────┘ │ ┌──────────────────┬─────────────┴────────────┬──────────────────┐ ▼ ▼ ▼ ▼ 

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │ Monkeytype │ │ TypeRacer │ │ TypeRush │ │ Keymash │ │ Custom Modes │ │ Multi-Races │ │ Visual Track │ │ Competitive Ranked│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘ 

* **Monkeytype:** Minimalist typing engine, granular custom time/word modes, detailed live WPM (words per minute), accuracy, and key consistency graphs[cite: 1].
* **TypeRacer:** Live progress tracking across players, race lobbies, and custom text prompt options[cite: 1].
* **TypeRush:** Gamified progression, race cars/avatars on visual tracks, and streak rewards[cite: 1].
* **Keymash:** Competitive ranked matchmaking and strict anti-cheat/anti-bot keystroke validation[cite: 1].

---

## 3. Detailed Feature Requirements

### A. Authentication & User Management
* **OAuth 2.0 Social Login:** Secure, passwordless authentication allowing users to sign in via providers (Google, GitHub)[cite: 1, 2].
* **Automated Admin Role Assignment:** All users sign in via OAuth[cite: 2], but a database trigger/rule automatically assigns the `admin` role to `mugishadjibril2020@gmail.com` upon first login.
* **User Profiles:** Track overall stats (highest WPM, average WPM, accuracy, total tests taken, races won) and typing speed levels[cite: 1, 2].

### B. Solo Typing Engine
* **Flexible Duration:** Users can customize test length (15s, 30s, 60s, 120s, or custom duration)[cite: 1].
* **Mode Selectors:**
  * **Time Mode:** Type against a countdown timer[cite: 1].
  * **Words Mode:** Type through a fixed set of words (10, 25, 50, 100)[cite: 1].
  * **Quote Mode:** Type short, medium, or long quote passages[cite: 1].
* **Real-time Feedback:** Live WPM display, character highlight (correct, incorrect, extra), smooth caret animation, and error sound effects[cite: 1].

### C. Multiplayer & Race Lobbies
* **Create Race:** Authenticated users can host a private race session[cite: 1].
* **Invite via Code/Link:** Generates a unique short lobby code (e.g., `VTT-8921`) or shareable join link[cite: 1].
* **Real-time Synchronization & Live Alerts:** WebSocket/Real-time database sync showing competitors' progress bars live on track[cite: 1]. If an opponent passes you, a 1-second non-blocking interruption alert fires showing who passed you and how many seconds ahead they are[cite: 2].
* **Leaderboards:** Post-race scoreboard detailing finishing order, final WPM, raw WPM, and accuracy percentage[cite: 1].

### D. Admin Control Panel & Messaging
* **Account Tracker:** The admin dashboard displays a complete list of registered user accounts, tracks performance progress, and manages permissions/roles (`user`, `moderator`, `admin`)[cite: 2].
* **Messaging & Notifications:** Admins can send targeted performance notifications and messages to users, which appear in their notification area[cite: 2].
* **Automatic Top Performer Submissions:** Top 3 performers receive automatic prompts/forms to submit a profile image and advice message, populated into the landing page's "Who’s The Best" section[cite: 2].

---

## 4. Rich Visual UI/UX & Multimedia Enhancements

To make VubaTrustTyping visually appealing, gamified, and engaging, the platform integrates rich visual, audio, and motion elements across all core screens[cite: 1]:

### A. Landing Page & Visual Highlights
* **Looping Video Background:** A high-quality looping video showing three consecutive scenarios: a student typing fast in a classroom, a focused programmer typing rapidly surrounded by computers, and an office worker typing a report[cite: 2].
* **Sticky Navigation & Theme Switching:** Floating top navigation on scroll with light and dark mode toggles[cite: 2]. Accent colors utilize light/dark green, muted yellow, and occasional orange accents[cite: 2].
* **Landing Page Cursor Effect:** A custom interactive cursor animation (a dotted 3D dragon moving around the cursor) limited exclusively to the landing page[cite: 2].
* **Interactive Chatbot Widget:** An integrated AI typing coach available from the landing page and user dashboard to advise users on increasing their WPM[cite: 2].
* **"About" Section:** Features an origin story honoring creator Djibril Mugisha, highlighting modern digital literacy demands[cite: 2], paired with an uneven curved-line encircled image layout.
* **"Who's The Best" Showcase:** A dedicated landing page section highlighting the top 3 global typists, their avatars, and their growth advice[cite: 2].

### B. Gamified Visual Tracks & Avatars (TypeRush Inspired)
* **Animated Race Vehicles/Avatars:** Players select customizable avatars or vehicles moving across a visual racetrack in real time based on typing speed[cite: 1].

### C. Rich Visual Analytics & Graphics
* **Post-Test Performance Charts:** Interactive canvas-based speed graphs showing live WPM drops, raw WPM, and error bursts over time[cite: 1].
* **Heatmap Keyboard Display:** Visual keyboard overlay highlighting accuracy and speed per individual key[cite: 1].

### D. Audio Feedback & Soundpacks
* **Tactile Mechanical Audio:** Sound toggles for different mechanical keyboard switches (Cherry MX Blue, Red, Brown, Thocky, Typewriter)[cite: 1].

---

## 5. Technical Architecture & Tech Stack

| Layer | Recommended Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js / Tailwind CSS / Framer Motion | Fast UI rendering, responsive layouts, smooth animations[cite: 1] |
| **Backend / Database** | Supabase or Node.js + PostgreSQL | Real-time subscriptions, OAuth, Row-Level Security[cite: 1] |
| **Real-time Sync** | WebSockets / Supabase Realtime | Sub-second player race sync and live multiplayer alerts[cite: 1, 2] |
| **Media & Assets** | Cloudinary / Vercel Blob | Hosting high-quality background videos, avatar graphics, and soundpacks[cite: 1, 2] |
| **Hosting** | Vercel | Instant global deployment and edge caching[cite: 1] |

---

## 6. Proposed Database Schema

```sql
-- Profiles Table with Admin & Typing Level Support
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    selected_theme TEXT DEFAULT 'neon',
    typing_level TEXT DEFAULT 'Beginner',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Race Lobbies Table
CREATE TABLE race_lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES profiles(id),
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'racing', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typing Test Results Table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    wpm NUMERIC(5,2) NOT NULL,
    accuracy NUMERIC(5,2) NOT NULL,
    test_mode TEXT NOT NULL,
    test_duration INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications & Messages Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top Performers Showcase Table ("Who's The Best")
CREATE TABLE top_performers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    advice_message TEXT,
    custom_avatar_url TEXT,
    rank_position INT CHECK (rank_position IN (1, 2, 3)),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);