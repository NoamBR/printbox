import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "gold" | "neutral";
}) {
  return (
    <div className="bg-brand-surface border border-brand-line rounded-lg p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <span className="text-brand-boneDim text-xs uppercase tracking-wider">
          {label}
        </span>
        <Icon
          className={`w-4 h-4 ${
            accent === "gold" ? "text-brand-gold" : "text-brand-boneDim"
          }`}
        />
      </div>
      <div
        className={`font-serif text-3xl ${
          accent === "gold" ? "text-brand-goldHi" : "text-brand-bone"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="text-brand-boneDim text-xs mt-2">{hint}</div>
      )}
    </div>
  );
}
