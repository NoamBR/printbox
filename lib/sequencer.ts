import fs from "node:fs";
import path from "node:path";
import { getDb, ProspectRow, logEvent } from "./db";

const OUTREACH_DIR = path.join(process.cwd(), "outreach");
const SEQUENCE_PATH = path.join(OUTREACH_DIR, "sequence.json");

export type SequenceStep = {
  step: number;
  template: string;
  offset_days: number;
  purpose: string;
};

export type SequenceConfig = {
  sequence_id: string;
  steps: SequenceStep[];
  signature_text: string;
  validation: { block_send_if_missing_merge_field: boolean; block_send_if_subject_over_chars: number };
};

export function loadSequence(): SequenceConfig {
  const raw = fs.readFileSync(SEQUENCE_PATH, "utf8");
  return JSON.parse(raw) as SequenceConfig;
}

export type RenderedEmail = {
  subject: string;
  body: string;
  warnings: string[];
};

export function renderTemplate(
  templateRelPath: string,
  prospect: ProspectRow
): RenderedEmail {
  const file = path.join(process.cwd(), templateRelPath);
  const raw = fs.readFileSync(file, "utf8");
  const subjectMatch = raw.match(/# Subject\s*\n([\s\S]*?)\n\s*# Body/);
  const bodyMatch = raw.match(/# Body\s*\n([\s\S]*)$/);
  if (!subjectMatch || !bodyMatch) {
    throw new Error(`Template ${templateRelPath} missing # Subject or # Body section`);
  }
  const ctx: Record<string, string> = {
    company_name: prospect.company_name,
    industry_he: prospect.industry_he,
    first_name: prospect.first_name,
    last_name: prospect.last_name ?? "",
    city: prospect.city,
    email: prospect.email,
  };
  const subject = substitute(subjectMatch[1].trim(), ctx);
  const body = substitute(bodyMatch[1].trim(), ctx);
  const warnings: string[] = [];
  const cfg = loadSequence();
  const leftover = /\{\{(\w+)\}\}/g;
  const leftSubj = [...subject.matchAll(leftover)].map((m) => m[1]);
  const leftBody = [...body.matchAll(leftover)].map((m) => m[1]);
  if (leftSubj.length || leftBody.length) {
    warnings.push(`merge tags unresolved: ${[...leftSubj, ...leftBody].join(", ")}`);
  }
  if (subject.length > cfg.validation.block_send_if_subject_over_chars) {
    warnings.push(`subject ${subject.length} chars exceeds cap`);
  }
  return { subject, body, warnings };
}

function substitute(text: string, ctx: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? `{{${k}}}`);
}

export type DueItem = {
  prospect: ProspectRow;
  step: 1 | 2 | 3;
};

export function getDueProspects(now: Date = new Date()): DueItem[] {
  const db = getDb();
  const cfg = loadSequence();
  const candidates = db
    .prepare(
      `SELECT * FROM prospects
       WHERE status = 'in_sequence'
         AND opted_out = 0
         AND replied_at IS NULL`
    )
    .all() as ProspectRow[];

  const due: DueItem[] = [];
  for (const p of candidates) {
    const step = nextDueStep(p, cfg, now);
    if (step) due.push({ prospect: p, step });
  }
  return due;
}

function nextDueStep(
  p: ProspectRow,
  cfg: SequenceConfig,
  now: Date
): 1 | 2 | 3 | null {
  const startedAt = p.touch_1_sent_at ? new Date(p.touch_1_sent_at + "Z") : null;
  if (!p.touch_1_sent_at) return 1;
  if (!p.touch_2_sent_at) {
    const offset = cfg.steps.find((s) => s.step === 2)!.offset_days;
    if (daysSince(startedAt!, now) >= offset) return 2;
    return null;
  }
  if (!p.touch_3_sent_at) {
    const offset = cfg.steps.find((s) => s.step === 3)!.offset_days;
    const t1 = new Date(p.touch_1_sent_at + "Z");
    if (daysSince(t1, now) >= offset) return 3;
    return null;
  }
  return null;
}

function daysSince(date: Date, now: Date): number {
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export function markTouchSent(
  prospectId: number,
  step: 1 | 2 | 3,
  at: Date = new Date()
): void {
  const db = getDb();
  const col = `touch_${step}_sent_at`;
  const iso = at.toISOString().replace("T", " ").slice(0, 19);
  db.prepare(
    `UPDATE prospects SET ${col} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(iso, prospectId);
  if (step === 3) {
    db.prepare(
      "UPDATE prospects SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(prospectId);
  }
}

export function getThreadHeadersForFollowup(
  prospectId: number,
  step: 2 | 3
): { inReplyTo?: string; references: string[]; threadRoot?: string } {
  const db = getDb();
  const root = db
    .prepare(
      `SELECT message_id FROM messages
       WHERE prospect_id = ? AND direction = 'out' AND step = 1
       ORDER BY id ASC LIMIT 1`
    )
    .get(prospectId) as { message_id: string | null } | undefined;
  if (!root?.message_id) return { references: [] };
  if (step === 2) {
    return {
      inReplyTo: root.message_id,
      references: [root.message_id],
      threadRoot: root.message_id,
    };
  }
  const t2 = db
    .prepare(
      `SELECT message_id FROM messages
       WHERE prospect_id = ? AND direction = 'out' AND step = 2
       ORDER BY id ASC LIMIT 1`
    )
    .get(prospectId) as { message_id: string | null } | undefined;
  const refs = [root.message_id];
  if (t2?.message_id) refs.push(t2.message_id);
  return {
    inReplyTo: refs[refs.length - 1],
    references: refs,
    threadRoot: root.message_id,
  };
}
