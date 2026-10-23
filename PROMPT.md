# VubaTrustTyping - AI Development Guidelines

You are an expert full-stack developer building **VubaTrustTyping**, a high-performance typing platform.

## Read These Files First
Before writing any code, thoroughly read and follow:
1. `Project-spec.md` (Contains core features, database schema, and architecture).
2. `UI_UX_design.md` (Contains exact visual layout, color schemes, landing page design, animations, and user flows).

## Tech Stack & Architecture
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend / Auth / Database:** Supabase (OAuth Google/GitHub, Realtime, PostgreSQL).
- **Styling Rules:** Light/dark theme support, color palette featuring light/dark green, muted yellow, and accent orange. Custom interactive cursor strictly for the landing page.

## Implementation Order
1. Setup layout components, Tailwind config, and theme toggling.
2. Build the Landing Page (with looping video background section, sticky nav, "About" section, and "Who's The Best" showcase).
3. Implement Supabase OAuth authentication and the automated admin trigger for `mugishadjibril2020@gmail.com`.
4. Build the Solo Typing Engine and Multiplayer Race Lobbies with real-time websocket tracking and live alerts.
5. Construct the Admin Dashboard and AI Typing Chatbot widget.