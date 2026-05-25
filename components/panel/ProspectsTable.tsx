"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { Play, Ban, Loader2 } from "lucide-react";

type Prospect = {
  id: number;
  company_name: string;
  industry_he: string;
  first_name: string;
  city: string;
  email: string;
  status: string;
  touch_1_sent_at: string | null;
  touch_2_sent_at: string | null;
  touch_3_sent_at: string | null;
  opted_out: 0 | 1;
};

export function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "warn" | "err"; msg: string } | null>(null);
  const router = useRouter();

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === prospects.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(prospects.map((p) => p.id)));
    }
  }

  async function startSequence() {
    if (!selected.size) {
      setToast({ kind: "warn", msg: "סמן לפחות ליד אחד עם ה-checkbox" });
      return;
    }
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch("/api/panel/sequence/force-send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prospect_ids: [...selected], step: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ kind: "err", msg: `שגיאה: ${JSON.stringify(data).slice(0, 200)}` });
      } else if (data.sent > 0 && data.failed === 0) {
        setToast({
          kind: "ok",
          msg: `נשלח ${data.sent} מייל (mode: ${data.mode})`,
        });
      } else if (data.sent > 0) {
        setToast({
          kind: "warn",
          msg: `נשלחו ${data.sent}, נכשלו ${data.failed}. ראה לוח אירועים.`,
        });
      } else {
        const firstErr = data.results?.[0]?.error ?? "לא ידוע";
        setToast({ kind: "err", msg: `לא נשלח: ${firstErr}` });
      }
      setSelected(new Set());
    } catch (err) {
      setToast({ kind: "err", msg: "שגיאת רשת" });
    } finally {
      setBusy(false);
      startTransition(() => router.refresh());
    }
  }

  async function optOutSelected() {
    if (!selected.size) return;
    setBusy(true);
    await Promise.all(
      [...selected].map((id) =>
        fetch(`/api/panel/prospects/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ opted_out: true }),
        })
      )
    );
    setSelected(new Set());
    setBusy(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div
          className={`px-4 py-2.5 rounded-md text-sm border ${
            toast.kind === "ok"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : toast.kind === "warn"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-red-500/15 border-red-500/40 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-brand-boneDim">
          סומנו: {selected.size} מתוך {prospects.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startSequence}
            disabled={!selected.size || busy}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-gold text-brand-noir text-xs font-medium hover:bg-brand-goldHi disabled:opacity-40 transition-colors"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            הפעל ושלח עכשיו
          </button>
          <button
            onClick={optOutSelected}
            disabled={!selected.size || busy}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-brand-line text-brand-boneDim text-xs hover:text-brand-bone hover:border-brand-bone disabled:opacity-40 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            סמן ביטול
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-surfaceHi text-brand-boneDim text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 w-10">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selected.size === prospects.length && prospects.length > 0}
                  className="accent-brand-gold"
                />
              </th>
              <th className="px-3 py-2.5 text-right">חברה</th>
              <th className="px-3 py-2.5 text-right">תעשייה</th>
              <th className="px-3 py-2.5 text-right">איש קשר</th>
              <th className="px-3 py-2.5 text-right">עיר</th>
              <th className="px-3 py-2.5 text-right">סטטוס</th>
              <th className="px-3 py-2.5 text-right">T1 / T2 / T3</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {prospects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-brand-boneDim">
                  אין לידים — עברו ל"ייבוא CSV"
                </td>
              </tr>
            )}
            {prospects.map((p) => (
              <tr key={p.id} className="hover:bg-brand-surfaceHi/50">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="accent-brand-gold"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/panel/prospects/${p.id}`}
                    className="text-brand-bone hover:text-brand-goldHi"
                  >
                    {p.company_name}
                  </Link>
                  <div className="text-brand-boneDim text-xs">{p.email}</div>
                </td>
                <td className="px-3 py-2.5 text-brand-boneDim">{p.industry_he}</td>
                <td className="px-3 py-2.5 text-brand-bone">{p.first_name}</td>
                <td className="px-3 py-2.5 text-brand-boneDim">{p.city}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-2.5 text-brand-boneDim text-xs">
                  <Dot ok={!!p.touch_1_sent_at} /> · <Dot ok={!!p.touch_2_sent_at} /> · <Dot ok={!!p.touch_3_sent_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending && <div className="text-xs text-brand-boneDim">מעדכן…</div>}
    </div>
  );
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        ok ? "bg-brand-gold" : "bg-brand-line"
      }`}
    />
  );
}
