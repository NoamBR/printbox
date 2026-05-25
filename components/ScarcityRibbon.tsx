import { Tag } from "lucide-react";

export default function ScarcityRibbon() {
  return (
    <div
      className="relative bg-brand-gold text-brand-onEspresso"
      role="region"
      aria-label="הצעת השקה"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center text-xs sm:text-sm lg:text-base">
        <div className="flex items-center gap-2">
          <Tag className="size-4 shrink-0" strokeWidth={2} />
          <span className="font-display italic font-semibold">מבצע השקה</span>
        </div>
        <p className="font-medium">
          <span className="font-semibold">15% הנחה</span> על הזמנה ראשונה ·{" "}
          <span className="font-display italic">תקף עד 31.7</span>
        </p>
      </div>
    </div>
  );
}
