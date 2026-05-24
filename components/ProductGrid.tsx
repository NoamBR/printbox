"use client";

import ProductCard from "./ProductCard";
import { StaggerParent, StaggerChild } from "@/components/motion/Stagger";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const products = [
  {
    title: "כוסות נייר ממותגות",
    spec: "הדפסה מלאה ב-4 צבעים | 4oz–16oz | מתאים לחם וקר",
    accent: "#92400E",
    illustration: (
      <svg viewBox="0 0 120 150" className="w-32 h-40" aria-hidden="true">
        <ellipse cx="60" cy="14" rx="40" ry="7" fill="#FDE68A" stroke="#92400E" strokeWidth="1.4" />
        <path d="M22 14 L98 14 L88 140 L32 140 Z" fill="#FFFFFF" stroke="#92400E" strokeWidth="1.4" />
        <rect x="40" y="55" width="40" height="40" rx="4" fill="#92400E" />
        <text x="60" y="80" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFBEB" fontFamily="var(--font-heebo-hebrew), sans-serif">המותג</text>
      </svg>
    ),
  },
  {
    title: "מנשאי כוסות",
    spec: "‎2 ו-4 כוסות | קרטון ממוחזר | לוגו מובלט אופציונלי",
    accent: "#78350F",
    illustration: (
      <svg viewBox="0 0 160 110" className="w-44 h-32" aria-hidden="true">
        <rect x="8" y="28" width="144" height="72" rx="6" fill="#92400E" stroke="#78350F" strokeWidth="1.4" />
        {[24, 60, 96, 132].map((cx) => (
          <circle key={cx} cx={cx} cy={56} r={13} fill="#FFFBEB" stroke="#78350F" strokeWidth="1.2" />
        ))}
        <rect x="58" y="10" width="44" height="14" rx="3" fill="#78350F" />
      </svg>
    ),
  },
  {
    title: "מארזי מזון (Take-Away)",
    spec: "קרטון מצופה | מידות שונות | חיתוך מותאם אישית",
    accent: "#D97706",
    illustration: (
      <svg viewBox="0 0 150 110" className="w-40 h-32" aria-hidden="true">
        <path d="M14 28 L75 8 L136 28 L136 96 L14 96 Z" fill="#FFFBEB" stroke="#92400E" strokeWidth="1.4" />
        <line x1="75" y1="8" x2="75" y2="96" stroke="#92400E" strokeWidth="1" strokeDasharray="3 2" />
        <rect x="48" y="48" width="54" height="18" rx="2" fill="#D97706" />
        <text x="75" y="61" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFFBEB" fontFamily="var(--font-heebo-hebrew), sans-serif">לוגו</text>
      </svg>
    ),
  },
  {
    title: "קופסאות משלוח ממותגות",
    spec: "קרטון גלי 3-שכבות | הדפסה פנים וחוץ | אריזה מהירה",
    accent: "#A16207",
    illustration: (
      <svg viewBox="0 0 160 120" className="w-44 h-32" aria-hidden="true">
        <path d="M14 38 L80 14 L146 38 L146 100 L80 116 L14 100 Z" fill="#78350F" stroke="#3B1A05" strokeWidth="1.4" />
        <path d="M14 38 L80 62 L146 38" fill="none" stroke="#3B1A05" strokeWidth="1.4" />
        <path d="M80 62 L80 116" stroke="#3B1A05" strokeWidth="1.2" />
        <rect x="58" y="76" width="44" height="14" rx="2" fill="#FFFBEB" />
        <text x="80" y="86" textAnchor="middle" fontSize="9" fontWeight="700" fill="#78350F" fontFamily="var(--font-heebo-hebrew), sans-serif">המותג</text>
      </svg>
    ),
  },
];

export default function ProductGrid() {
  return (
    <section id="products" className="bg-brand-cream" aria-labelledby="products-heading">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <RevealOnScroll>
          <div className="text-right mb-12 lg:mb-16 max-w-2xl">
            <p className="text-sm font-semibold text-brand-amber uppercase tracking-wide mb-3">
              קטלוג המוצרים
            </p>
            <h2
              id="products-heading"
              className="text-[clamp(28px,4vw,40px)] font-bold text-brand-espresso leading-tight"
            >
              המוצרים שלנו
            </h2>
            <p className="mt-3 text-lg text-brand-ink/80">
              ארבעה קווי מוצר עיקריים — כולם ניתנים להתאמה מלאה למיתוג שלכם.
            </p>
          </div>
        </RevealOnScroll>

        {/* Desktop grid */}
        <div className="hidden md:block">
          <StaggerParent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((p) => (
              <StaggerChild key={p.title}>
                <ProductCard {...p} />
              </StaggerChild>
            ))}
          </StaggerParent>
        </div>

        {/* Mobile RTL snap carousel */}
        <div
          className="md:hidden snap-carousel scrollbar-hide flex gap-4 overflow-x-auto -mx-6 px-6 pb-2"
          dir="rtl"
        >
          {products.map((p) => (
            <div key={p.title} className="shrink-0 w-[78vw] max-w-sm">
              <ProductCard {...p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
