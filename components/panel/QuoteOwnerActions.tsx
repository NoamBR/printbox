"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Send, X } from "lucide-react";

type Props = {
  quoteId: number;
  status: string;
  finalPriceIls: number | null;
  finalPriceNotes: string | null;
};

export default function QuoteOwnerActions({
  quoteId,
  status,
  finalPriceIls,
  finalPriceNotes,
}: Props) {
  const router = useRouter();
  const [price, setPrice] = useState<string>(
    finalPriceIls != null ? String(finalPriceIls) : ""
  );
  const [notes, setNotes] = useState<string>(finalPriceNotes ?? "");
  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function call(action: string, body?: unknown) {
    setBusy(action);
    setError(null);
    setInfo(null);
    try {
      const url =
        action === "send"
          ? `/api/panel/quotes/${quoteId}/send`
          : `/api/panel/quotes/${quoteId}`;
      const method = action === "send" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      if (action === "send") setInfo("המייל נשלח ללקוח.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const priceParsed = parseInt(price, 10);
  const priceValid = Number.isFinite(priceParsed) && priceParsed > 0;
  const canSend =
    status === "APPROVED" && finalPriceIls != null && finalPriceIls > 0;
  const isDecided = status !== "PENDING_OWNER_APPROVAL";

  return (
    <section className="rounded-md border border-brand-line bg-brand-surface p-5 space-y-5 text-right">
      <div className="text-xs uppercase tracking-wider text-brand-boneDim">
        פעולות בעלים
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="sm:col-span-1 block">
          <span className="block text-xs text-brand-boneDim mb-1.5">
            מחיר סופי (₪)
          </span>
          <input
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full min-h-[44px] px-3 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone text-end focus:border-brand-gold focus:outline-none"
          />
        </label>
        <label className="sm:col-span-2 block">
          <span className="block text-xs text-brand-boneDim mb-1.5">
            הערות למחיר (אופציונלי, יוצג ללקוח)
          </span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone resize-none focus:border-brand-gold focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          disabled={!priceValid || !!busy}
          onClick={() =>
            call("set_price", {
              action: "set_price",
              priceIls: priceParsed,
              priceNotes: notes.trim() || undefined,
            })
          }
          className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone text-sm hover:border-brand-gold disabled:opacity-50"
        >
          {busy === "set_price" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          שמירת מחיר
        </button>

        {!isDecided && (
          <>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => call("approve", { action: "approve" })}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-sm bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm disabled:opacity-50"
            >
              {busy === "approve" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              אישור הצעה
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => call("reject", { action: "reject" })}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-sm bg-red-600/80 hover:bg-red-600 text-white text-sm disabled:opacity-50"
            >
              {busy === "reject" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
              דחייה
            </button>
          </>
        )}

        <button
          type="button"
          disabled={!canSend || !!busy}
          onClick={() => call("send")}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-sm bg-brand-gold text-brand-onEspresso text-sm font-semibold hover:bg-brand-goldHi disabled:opacity-50"
          title={!canSend ? "מחיר חייב להיות מוגדר וההצעה מאושרת" : ""}
        >
          {busy === "send" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          שליחה ללקוח
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-sm px-3 py-2">
          {error}
        </p>
      )}
      {info && (
        <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 rounded-sm px-3 py-2">
          {info}
        </p>
      )}
    </section>
  );
}
