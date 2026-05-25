"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type RenderedTouch = {
  step: number;
  offset_days: number;
  subject: string;
  body: string;
  warnings: string[];
};

type Prospect = { id: number; company_name: string; email: string };

export function TemplatePreview({ prospects }: { prospects: Prospect[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(
    prospects[0]?.id ?? null
  );
  const [data, setData] = useState<{ rendered: RenderedTouch[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`/api/panel/preview/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [selectedId]);

  if (!prospects.length) {
    return (
      <div className="bg-brand-surface border border-brand-line rounded-lg p-8 text-center text-brand-boneDim text-sm">
        ייבא לידים תחילה כדי לצפות בתבניות מולאות
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <label className="text-sm text-brand-boneDim">תצוגה עבור:</label>
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(parseInt(e.target.value, 10))}
          className="bg-brand-surface border border-brand-line rounded-md px-3 py-1.5 text-sm text-brand-bone"
        >
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name} ({p.email})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-brand-boneDim text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> מרנדר…
        </div>
      )}

      {data?.rendered.map((r) => (
        <div
          key={r.step}
          className="bg-brand-surface border border-brand-line rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-brand-surfaceHi border-b border-brand-line">
            <span className="text-brand-goldHi font-medium text-sm">
              Touch {r.step}
            </span>
            <span className="text-brand-boneDim text-xs">
              T+{r.offset_days} ימים
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-brand-boneDim text-[11px] uppercase tracking-wider mb-1">
                נושא ({r.subject.length} תווים)
              </div>
              <div className="text-brand-bone font-medium">{r.subject}</div>
            </div>
            <div>
              <div className="text-brand-boneDim text-[11px] uppercase tracking-wider mb-1">
                גוף
              </div>
              <pre className="text-brand-bone text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {r.body}
              </pre>
            </div>
            {r.warnings.length > 0 && (
              <div className="text-red-300 text-xs border-t border-brand-line pt-2">
                ⚠ {r.warnings.join(" · ")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
