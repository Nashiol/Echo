# Echo — agents.md

> This file is for AI coding assistants (Cursor, GitHub Copilot, Claude, etc.) to understand the Echo project structure, conventions, and rules before generating or modifying any code.

---

## What is Echo?

Echo is an open-source, voice-first AI transcription web application built with Next.js. Instead of typing prompts, users speak — Echo transcribes their speech using Whisper models hosted on Groq and saves the results to a local SQLite3 database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite3 (via `better-sqlite3`) |
| Auth | Custom JWT + bcrypt (no third-party providers) |
| Speech-to-Text | Groq API (whisper-large-v3 / whisper-large-v3-turbo) |
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
│   │       └── page.tsx          # Groq API key + model selection + account settings
│   └── api/
│       ├── auth/
│       │   ├── signup/
│       │   │   └── route.ts      # POST /api/auth/signup
│       │   └── login/
│       │       └── route.ts      # POST /api/auth/login
│       ├── transcribe/
│       │   └── route.ts          # POST /api/transcribe — sends audio to Groq API
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
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `recordings`
```sql
CREATE TABLE IF NOT EXISTS recordings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  model       TEXT,               -- 'whisper-large-v3' or 'whisper-large-v3-turbo'
  duration    REAL,               -- audio duration in seconds
  is_favorite INTEGER DEFAULT 0, -- 0 = false, 1 = true
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `user_settings`
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  groq_api_key  TEXT,           -- user's personal Groq API key (free at console.groq.com)
  default_model TEXT DEFAULT 'whisper-large-v3-turbo', -- preferred Groq Whisper model
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
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

> Note: There is NO global API key in `.env.local`. Each user supplies their own Groq API key via the Settings page. It is stored in the database and used server-side only.

---

## AI Provider Integration

Echo uses the **Groq API** for speech-to-text transcription. Groq hosts Whisper models on its own infrastructure, so no GPU or local model setup is required. The Groq API is completely free — users sign up at [console.groq.com](https://console.groq.com) to get their own free API key, then paste it into Echo's Settings page.

### Supported Models

| Model | Groq Model String | Best For |
|---|---|---|
| Whisper Large V3 | `whisper-large-v3` | Maximum accuracy, 90+ languages |
| Whisper Large V3 Turbo | `whisper-large-v3-turbo` | Faster inference, slightly lighter (recommended default) |

### Groq Free Tier Limits
- 2,000 requests per day
- 7,200 audio seconds per hour
- No credit card required
- Sign up at: https://console.groq.com

### Groq API Endpoint
```
POST https://api.groq.com/openai/v1/audio/transcriptions
```

The Groq audio API is **OpenAI-compatible**. Send audio as `multipart/form-data`.

### Example API Call (inside `/api/transcribe/route.ts`)
```typescript
const formData = new FormData();
formData.append("file", audioBlob, "recording.webm");
formData.append("model", userSettings.default_model); // 'whisper-large-v3' or 'whisper-large-v3-turbo'
formData.append("response_format", "json");

const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${userSettings.groq_api_key}`,
  },
  body: formData,
});

const data = await response.json();
const transcript = data.text;
```

### Transcription Flow (`/api/transcribe`)
1. Receive audio file from the browser (`FormData`, multipart)
2. Read the user's JWT from cookie → get `user_id`
3. Fetch user's `groq_api_key` and `default_model` from `user_settings`
4. If no API key is set, return `400` with a message prompting the user to add their key in Settings
5. Forward audio to `https://api.groq.com/openai/v1/audio/transcriptions`
6. Save transcription result + model used to the `recordings` table
7. Return transcribed text to the client

---

## Pages

| Route | Description |
|---|---|
| `/signup` | Registration form — first name, last name, email, password |
| `/login` | Login form — email, password |
| `/dashboard` | Main transcription page with mic button and transcript card |
| `/dashboard/history` | All recordings, sorted by date, with search |
| `/dashboard/favorites` | Only recordings where `is_favorite = 1` |
| `/dashboard/settings` | Groq API key input, model selector, account settings |

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
- Delete button (calls `DELETE /api/recordings/:id`)
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
- Handle errors in API routes with proper HTTP status codes (`400`, `401`, `404`, `500`)
- Always validate request body in API routes before touching the database

---

## What NOT to do

- Do **not** store a global Groq API key in `.env.local` — keys are per-user and stored in the database
- Do **not** expose the user's Groq API key to the browser — all Groq calls happen server-side in `/api/transcribe`
- Do **not** use an external database (Postgres, MySQL, etc.) — this project uses SQLite3 only
- Do **not** use NextAuth or any third-party auth library — auth is custom JWT + bcrypt
- Do **not** use `localStorage` for sensitive data like tokens — use HTTP-only cookies only
- Do **not** create new pages outside the `app/` directory structure
- Do **not** commit `echo.db` or `.env.local` to git
- Do **not** add a second STT provider — Groq is the only provider. The user only chooses between the two Groq Whisper models (`whisper-large-v3` and `whisper-large-v3-turbo`)

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