"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";

export function RunTickButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/sequence/tick", { method: "POST" });
      const data = await res.json();
      const total =
        (data.sentByStep?.[1] ?? 0) +
        (data.sentByStep?.[2] ?? 0) +
        (data.sentByStep?.[3] ?? 0);
      setMsg(
        `נשלחו ${total} (T1:${data.sentByStep?.[1] ?? 0} / T2:${
          data.sentByStep?.[2] ?? 0
        } / T3:${data.sentByStep?.[3] ?? 0}), דולגו: ${data.skipped ?? 0}`
      );
      router.refresh();
    } catch {
      setMsg("שגיאה בהרצת tick");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-gold text-brand-noir font-medium text-sm hover:bg-brand-goldHi disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        הרץ סבב שליחה
      </button>
      {msg && <span className="text-xs text-brand-boneDim">{msg}</span>}
    </div>
  );
}
