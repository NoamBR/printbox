import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// On Vercel the project root is read-only; /tmp is the only writable dir
// (ephemeral, per-function-instance — fine for fire-and-forget audit logging).
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "printbox-data")
  : path.join(process.cwd(), "data");
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

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT NOT NULL UNIQUE,
      client_name TEXT NOT NULL,
      client_company TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_notes TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_OWNER_APPROVAL',
      final_price_ils INTEGER,
      final_price_notes TEXT,
      prospect_id INTEGER REFERENCES prospects(id) ON DELETE SET NULL,
      approve_token TEXT NOT NULL,
      reject_token TEXT NOT NULL,
      follow_up_due_at TEXT,
      replied_at TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      owner_decided_at TEXT,
      sent_to_client_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
    CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(client_email);
    CREATE INDEX IF NOT EXISTS idx_quotes_prospect ON quotes(prospect_id);

    CREATE TABLE IF NOT EXISTS quote_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_title_he TEXT NOT NULL,
      product_title_en TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      specs_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

    CREATE TABLE IF NOT EXISTS quote_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      meta_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events(quote_id, created_at);

    CREATE TABLE IF NOT EXISTS social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      angle TEXT NOT NULL,
      brand_key TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      product_id TEXT NOT NULL,
      format TEXT NOT NULL,
      style TEXT NOT NULL,
      composition TEXT NOT NULL,
      hook_hebrew TEXT NOT NULL,
      caption_full TEXT,
      hashtags_json TEXT,
      alt_text TEXT,
      value_positioning_beat TEXT,
      image_path TEXT,
      event_tie TEXT,
      status TEXT NOT NULL DEFAULT 'queued',
      error_msg TEXT,
      scheduled_for_iso TEXT,
      generated_at_iso TEXT,
      notified_at_iso TEXT,
      posted_at_iso TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(type, created_at);
    CREATE INDEX IF NOT EXISTS idx_social_posts_brand_angle ON social_posts(brand_key, angle, created_at);
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

export type QuoteStatus =
  | "PENDING_OWNER_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SENT_TO_CLIENT"
  | "CLIENT_RESPONDED";

export type QuoteRow = {
  id: number;
  public_id: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_phone: string;
  client_notes: string | null;
  status: QuoteStatus;
  final_price_ils: number | null;
  final_price_notes: string | null;
  prospect_id: number | null;
  approve_token: string;
  reject_token: string;
  follow_up_due_at: string | null;
  replied_at: string | null;
  user_agent: string | null;
  created_at: string;
  owner_decided_at: string | null;
  sent_to_client_at: string | null;
};

export type QuoteItemRow = {
  id: number;
  quote_id: number;
  product_id: string;
  product_title_he: string;
  product_title_en: string;
  quantity: number;
  specs_json: string | null;
  created_at: string;
};

export type QuoteEventRow = {
  id: number;
  quote_id: number;
  type: string;
  meta_json: string | null;
  created_at: string;
};

export function logQuoteEvent(
  quote_id: number,
  type: string,
  meta: Record<string, unknown> | null = null
): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO quote_events (quote_id, type, meta_json) VALUES (?, ?, ?)"
  ).run(quote_id, type, meta ? JSON.stringify(meta) : null);
}

export type SocialPostType = "story" | "post";
export type SocialPostStatus = "queued" | "posted" | "skipped" | "error";

export type SocialPostRow = {
  id: number;
  type: SocialPostType;
  angle: string;
  brand_key: string;
  brand_name: string;
  product_id: string;
  format: string;
  style: string;
  composition: string;
  hook_hebrew: string;
  caption_full: string | null;
  hashtags_json: string | null;
  alt_text: string | null;
  value_positioning_beat: string | null;
  image_path: string | null;
  event_tie: string | null;
  status: SocialPostStatus;
  error_msg: string | null;
  scheduled_for_iso: string | null;
  generated_at_iso: string | null;
  notified_at_iso: string | null;
  posted_at_iso: string | null;
  metadata_json: string | null;
  created_at: string;
};
