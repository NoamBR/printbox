import { Box } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "#products", label: "מוצרים" },
  { href: "#quote", label: "הצעת מחיר" },
];

export default function StickyNav() {
  return (
    <nav
      className="sticky top-0 z-40 bg-brand-noir/85 backdrop-blur-md border-b border-brand-line"
      aria-label="ניווט קבוע"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="#quote"
            className="inline-flex items-center min-h-[44px] px-5 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-sm hover:bg-brand-goldHi transition-colors"
          >
            קבלו הצעה
          </a>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-4 lg:gap-7">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden sm:inline-block text-sm font-medium text-brand-boneDim hover:text-brand-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#"
            dir="ltr"
            className="flex items-center gap-2 font-serif text-xl text-brand-bone"
          >
            <Box className="size-5 text-brand-gold" />
            <span>Print<span className="italic font-display text-brand-gold">Box</span></span>
          </a>
        </div>
      </div>
    </nav>
  );
}
