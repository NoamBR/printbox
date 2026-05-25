"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AutoReplyToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !on;
    setOn(next);
    try {
      await fetch("/api/panel/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ auto_reply_enabled: next ? "true" : "false" }),
      });
    } catch {
      setOn(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border transition-colors ${
        on
          ? "bg-brand-gold/15 border-brand-gold/40 text-brand-goldHi"
          : "bg-brand-surfaceHi border-brand-line text-brand-boneDim"
      }`}
    >
      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          on ? "bg-brand-gold" : "bg-brand-line"
        }`}
      />
      מענה אוטומטי: {on ? "פעיל" : "כבוי"}
    </button>
  );
}
