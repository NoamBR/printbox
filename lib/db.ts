import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "printbox.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  _db = db;
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      industry_he TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      role TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      city TEXT NOT NULL,
      website TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      sequence_id TEXT,
      touch_1_sent_at TEXT,
      touch_2_sent_at TEXT,
      touch_3_sent_at TEXT,
      replied_at TEXT,
      opted_out INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      step INTEGER,
      meta_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_events_prospect ON events(prospect_id, created_at);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prospect_id INTEGER REFERENCES prospects(id) ON DELETE SET NULL,
      direction TEXT NOT NULL,
      step INTEGER,
      message_id TEXT,
      in_reply_to TEXT,
      references_chain TEXT,
      thread_root TEXT,
      from_addr TEXT,
      to_addr TEXT,
      subject TEXT,
      body TEXT,
      imap_uid INTEGER,
      classification TEXT,
      confidence REAL,
      auto_replied INTEGER NOT NULL DEFAULT 0,
      held_for_review INTEGER NOT NULL DEFAULT 0,
      raw_headers TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_messages_prospect ON messages(prospect_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_root);
    CREATE INDEX IF NOT EXISTS idx_messages_msgid ON messages(message_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_uid ON messages(imap_uid) WHERE imap_uid IS NOT NULL;
  `);
}

export function getSetting(key: string, fallback: string | null = null): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

export type ProspectRow = {
  id: number;
  company_name: string;
  industry_he: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  email: string;
  phone: string | null;
  city: string;
  website: string | null;
  notes: string | null;
  status: "new" | "in_sequence" | "replied" | "opted_out" | "completed" | "error";
  sequence_id: string | null;
  touch_1_sent_at: string | null;
  touch_2_sent_at: string | null;
  touch_3_sent_at: string | null;
  replied_at: string | null;
  opted_out: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: number;
  prospect_id: number;
  type: string;
  step: number | null;
  meta_json: string | null;
  created_at: string;
};

export type MessageRow = {
  id: number;
  prospect_id: number | null;
  direction: "out" | "in";
  step: number | null;
  message_id: string | null;
  in_reply_to: string | null;
  references_chain: string | null;
  thread_root: string | null;
  from_addr: string | null;
  to_addr: string | null;
  subject: string | null;
  body: string | null;
  imap_uid: number | null;
  classification: string | null;
  confidence: number | null;
  auto_replied: 0 | 1;
  held_for_review: 0 | 1;
  raw_headers: string | null;
  created_at: string;
};

export function logEvent(
  prospect_id: number,
  type: string,
  step: number | null = null,
  meta: Record<string, unknown> | null = null
): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO events (prospect_id, type, step, meta_json) VALUES (?, ?, ?, ?)"
  ).run(prospect_id, type, step, meta ? JSON.stringify(meta) : null);
}
