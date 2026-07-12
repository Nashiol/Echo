import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_PATH || "./echo.db";

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recordings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    model       TEXT,
    duration    REAL,
    is_favorite INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    groq_api_key  TEXT,
    default_model TEXT DEFAULT 'whisper-large-v3-turbo',
    language      TEXT DEFAULT 'en',
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add language column if missing (for existing databases)
try {
  db.prepare("SELECT language FROM user_settings LIMIT 1").get();
} catch {
  db.prepare("ALTER TABLE user_settings ADD COLUMN language TEXT DEFAULT 'en'").run();
}

export default db;
