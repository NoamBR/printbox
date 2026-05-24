"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Truck, Package } from "lucide-react";
import { StaggerParent, StaggerChild } from "@/components/motion/Stagger";
import { duration, ease } from "@/lib/motion";

const items = [
  {
    icon: Sparkles,
    title: "איכות פרימיום",
    body: "חומרי גלם נבחרים, הדפסה ב-4 צבעים מלאים, גימור עמיד למים ושומן.",
  },
  {
    icon: Truck,
    title: "מהסקיצה לדלת ב-14 יום",
    body: "צוות עיצוב פנימי, אישור דיגיטלי תוך 48 שעות, ייצור מהיר ומשלוח.",
  },
  {
    icon: Package,
    title: "‎100 יחידות בלבד להזמנה",
    body: "‎MOQ נמוך במיוחד — מתאים גם לקפה שכונתי וגם לרשת.",
  },
];

function IconWrap({ Icon }: { Icon: typeof Sparkles }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { rotate: 0 } : { rotate: -180, opacity: 0 }}
      whileInView={{ rotate: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: ease.outQuint }}
      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-amber/15 text-brand-amber mb-5"
    >
      <Icon className="size-7" strokeWidth={2} />
    </motion.div>
  );
}

export default function ValueStrip() {
  return (
    <section className="bg-brand-paper border-y border-brand-line/50" aria-label="ערכים מרכזיים">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <StaggerParent className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {items.map((it) => (
            <StaggerChild
              key={it.title}
              className="text-right rounded-2xl p-6 lg:p-8 bg-white/60 backdrop-blur-sm border border-brand-line shadow-soft"
            >
              <IconWrap Icon={it.icon} />
              <h3 className="text-xl lg:text-2xl font-bold text-brand-espresso mb-2">
                {it.title}
              </h3>
              <p className="text-base text-brand-ink/80 leading-relaxed">
                {it.body}
              </p>
            </StaggerChild>
          ))}
        </StaggerParent>
      </div>
    </section>
  );
}
