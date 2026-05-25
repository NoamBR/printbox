"use client";

import {
  LayoutGrid,
  Upload,
  CheckCircle2,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Step = { n: number; title: string; body: string; Icon: LucideIcon };

const steps: Step[] = [
  {
    n: 1,
    title: "בוחרים מוצר",
    body: "בחרו מהמוצרים שלנו, או ספרו לנו מה אתם צריכים.",
    Icon: LayoutGrid,
  },
  {
    n: 2,
    title: "מעלים עיצוב",
    body: "שלחו לוגו וקובץ עיצוב, או קבלו ליווי ממעצב שלנו ללא תוספת תשלום.",
    Icon: Upload,
  },
  {
    n: 3,
    title: "מאשרים דוגמה",
    body: "תקבלו דוגמה דיגיטלית תלת-ממדית מותאמת לעיצוב שלכם. רק אחרי אישור — מתחילים בהפקה.",
    Icon: CheckCircle2,
  },
  {
    n: 4,
    title: "מקבלים עד הדלת",
    body: "ייצור, אריזה ומשלוח מקצועי עד הדלת. עם אחריות מלאה על כל הזמנה.",
    Icon: Truck,
  },
];

export default function Process() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative bg-brand-surfaceHi border-y border-brand-line overflow-hidden"
      aria-labelledby="process-heading"
    >
      <span
        aria-hidden="true"
        className="hidden lg:block absolute top-14 left-12 font-display italic text-brand-gold/10 leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
      >
        03
      </span>

      <div className="relative max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-right mb-10 lg:mb-14 max-w-2xl"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-3">
            <span className="font-display italic me-2">Process</span>· איך זה
            עובד
          </p>
          <h2
            id="process-heading"
            className="font-serif text-[clamp(28px,4.5vw,64px)] font-medium text-brand-bone leading-[1.05]"
          >
            <span className="italic font-display font-light text-brand-gold">
              4 צעדים
            </span>{" "}
            מהרעיון למשלוח.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Desktop horizontal line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 inset-x-0 h-px bg-brand-line"
          />
          {/* Mobile vertical line */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute top-0 bottom-0 end-9 w-px bg-brand-line"
          />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                className="relative flex lg:flex-col items-center lg:items-center gap-4 lg:gap-5 text-right lg:text-center"
              >
                <div className="relative z-10 shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-brand-surface border-2 border-brand-gold flex items-center justify-center shadow-soft">
                  <s.Icon
                    className="size-8 lg:size-9 text-brand-gold"
                    strokeWidth={1.4}
                  />
                  <span className="absolute -top-2 -end-2 bg-brand-gold text-brand-onEspresso text-xs font-display italic font-semibold w-8 h-8 rounded-full flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <div className="lg:max-w-[240px]">
                  <h3 className="font-serif text-xl lg:text-2xl text-brand-bone mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-brand-boneDim leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
