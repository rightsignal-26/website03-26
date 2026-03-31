# Community-Rightsignal
Social app starter that pairs a React + TypeScript + Vite frontend (with Supabase auth/data) and a lightweight Express/TypeScript API. The current flow is Supabase‑first; the Express server is a thin placeholder you can grow into a full API.

## Stack At A Glance
- Frontend: React 19, Vite, TypeScript, Tailwind v4 (utility classes), Framer Motion, React Router 7, lucide-react icons.
- Backend: Express 4 + TypeScript, CORS, dotenv; runs with ts-node in dev and compiles to `dist/` for production.
- Auth & Data: Supabase auth (email/password + Google OAuth) and tables for `posts` and `profiles`.
- State: Context providers for auth (`AuthContext`), posts (`PostContext`), social/search (`SocialContext`), and theme (`ThemeContext` with dark/light toggle stored in `localStorage`).

## Repository Layout
- `Frontend/` — Vite app, main entry `src/App.tsx`, routes under `src/pages/`, shared UI in `src/components/`, contexts in `src/context/`, Supabase client in `src/utils/supabase.ts`.
- `Backend/` — Express server with in-memory post store, entry `src/index.ts`.
- `.nvmrc` — Node 20.19.0 (match for both projects).

## How The Current Flow Works
1) **Auth gate**: `AuthContext` loads Supabase session on app start; all main routes are wrapped in `ProtectedRoute` (see `src/App.tsx`). Login and Signup use Supabase email/password; Google OAuth is wired via `signInWithOAuth`.
2) **Feed**: `PostProvider` pulls `posts` from Supabase, enriches them with author data from `profiles`, and renders via `Feed` → `Post` components. The Create Post composer writes to Supabase then optimistically prepends to local state. Likes/reposts are client-side counters only.
3) **Profile**: `Profile.tsx` ensures a `profiles` row exists for the logged-in user (upsert), lets the user edit profile fields, and lists their posts filtered by `author_id`.
4) **Search/Follow**: `SocialContext` keeps a search query and “following” ids in `localStorage`; filtering happens client-side in the feed.
5) **Other screens**: Notifications and Messages are UI-only with mock data; Settings toggles theme and preferences locally. Right sidebar surfaces trends/people (static).
6) **Backend API (optional today)**: `Backend/src/index.ts` serves `/api/posts`, `/api/posts/:id`, and `/api/health` from an in-memory array; not yet called by the frontend but ready for future integration or database swap.

### Architecture (current)
```
Browser (Vite React)
 ├─ AuthContext ──→ Supabase Auth (email/password, Google)
 ├─ PostContext ──→ Supabase DB tables: posts, profiles
 ├─ Social/Theme ─→ localStorage (search, follows, theme)
 └─ Routes/Pages ─→ UI components (Feed, Profile, etc.)

Optional service: Express API @ Backend/src/index.ts
 └─ In-memory posts + /api/health (standalone process)
```

## Supabase Data Model (expected)
- `profiles`: `id` (uuid, PK, matches auth.user.id), `username`, `full_name`, `avatar_url`, `bio`, `website`, `created_at` (timestamp default now()).
- `posts`: `id` (uuid, PK), `author_id` (uuid FK → profiles.id), `title`, `content`, `created_at` (timestamp default now()), `like_count` int default 0, `comment_count` int default 0, `repost_count` int default 0.
- RLS: enable for both tables and allow authenticated users to read; allow insert/update on their own rows as needed.

## Running The Frontend
1) `cd Frontend`
2) `npm install`
3) Copy `.env` and set your own keys (do not commit secrets):
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_GOOGLE_CLIENT_ID=<oauth-client-id>
   VITE_GOOGLE_CLIENT_SECRET=<oauth-client-secret>
   ```
4) `npm run dev` → http://localhost:5173
5) `npm run build` for production bundle; output in `Frontend/dist/`.

## Running The Backend
1) `cd Backend`
2) `npm install`
3) Configure `.env` (default `PORT=5001`).
4) Dev: `npm run dev` (ts-node).  
   Build: `npm run build` then `npm start` (runs `dist/index.js`).
5) Health check: `GET http://localhost:5001/api/health`.

## Key Files To Know
- `Frontend/src/App.tsx` — route layout, providers, protected routes.
- `Frontend/src/context/AuthContext.tsx` — Supabase auth wiring.
- `Frontend/src/context/PostContext.tsx` — fetch/create posts, like/repost state.
- `Frontend/src/pages/Profile.tsx` — profile upsert/edit and user posts.
- `Backend/src/index.ts` — Express routes and in-memory post store.

## Development Notes
- Tailwind v4 via `@import "tailwindcss";` in `src/index.css`; theme overrides live there (dark/light class toggle).
- Likes/reposts are currently client-only; persist to Supabase or the Express API if you need durable counters.
- Notifications, Messages, and RightSidebar data are mock/stubbed; replace with real API calls as you expand.
- Keep Node at 20.19.0 (`nvm use 20.19.0`) to match the toolchain in `.nvmrc`.

## Suggested Next Steps
- Wire the frontend to the Express API or extend Supabase functions for server-side validation.
- Add Supabase Row Level Security policies and migrations to keep schema in code.
- Replace mock data (notifications/messages/trending) with real endpoints.
- Add tests (frontend components and backend routes) and CI lint/build checks.
