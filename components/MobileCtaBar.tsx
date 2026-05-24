"use client";

export default function MobileCtaBar() {
  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-brand-line shadow-[0_-8px_24px_rgba(120,53,15,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="פעולה ראשית"
    >
      <div className="px-4 py-3">
        <a
          href="#quote"
          className="flex items-center justify-center min-h-[52px] w-full rounded-xl bg-brand-amber text-white font-semibold text-base shadow-soft active:scale-[0.98] transition-transform"
        >
          קבלו הצעת מחיר
        </a>
      </div>
    </div>
  );
}
