# Echo — agents.md

> This file is for AI coding assistants (Cursor, GitHub Copilot, Claude, etc.) to understand the Echo project structure, conventions, and rules before generating or modifying any code.

---

## What is Echo?

Echo is an open-source, voice-first AI transcription web application built with Next.js. Instead of typing prompts, users speak — Echo transcribes their speech using open-source Whisper models and saves the results to a local SQLite3 database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite3 (via `better-sqlite3`) |
| Auth | Custom JWT + bcrypt (no third-party providers) |
| Speech-to-Text | Whisper Large V3 / faster-whisper |
| Package Manager | npm |

---

## Project Structure

```
echo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page (email + password)
│   │   └── signup/
│   │       └── page.tsx          # Signup page (first name, last name, email, password)
│   ├── dashboard/
│   │   ├── page.tsx              # Main transcription UI (mic button, transcript card)
│   │   ├── history/
│   │   │   └── page.tsx          # All past transcriptions
│   │   ├── favorites/
│   │   │   └── page.tsx          # Favorited transcriptions only
│   │   └── settings/
│   │       └── page.tsx          # API keys + account settings
│   └── api/
│       ├── auth/
│       │   ├── signup/
│       │   │   └── route.ts      # POST /api/auth/signup
│       │   └── login/
│       │       └── route.ts      # POST /api/auth/login
│       ├── transcribe/
│       │   └── route.ts          # POST /api/transcribe — sends audio to STT provider
│       └── recordings/
│           └── route.ts          # GET/DELETE /api/recordings — manage saved transcripts
├── components/
│   ├── MicButton.tsx             # Microphone button with idle/listening/processing states
│   ├── TranscriptCard.tsx        # Displays transcribed text with copy + delete actions
│   ├── HistoryItem.tsx           # Single recording row in history/favorites
│   ├── Sidebar.tsx               # Desktop sidebar nav
│   └── BottomNav.tsx             # Mobile bottom navigation bar
├── lib/
│   ├── db.ts                     # SQLite3 connection and query helpers (better-sqlite3)
│   └── auth.ts                   # JWT sign/verify helpers + bcrypt wrappers
├── middleware.ts                  # Protects /dashboard/* routes; redirects to /login if no token
├── echo.db                       # SQLite database file (auto-created on first run)
├── .env.local                    # Environment variables (never commit this)
└── agents.md                     # This file
```

---

## Database Schema

The database uses **SQLite3** via `better-sqlite3`. The `echo.db` file lives at the project root.

### `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `recordings`
```sql
CREATE TABLE IF NOT EXISTS recordings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  provider    TEXT,               -- 'whisper' or 'faster-whisper'
  duration    REAL,               -- audio duration in seconds
  is_favorite INTEGER DEFAULT 0, -- 0 = false, 1 = true
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `user_settings`
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id                 INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  whisper_api_key         TEXT,
  faster_whisper_api_key  TEXT,
  default_provider        TEXT DEFAULT 'whisper',
  updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Authentication

- Users sign up with: `first_name`, `last_name`, `email`, `password`
- Users log in with: `email`, `password`
- Passwords are hashed with **bcrypt** before storage — never store plaintext passwords
- On login/signup, a **JWT** is issued and stored in an **HTTP-only cookie** named `echo_token`
- All `/dashboard/*` routes are protected via `middleware.ts`
- Unauthenticated users are redirected to `/login`
- JWT secret is stored in `.env.local` as `JWT_SECRET`

---

## Environment Variables

```env
# .env.local
JWT_SECRET=your_random_secret_here
DATABASE_PATH=./echo.db
```

Never expose `JWT_SECRET`. Never commit `.env.local` to git.

---

## AI Provider Integration

Users store their own API keys in the Settings page. Keys are saved to `user_settings` in the database. API keys are used server-side only — never exposed to the browser.

### Supported Providers

| Provider | Key in DB | Notes |
|---|---|---|
| Whisper Large V3 | `whisper_api_key` | Compatible with OpenAI audio API format |
| faster-whisper | `faster_whisper_api_key` | Self-hosted or cloud endpoint |

### Transcription Flow (`/api/transcribe`)
1. Receive audio file from the browser (FormData, multipart)
2. Read the user's JWT from cookie → get `user_id`
3. Fetch user's API key + preferred provider from `user_settings`
4. Forward audio to the selected STT provider
5. Save transcription result to `recordings` table
6. Return transcribed text to the client

---

## Pages

| Route | Description |
|---|---|
| `/signup` | Registration form — first name, last name, email, password |
| `/login` | Login form — email, password |
| `/dashboard` | Main transcription page with mic button and transcript card |
| `/dashboard/history` | All recordings, sorted by date, with search |
| `/dashboard/favorites` | Only recordings where `is_favorite = 1` |
| `/dashboard/settings` | API key management + account settings |

---

## Key Components

### `MicButton.tsx`
- States: `idle` | `listening` | `processing` | `done`
- Uses the browser `MediaRecorder` API to capture audio
- On stop, sends audio to `/api/transcribe` via `fetch` with `FormData`
- Shows animated glowing ring while listening

### `TranscriptCard.tsx`
- Displays the transcribed text
- Copy button (copies text to clipboard)
- Delete button (calls DELETE `/api/recordings/:id`)
- Character count + timestamp
- Favorite toggle button

### `Sidebar.tsx` (desktop) / `BottomNav.tsx` (mobile)
- Links: New Recording, History, Favorites, Settings
- Highlights the active route

---

## Coding Conventions

- Use **TypeScript** throughout — no `any` unless absolutely necessary
- Use **Next.js App Router** patterns (`page.tsx`, `route.ts`, `layout.tsx`)
- All API routes live under `app/api/`
- Database queries go through `lib/db.ts` — do not call `better-sqlite3` directly in route files
- Auth helpers (sign token, verify token, hash password, compare password) go through `lib/auth.ts`
- Use **Tailwind CSS** for all styling — no inline styles, no CSS modules unless needed
- Keep components small and focused — one responsibility per component
- Handle errors in API routes with proper HTTP status codes (400, 401, 404, 500)
- Always validate request body in API routes before touching the database

---

## What NOT to do

- Do **not** store API keys in environment variables — they are per-user and stored in the database
- Do **not** expose API keys to the browser — all provider calls happen server-side in API routes
- Do **not** use an external database (Postgres, MySQL, etc.) — this project uses SQLite3 only
- Do **not** use NextAuth or any third-party auth library — auth is custom JWT + bcrypt
- Do **not** use `localStorage` for sensitive data like tokens — use HTTP-only cookies only
- Do **not** create new pages outside the `app/` directory structure
- Do **not** commit `echo.db` or `.env.local` to git

---

## Running the Project

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

The SQLite database (`echo.db`) is created automatically on first run via `lib/db.ts`.

---

*Echo — Talk. Think. Create.*
