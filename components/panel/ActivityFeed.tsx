import { getDb } from "@/lib/db";

type Row = {
  id: number;
  prospect_id: number;
  type: string;
  step: number | null;
  meta_json: string | null;
  created_at: string;
  company_name: string | null;
  email: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  imported: "ייבוא ליד",
  sequence_started: "הופעל רצף",
  sent: "נשלח (Live)",
  sent_dryrun: "נשלח (dry-run)",
  sent_dryrun_file: "קובץ נשמר",
  inbound_classified: "תגובה סווגה",
  auto_replied: "מענה אוטומטי נשלח",
  auto_reply_rate_limited: "מענה דולג (rate-limit)",
  opted_out_inbound: "ביטול מתוך התגובה",
  replied: "תגובה התקבלה",
  opted_out: "הסרה מהרשימה",
  error: "שגיאה",
};

const TYPE_COLOR: Record<string, string> = {
  imported: "text-brand-boneDim",
  sequence_started: "text-brand-gold",
  sent: "text-emerald-300",
  sent_dryrun: "text-brand-goldHi",
  sent_dryrun_file: "text-brand-boneDim",
  inbound_classified: "text-brand-goldHi",
  auto_replied: "text-emerald-300",
  auto_reply_rate_limited: "text-amber-300",
  opted_out_inbound: "text-red-300",
  replied: "text-emerald-300",
  opted_out: "text-brand-boneDim",
  error: "text-red-300",
};

export function ActivityFeed({ limit = 30 }: { limit?: number }) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT e.id, e.prospect_id, e.type, e.step, e.meta_json, e.created_at,
              p.company_name, p.email
       FROM events e
       LEFT JOIN prospects p ON p.id = e.prospect_id
       ORDER BY e.id DESC
       LIMIT ?`
    )
    .all(limit) as Row[];

  if (!rows.length) {
    return (
      <div className="bg-brand-surface border border-brand-line rounded-lg p-8 text-center text-brand-boneDim text-sm">
        אין פעילות עדיין — ייבא לידים ולחץ "הרץ סבב שליחה"
      </div>
    );
  }

  return (
    <div className="bg-brand-surface border border-brand-line rounded-lg divide-y divide-brand-line">
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={`text-xs uppercase tracking-wider shrink-0 ${
                TYPE_COLOR[r.type] ?? "text-brand-bone"
              }`}
            >
              {TYPE_LABEL[r.type] ?? r.type}
              {r.step ? ` · T${r.step}` : ""}
            </span>
            <span className="text-brand-bone truncate">
              {r.company_name ?? `prospect #${r.prospect_id}`}
            </span>
            <span className="text-brand-boneDim text-xs truncate hidden md:inline">
              {r.email}
            </span>
          </div>
          <time className="text-brand-boneDim text-xs shrink-0">
            {formatHe(r.created_at)}
          </time>
        </div>
      ))}
    </div>
  );
}

function formatHe(ts: string): string {
  const d = new Date(ts + "Z");
  return d.toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
}
