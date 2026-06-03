import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDb, QuoteEventRow } from "@/lib/db";
import { loadQuoteWithItems } from "@/lib/quotes";
import QuoteOwnerActions from "@/components/panel/QuoteOwnerActions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  PENDING_OWNER_APPROVAL: { label: "ממתין לאישור", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  APPROVED: { label: "אושר", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  REJECTED: { label: "נדחה", tone: "bg-red-500/15 text-red-300 border-red-500/30" },
  SENT_TO_CLIENT: { label: "נשלח ללקוח", tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  CLIENT_RESPONDED: { label: "תגובת לקוח", tone: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
};

const NOTICE_LABEL: Record<string, { text: string; tone: string }> = {
  approved: {
    text: "ההצעה אושרה. עכשיו אפשר לקבוע מחיר ולשלוח ללקוח.",
    tone: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  },
  rejected: {
    text: "ההצעה נדחתה.",
    tone: "bg-red-500/10 text-red-200 border-red-500/30",
  },
  "already-decided": {
    text: "כבר התקבלה החלטה על ההצעה הזו.",
    tone: "bg-brand-surfaceHi text-brand-boneDim border-brand-line",
  },
};

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const n = parseInt(id, 10);
  if (!Number.isFinite(n) || n <= 0) notFound();
  const data = loadQuoteWithItems(n);
  if (!data) notFound();

  const db = getDb();
  const events = db
    .prepare(
      "SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at ASC"
    )
    .all(n) as QuoteEventRow[];

  const { quote, items } = data;
  const totalQty = items.reduce((a, b) => a + b.quantity, 0);
  const statusMeta = STATUS_LABEL[quote.status] ?? {
    label: quote.status,
    tone: "bg-brand-surfaceHi text-brand-boneDim border-brand-line",
  };
  const noticeMeta = notice ? NOTICE_LABEL[notice] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/panel/quotes"
          className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-goldHi mb-3"
        >
          <ArrowRight className="size-3.5" />
          חזרה לרשימה
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-brand-bone">
              {quote.client_company}
            </h1>
            <p className="text-brand-boneDim text-sm mt-1">
              <span className="font-mono text-brand-gold">{quote.public_id}</span>{" "}
              · {quote.client_name} ·{" "}
              <a
                href={`mailto:${quote.client_email}`}
                className="text-brand-gold hover:underline"
                dir="ltr"
              >
                {quote.client_email}
              </a>{" "}
              ·{" "}
              <span dir="ltr">{quote.client_phone}</span>
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded text-xs border ${statusMeta.tone}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      {noticeMeta && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${noticeMeta.tone}`}
        >
          {noticeMeta.text}
        </div>
      )}

      {quote.client_notes && (
        <div className="rounded-md border border-brand-line bg-brand-surface p-4 text-sm text-brand-bone text-right">
          <div className="text-xs uppercase tracking-wider text-brand-boneDim mb-1.5">
            הערות הלקוח
          </div>
          {quote.client_notes}
        </div>
      )}

      <section className="rounded-md border border-brand-line bg-brand-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-line text-xs uppercase tracking-wider text-brand-boneDim flex items-center justify-between">
          <span>פריטים ({items.length})</span>
          <span>סה&quot;כ {totalQty.toLocaleString("he-IL")} יח&apos;</span>
        </div>
        <div className="divide-y divide-brand-line">
          {items.map((it, idx) => {
            const specs: string[] = [];
            if (it.specs.dimensions) specs.push(`מידות: ${it.specs.dimensions}`);
            if (it.specs.sides) specs.push(`צדדים: ${it.specs.sides}`);
            if (it.specs.finish) specs.push(`גימור: ${it.specs.finish}`);
            if (it.specs.color) specs.push(`צבע: ${it.specs.color}`);
            return (
              <div key={idx} className="px-4 py-4 flex items-start justify-between gap-4 text-right">
                <div className="flex-1">
                  <div className="text-brand-bone font-medium">
                    {it.productTitleHe}{" "}
                    <span className="text-xs text-brand-boneDim font-mono">
                      {it.productId}
                    </span>
                  </div>
                  {specs.length > 0 && (
                    <div className="text-xs text-brand-boneDim mt-1.5">
                      {specs.join(" · ")}
                    </div>
                  )}
                  {it.specs.notes && (
                    <div className="text-xs text-brand-boneDim/80 italic mt-1.5">
                      &ldquo;{it.specs.notes}&rdquo;
                    </div>
                  )}
                </div>
                <div className="text-brand-gold font-semibold tabular-nums whitespace-nowrap">
                  {it.quantity.toLocaleString("he-IL")}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <QuoteOwnerActions
        quoteId={quote.id}
        status={quote.status}
        finalPriceIls={quote.final_price_ils}
        finalPriceNotes={quote.final_price_notes}
      />

      <section className="rounded-md border border-brand-line bg-brand-surface">
        <div className="px-4 py-3 border-b border-brand-line text-xs uppercase tracking-wider text-brand-boneDim">
          יומן פעילות
        </div>
        <ol className="divide-y divide-brand-line text-sm">
          {events.map((e) => (
            <li
              key={e.id}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-right"
            >
              <span className="text-brand-bone">{e.type}</span>
              {e.meta_json && (
                <span className="text-xs text-brand-boneDim font-mono truncate max-w-md">
                  {e.meta_json}
                </span>
              )}
              <span className="text-xs text-brand-boneDim/70 tabular-nums whitespace-nowrap">
                {new Date(e.created_at + "Z").toLocaleString("he-IL")}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
