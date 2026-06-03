import Link from "next/link";
import { ShoppingBag, Sparkles, Clock, ShieldCheck } from "lucide-react";

const reasons = [
  { Icon: Sparkles, text: "מענה מותאם מהמעצבים שלנו, לא בוט." },
  { Icon: Clock, text: "הצעת מחיר מותאמת ומפורטת לעסק שלכם." },
  { Icon: ShieldCheck, text: "מחיר יצרן · ללא התחייבות · הצעה כתובה." },
];

export default function QuoteCta() {
  return (
    <section
      id="quote"
      className="bg-brand-surfaceHi scroll-mt-24 border-t border-brand-line"
      aria-labelledby="quote-heading"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-3 text-right">
            <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-4">
              <span className="font-display italic me-2">Begin</span>· מתחילים
            </p>
            <h2
              id="quote-heading"
              className="font-serif text-[clamp(28px,4.5vw,64px)] font-medium text-brand-bone leading-[1.05] mb-6"
            >
              בונים{" "}
              <span className="italic font-display font-light text-brand-gold">
                סל הצעות
              </span>{" "}
              ושולחים בקליק
            </h2>
            <p className="text-lg text-brand-boneDim leading-relaxed mb-8 max-w-xl">
              ‎דפדפו בקטלוג, הוסיפו את המוצרים שמעניינים אתכם עם פרטי המיתוג —
              מידות, גימור והערות — ושלחו בבת אחת. נחזור עם הצעת מחיר מקיפה
              ומותאמת לעסק שלכם.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 min-h-[54px] px-8 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-base shadow-soft hover:bg-brand-goldHi transition-colors"
            >
              <ShoppingBag className="size-5" strokeWidth={1.6} />
              לקטלוג ולסל
            </Link>
          </div>
          <ul className="lg:col-span-2 space-y-4 text-right">
            {reasons.map((r) => (
              <li
                key={r.text}
                className="flex items-start gap-3 rounded-sm bg-brand-surface border border-brand-line p-4"
              >
                <span className="shrink-0 w-9 h-9 rounded-sm bg-brand-gold text-brand-onEspresso flex items-center justify-center">
                  <r.Icon className="size-4" strokeWidth={1.8} />
                </span>
                <span className="pt-1.5 text-base text-brand-bone">
                  {r.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
