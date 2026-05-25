"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ParseResult = {
  valid: Record<string, string>[];
  errors: { row: number; messages: string[] }[];
  total: number;
};

export function CsvUploader() {
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [imported, setImported] = useState<{
    inserted: number;
    skipped: number;
  } | null>(null);
  const router = useRouter();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setImported(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/panel/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setResult(data);
    setParsing(false);
  }

  async function confirmImport() {
    if (!result?.valid.length) return;
    setImporting(true);
    const res = await fetch("/api/panel/prospects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows: result.valid }),
    });
    const data = await res.json();
    setImported(data);
    setImporting(false);
    setTimeout(() => router.push("/panel/prospects"), 800);
  }

  return (
    <div className="space-y-6">
      <label className="block bg-brand-surface border-2 border-dashed border-brand-line hover:border-brand-gold/50 rounded-lg p-10 text-center cursor-pointer transition-colors">
        <Upload className="w-8 h-8 mx-auto text-brand-boneDim mb-3" />
        <div className="text-brand-bone font-medium">בחר קובץ CSV</div>
        <div className="text-brand-boneDim text-xs mt-1">
          חובה: company_name, industry_he, first_name, email, city
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="hidden"
          disabled={parsing}
        />
      </label>

      {parsing && (
        <div className="flex items-center gap-2 text-brand-boneDim text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          מנתח קובץ…
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card label="סך הכל" value={result.total} />
            <Card label="תקינים" value={result.valid.length} accent="ok" />
            <Card label="שגויים" value={result.errors.length} accent={result.errors.length ? "err" : undefined} />
          </div>

          {result.errors.length > 0 && (
            <div className="bg-brand-surface border border-red-500/30 rounded-lg p-4">
              <div className="text-red-300 text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                שורות עם בעיות
              </div>
              <ul className="text-xs text-brand-boneDim space-y-1 max-h-48 overflow-auto">
                {result.errors.slice(0, 20).map((e) => (
                  <li key={e.row}>
                    שורה {e.row}: {e.messages.join(", ")}
                  </li>
                ))}
                {result.errors.length > 20 && (
                  <li>+{result.errors.length - 20} נוספות…</li>
                )}
              </ul>
            </div>
          )}

          {result.valid.length > 0 && !imported && (
            <button
              onClick={confirmImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-gold text-brand-noir font-medium text-sm hover:bg-brand-goldHi disabled:opacity-50 transition-colors"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              ייבא {result.valid.length} לידים
            </button>
          )}

          {imported && (
            <div className="bg-brand-gold/10 border border-brand-gold/40 rounded-lg p-4 text-sm text-brand-goldHi">
              נוספו {imported.inserted} לידים · דולגו {imported.skipped} (אימייל קיים)
              <div className="text-brand-boneDim text-xs mt-1">מעביר לרשימת הלידים…</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: number; accent?: "ok" | "err" }) {
  const color =
    accent === "ok"
      ? "text-brand-goldHi"
      : accent === "err"
      ? "text-red-300"
      : "text-brand-bone";
  return (
    <div className="bg-brand-surface border border-brand-line rounded-lg p-4 text-center">
      <div className="text-brand-boneDim text-xs uppercase tracking-wider">{label}</div>
      <div className={`font-serif text-2xl mt-1 ${color}`}>{value}</div>
    </div>
  );
}
