"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

export function SendModeToggle({
  initial,
  gmailConfigured,
}: {
  initial: "dryrun" | "smtp";
  gmailConfigured: boolean;
}) {
  const [mode, setMode] = useState<"dryrun" | "smtp">(initial);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function setTo(next: "dryrun" | "smtp") {
    if (next === "smtp" && !gmailConfigured) return;
    if (next === "smtp" && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setSaving(true);
    const prev = mode;
    setMode(next);
    try {
      const res = await fetch("/api/panel/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ send_mode: next }),
      });
      if (!res.ok) setMode(prev);
    } catch {
      setMode(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTo("dryrun")}
          disabled={saving}
          className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
            mode === "dryrun"
              ? "bg-brand-gold/15 border-brand-gold/40 text-brand-goldHi"
              : "border-brand-line text-brand-boneDim hover:text-brand-bone"
          }`}
        >
          Dry-run (קבצי .eml)
        </button>
        <button
          onClick={() => setTo("smtp")}
          disabled={saving || !gmailConfigured}
          className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
            mode === "smtp"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "border-brand-line text-brand-boneDim hover:text-brand-bone disabled:opacity-40"
          }`}
        >
          Live (Gmail SMTP)
        </button>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-brand-boneDim" />}
      </div>
      {!gmailConfigured && (
        <div className="text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          GMAIL_USER ו-GMAIL_APP_PASSWORD חסרים ב-.env.local
        </div>
      )}
      {confirming && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-md p-3 text-xs text-red-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">
              אתה עומד להפעיל שליחה חיה. מיילים יוצאו לתיבות אמיתיות.
            </span>
          </div>
          <div>וודא שיש לך לפחות ליד בדיקה אחד שאתה הבעלים של תיבת המייל שלו.</div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setTo("smtp")}
              className="px-2.5 py-1 rounded bg-red-500 text-white"
            >
              כן, הפעל Live
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2.5 py-1 rounded border border-brand-line text-brand-boneDim"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
