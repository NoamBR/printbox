"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Loader2 } from "lucide-react";

export function SyncInboxButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/inbox/poll", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`שגיאה: ${data.error ?? "לא ידועה"}`);
      } else {
        setMsg(
          `נמשכו ${data.fetched}, התאמו ${data.matched}, מענה אוטומטי ${data.auto_replied}, מוחזקים לסקירה ${data.held}, opt-out ${data.opted_out}`
        );
      }
      router.refresh();
    } catch (err) {
      setMsg("שגיאה בסנכרון");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-brand-gold/40 text-brand-goldHi font-medium text-sm hover:bg-brand-gold/15 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Inbox className="w-4 h-4" />
        )}
        סנכרן תיבה
      </button>
      {msg && (
        <span className="text-xs text-brand-boneDim truncate max-w-md">{msg}</span>
      )}
    </div>
  );
}
