import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb, MessageRow, ProspectRow } from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mid = parseInt(id, 10);
  const db = getDb();
  const m = db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(mid) as MessageRow | undefined;
  if (!m) notFound();
  const prospect = m.prospect_id
    ? (db
        .prepare("SELECT * FROM prospects WHERE id = ?")
        .get(m.prospect_id) as ProspectRow)
    : null;
  const thread = m.prospect_id
    ? (db
        .prepare(
          "SELECT * FROM messages WHERE prospect_id = ? ORDER BY id ASC"
        )
        .all(m.prospect_id) as MessageRow[])
    : [m];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/panel/inbox"
          className="inline-flex items-center gap-1 text-brand-boneDim hover:text-brand-bone text-xs mb-3"
        >
          <ArrowRight className="w-3 h-3" />
          חזרה לתיבה
        </Link>
        <h1 className="font-serif text-2xl text-brand-bone">
          {prospect?.company_name ?? "(לא מותאם לליד)"}
        </h1>
        {prospect && (
          <p className="text-brand-boneDim text-sm mt-1">
            {prospect.industry_he} · {prospect.city} ·{" "}
            <Link
              href={`/panel/prospects/${prospect.id}`}
              className="text-brand-gold hover:underline"
            >
              פרופיל ליד
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-3">
        {thread.map((msg) => {
          const isOut = msg.direction === "out";
          return (
            <div
              key={msg.id}
              className={`rounded-lg border overflow-hidden ${
                isOut
                  ? "bg-brand-surface border-brand-line"
                  : "bg-brand-surfaceHi border-brand-gold/30"
              }`}
            >
              <div className="px-4 py-2.5 border-b border-brand-line flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      isOut
                        ? "bg-brand-line text-brand-boneDim"
                        : "bg-brand-gold/20 text-brand-goldHi"
                    }`}
                  >
                    {isOut ? "PrintBox →" : "← ליד"}
                  </span>
                  {msg.step ? (
                    <span className="text-brand-boneDim">Touch {msg.step}</span>
                  ) : null}
                  {msg.auto_replied === 1 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      תגובה אוטומטית
                    </span>
                  )}
                  {msg.classification && (
                    <span className="text-brand-boneDim">
                      {msg.classification} ({(msg.confidence ?? 0).toFixed(2)})
                    </span>
                  )}
                  {msg.held_for_review === 1 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ממתין לסקירה
                    </span>
                  )}
                </div>
                <time className="text-brand-boneDim">
                  {new Date(msg.created_at + "Z").toLocaleString("he-IL")}
                </time>
              </div>
              <div className="px-4 py-3">
                <div className="text-brand-bone font-medium text-sm mb-2">
                  {msg.subject ?? "(ללא נושא)"}
                </div>
                <pre className="text-brand-bone text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.body ?? ""}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
