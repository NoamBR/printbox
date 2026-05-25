import Link from "next/link";
import { getDb } from "@/lib/db";
import { SyncInboxButton } from "@/components/panel/SyncInboxButton";

export const dynamic = "force-dynamic";

type Row = {
  id: number;
  prospect_id: number | null;
  subject: string | null;
  from_addr: string | null;
  classification: string | null;
  confidence: number | null;
  held_for_review: 0 | 1;
  created_at: string;
  company_name: string | null;
};

const INTENT_LABEL: Record<string, string> = {
  opt_out: "ביטול",
  interested: "מעוניין",
  objection: "התנגדות",
  question: "שאלה",
  out_of_office: "חופשה",
  not_now: "לא עכשיו",
  wrong_person: "כתובת שגויה",
  spam: "ספאם",
};

const INTENT_STYLE: Record<string, string> = {
  opt_out: "bg-red-500/15 text-red-300 border-red-500/30",
  interested: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  objection: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  question: "bg-brand-gold/15 text-brand-goldHi border-brand-gold/40",
  out_of_office: "bg-brand-line text-brand-boneDim border-brand-line",
  not_now: "bg-brand-surfaceHi text-brand-bone border-brand-line",
  wrong_person: "bg-brand-surfaceHi text-brand-boneDim border-brand-line",
  spam: "bg-brand-line text-brand-boneDim border-brand-line",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const db = getDb();
  const where: string[] = ["m.direction = 'in'"];
  if (filter === "held") where.push("m.held_for_review = 1");
  if (filter === "opt_out") where.push("m.classification = 'opt_out'");
  if (filter === "matched") where.push("m.prospect_id IS NOT NULL");
  if (filter === "unmatched") where.push("m.prospect_id IS NULL");

  const rows = db
    .prepare(
      `SELECT m.id, m.prospect_id, m.subject, m.from_addr, m.classification,
              m.confidence, m.held_for_review, m.created_at,
              p.company_name
       FROM messages m
       LEFT JOIN prospects p ON p.id = m.prospect_id
       WHERE ${where.join(" AND ")}
       ORDER BY m.id DESC
       LIMIT 200`
    )
    .all() as Row[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-bone">תיבת נכנס</h1>
          <p className="text-brand-boneDim text-sm mt-1">
            תגובות נכנסות, סיווג אוטומטי, ומענים שנשלחו על ידי הסוכן
          </p>
        </div>
        <SyncInboxButton />
      </div>

      <Filters current={filter ?? "all"} />

      <div className="bg-brand-surface border border-brand-line rounded-lg overflow-hidden">
        {rows.length === 0 && (
          <div className="text-center py-12 text-brand-boneDim text-sm">
            אין הודעות נכנסות עדיין — לחץ "סנכרן תיבה"
          </div>
        )}
        <table className="w-full text-sm">
          <tbody className="divide-y divide-brand-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-brand-surfaceHi/50">
                <td className="px-4 py-3 w-24">
                  {r.classification && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${
                        INTENT_STYLE[r.classification] ?? INTENT_STYLE.spam
                      }`}
                    >
                      {INTENT_LABEL[r.classification] ?? r.classification}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/panel/inbox/${r.id}`}
                    className="text-brand-bone hover:text-brand-goldHi font-medium"
                  >
                    {r.subject ?? "(ללא נושא)"}
                  </Link>
                  <div className="text-brand-boneDim text-xs mt-0.5">
                    {r.from_addr ?? "—"}{" "}
                    {r.company_name && (
                      <span className="text-brand-gold">· {r.company_name}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-boneDim text-xs w-32">
                  {r.held_for_review === 1 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                      ממתין לסקירה
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-brand-boneDim text-xs w-40 text-end">
                  {new Date(r.created_at + "Z").toLocaleString("he-IL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filters({ current }: { current: string }) {
  const tabs = [
    { v: "all", l: "הכל" },
    { v: "matched", l: "מותאמים ללידים" },
    { v: "held", l: "ממתינים לסקירה" },
    { v: "opt_out", l: "ביטולים" },
    { v: "unmatched", l: "לא מותאמים" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((t) => (
        <a
          key={t.v}
          href={`/panel/inbox?filter=${t.v}`}
          className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
            current === t.v
              ? "bg-brand-gold/15 text-brand-goldHi border-brand-gold/40"
              : "border-brand-line text-brand-boneDim hover:text-brand-bone hover:border-brand-bone"
          }`}
        >
          {t.l}
        </a>
      ))}
    </div>
  );
}
