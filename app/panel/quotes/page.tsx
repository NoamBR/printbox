import Link from "next/link";
import { getDb, QuoteRow } from "@/lib/db";

export const dynamic = "force-dynamic";

type QuoteWithAgg = QuoteRow & { item_count: number; total_qty: number };

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  PENDING_OWNER_APPROVAL: { label: "ממתין לאישור", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  APPROVED: { label: "אושר", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  REJECTED: { label: "נדחה", tone: "bg-red-500/15 text-red-300 border-red-500/30" },
  SENT_TO_CLIENT: { label: "נשלח ללקוח", tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  CLIENT_RESPONDED: { label: "תגובת לקוח", tone: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
};

export default async function QuotesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const db = getDb();

  const where = status && status !== "all" ? "WHERE status = ?" : "";
  const params: string[] = status && status !== "all" ? [status] : [];

  const quotes = db
    .prepare(
      `SELECT q.*,
              (SELECT COUNT(*) FROM quote_items WHERE quote_id = q.id) AS item_count,
              (SELECT IFNULL(SUM(quantity), 0) FROM quote_items WHERE quote_id = q.id) AS total_qty
       FROM quotes q
       ${where}
       ORDER BY q.created_at DESC LIMIT 500`
    )
    .all(...params) as QuoteWithAgg[];

  const pendingCount = (db
    .prepare(
      "SELECT COUNT(*) AS c FROM quotes WHERE status = 'PENDING_OWNER_APPROVAL'"
    )
    .get() as { c: number }).c;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-bone">הצעות מחיר</h1>
          <p className="text-brand-boneDim text-sm mt-1">
            סקירה, אישור וקביעת מחיר ללקוחות שמילאו את סל ההצעות באתר
          </p>
        </div>
        <div className="text-sm">
          <span className="text-brand-boneDim">ממתינות לטיפול:</span>{" "}
          <span className="font-semibold text-amber-300">{pendingCount}</span>
        </div>
      </div>

      <FilterBar current={status ?? "all"} />

      {quotes.length === 0 ? (
        <div className="rounded-md border border-brand-line bg-brand-surface p-10 text-center text-brand-boneDim">
          אין הצעות תואמות לסינון.
        </div>
      ) : (
        <div className="rounded-md border border-brand-line bg-brand-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-surfaceHi border-b border-brand-line text-brand-boneDim text-xs uppercase tracking-wider">
              <tr>
                <th className="text-right px-4 py-3">מזהה</th>
                <th className="text-right px-4 py-3">חברה</th>
                <th className="text-right px-4 py-3">איש קשר</th>
                <th className="text-right px-4 py-3">פריטים</th>
                <th className="text-right px-4 py-3">סטטוס</th>
                <th className="text-right px-4 py-3">נוצר</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {quotes.map((q) => {
                const meta = STATUS_LABEL[q.status] ?? {
                  label: q.status,
                  tone: "bg-brand-surfaceHi text-brand-boneDim border-brand-line",
                };
                return (
                  <tr
                    key={q.id}
                    className={
                      q.status === "PENDING_OWNER_APPROVAL"
                        ? "bg-amber-500/[0.04]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 font-mono text-brand-gold text-xs">
                      {q.public_id}
                    </td>
                    <td className="px-4 py-3 text-brand-bone">{q.client_company}</td>
                    <td className="px-4 py-3 text-brand-boneDim">
                      <div>{q.client_name}</div>
                      <div className="text-xs text-brand-boneDim/70" dir="ltr">
                        {q.client_email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-boneDim">
                      {q.item_count} פריטים ·{" "}
                      <span className="text-brand-bone tabular-nums">
                        {q.total_qty.toLocaleString("he-IL")}
                      </span>{" "}
                      יח&apos;
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs border ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-boneDim text-xs">
                      {new Date(q.created_at + "Z").toLocaleString("he-IL")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/panel/quotes/${q.id}`}
                        className="text-brand-gold hover:text-brand-goldHi text-xs"
                      >
                        פתיחה ←
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterBar({ current }: { current: string }) {
  const tabs = [
    { v: "all", l: "הכל" },
    { v: "PENDING_OWNER_APPROVAL", l: "ממתינות" },
    { v: "APPROVED", l: "אושרו" },
    { v: "REJECTED", l: "נדחו" },
    { v: "SENT_TO_CLIENT", l: "נשלחו" },
    { v: "CLIENT_RESPONDED", l: "תגובות" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((t) => (
        <a
          key={t.v}
          href={`/panel/quotes${t.v === "all" ? "" : `?status=${t.v}`}`}
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
