"use client";

import { Sparkles, Truck, Package } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const items = [
  {
    n: "01",
    icon: Sparkles,
    title: "אריזות שהלקוחות זוכרים",
    body: "חומרי גלם נבחרים, הדפסה ב-4 צבעים מלאים, גימור עמיד למים ושומן.",
  },
  {
    n: "02",
    icon: Truck,
    title: "ליווי אישי מהסקיצה למוצר",
    body: "צוות עיצוב פנימי, אישור דיגיטלי בכל שלב, ייצור באיכות הגבוהה ביותר.",
  },
  {
    n: "03",
    icon: Package,
    title: "מתחילים מ-1,000 יחידות בלבד",
    body: "MOQ נמוך במיוחד — מתאים גם לקפה שכונתי וגם לרשת ארצית.",
  },
];

export default function ValueStrip() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative border-y border-brand-line"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--c-accent) / 0.22) 0%, rgb(var(--c-accent) / 0.12) 100%)",
      }}
      aria-label="ערכים מרכזיים"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-right mb-8 lg:mb-10"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase">
            <span className="font-display italic me-2">Values</span>· הערכים שלנו
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {items.map((it, i) => (
            <motion.article
              key={it.title}
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="relative text-right rounded-sm p-6 lg:p-8 bg-brand-surface border border-brand-line hover:border-brand-gold/60 transition-colors duration-300 overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="hidden md:inline absolute top-3 left-5 font-display italic text-brand-gold/15 leading-none select-none"
                style={{ fontSize: "84px" }}
              >
                {it.n}
              </span>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-brand-gold text-brand-onEspresso mb-6">
                <it.icon className="size-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium text-brand-bone mb-3 leading-snug">
                {it.title}
              </h3>
              <p className="text-base text-brand-boneDim leading-relaxed">
                {it.body}
              </p>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-brand-gold/70 to-transparent opacity-60"
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
