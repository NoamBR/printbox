"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Field = {
  key: "email" | "company_name" | "industry_he" | "first_name" | "city";
  label: string;
  placeholder: string;
  type?: string;
};

const FIELDS: Field[] = [
  { key: "email", label: "אימייל", placeholder: "maya@cafe.example", type: "email" },
  { key: "company_name", label: "חברה", placeholder: "קפה לורן" },
  { key: "first_name", label: "שם פרטי", placeholder: "מאיה" },
  { key: "industry_he", label: "תעשייה", placeholder: "בית קפה בוטיק" },
  { key: "city", label: "עיר", placeholder: "תל אביב" },
];

export function QuickAddProspect() {
  const [vals, setVals] = useState<Record<string, string>>({
    email: "",
    company_name: "",
    industry_he: "",
    first_name: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "ok"; msg: string }
    | { kind: "skipped"; msg: string }
    | { kind: "err"; msg: string }
    | null
  >(null);
  const router = useRouter();

  const allFilled = FIELDS.every((f) => vals[f.key].trim().length > 0);

  async function save() {
    if (!allFilled || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/panel/prospects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rows: [
            {
              email: vals.email.trim(),
              company_name: vals.company_name.trim(),
              industry_he: vals.industry_he.trim(),
              first_name: vals.first_name.trim(),
              city: vals.city.trim(),
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "err", msg: data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : "שגיאה" });
      } else if (data.inserted === 1) {
        setStatus({ kind: "ok", msg: `נוסף: ${vals.company_name}` });
        setVals({ email: "", company_name: "", industry_he: "", first_name: "", city: "" });
        router.refresh();
      } else {
        setStatus({ kind: "skipped", msg: "אימייל כבר קיים — דולג" });
      }
    } catch {
      setStatus({ kind: "err", msg: "שגיאת רשת" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-brand-goldHi font-medium">הוסף ליד יחיד</h2>
        <span className="text-brand-boneDim text-xs">או העלה CSV למטה לטעינה מרובה</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <div className="text-brand-boneDim text-[11px] uppercase tracking-wider mb-1">
              {f.label}
            </div>
            <input
              type={f.type ?? "text"}
              value={vals[f.key]}
              onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && allFilled) save();
              }}
              placeholder={f.placeholder}
              className="w-full bg-brand-noir/50 border border-brand-line rounded-md px-3 py-2 text-sm text-brand-bone placeholder:text-brand-boneDim focus:outline-none focus:border-brand-gold/50"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={!allFilled || saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-gold text-brand-noir font-medium text-sm hover:bg-brand-goldHi disabled:opacity-40 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          שמור ליד
        </button>
        {status && (
          <div
            className={`flex items-center gap-2 text-xs ${
              status.kind === "ok"
                ? "text-emerald-300"
                : status.kind === "skipped"
                ? "text-amber-300"
                : "text-red-300"
            }`}
          >
            {status.kind === "ok" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
