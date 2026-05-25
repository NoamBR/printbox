const LABEL: Record<string, string> = {
  new: "חדש",
  in_sequence: "ברצף",
  replied: "השיב",
  opted_out: "ביטל",
  completed: "הושלם",
  error: "שגיאה",
};

const STYLE: Record<string, string> = {
  new: "bg-brand-surfaceHi text-brand-bone border-brand-line",
  in_sequence: "bg-brand-gold/15 text-brand-goldHi border-brand-gold/40",
  replied: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  opted_out: "bg-brand-line text-brand-boneDim border-brand-line",
  completed: "bg-brand-gold/10 text-brand-gold border-brand-gold/30",
  error: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${
        STYLE[status] ?? STYLE.new
      }`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
