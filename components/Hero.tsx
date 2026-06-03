"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function HeadingMark() {
  const reduce = useReducedMotion();
  const lineOne: { w: string; accent?: boolean }[] = [
    { w: "העיצוב", accent: true },
    { w: "שלכם." },
  ];
  const lineTwo: { w: string }[] = [
    { w: "על" },
    { w: "כל" },
    { w: "כוס," },
    { w: "מנשא" },
    { w: "וקופסה." },
  ];
  let i = 0;
  const wordVariants = {
    hidden: { opacity: 0, y: 22 },
    show: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: 0.15 + custom * 0.06, ease: EASE },
    }),
  };

  return (
    <h1 className="font-serif text-[clamp(40px,7vw,100px)] leading-[1.0] font-medium text-brand-bone">
      <span className="block">
        {lineOne.map((it) => {
          const idx = i++;
          return (
            <motion.span
              key={idx}
              custom={idx}
              initial={reduce ? "show" : "hidden"}
              animate="show"
              variants={wordVariants}
              className={`inline-block me-[0.28em] ${
                it.accent ? "italic font-display font-light text-brand-gold" : ""
              }`}
            >
              {it.w}
            </motion.span>
          );
        })}
      </span>
      <span className="block">
        {lineTwo.map((it) => {
          const idx = i++;
          return (
            <motion.span
              key={idx}
              custom={idx}
              initial={reduce ? "show" : "hidden"}
              animate="show"
              variants={wordVariants}
              className="inline-block me-[0.28em]"
            >
              {it.w}
            </motion.span>
          );
        })}
      </span>
    </h1>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative overflow-hidden bg-concrete pt-16 pb-12 lg:pt-28 lg:pb-20"
      aria-label="ראש העמוד"
    >
      {/* Vertical brown rules */}
      <div aria-hidden="true" className="hidden lg:block absolute top-10 bottom-10 left-10 w-px bg-brand-gold/30" />
      <div aria-hidden="true" className="hidden lg:block absolute top-10 bottom-10 right-10 w-px bg-brand-gold/30" />

      <span
        aria-hidden="true"
        className="hidden lg:block absolute top-24 left-16 font-display italic text-brand-gold/15 leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
      >
        01
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 70% 30%, rgb(var(--c-accent) / 0.15) 0%, transparent 70%), radial-gradient(60% 50% at 30% 80%, rgb(var(--c-gold) / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-container mx-auto px-6 lg:px-10 flex justify-center">
        <div className="text-right max-w-3xl">
          <motion.span
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="inline-flex items-center text-[10px] sm:text-[11px] font-medium tracking-[0.32em] text-brand-gold uppercase mb-5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm border border-brand-gold/40 bg-brand-surface/60 backdrop-blur-sm"
          >
            אריזות ממותגות לעסקים בישראל
          </motion.span>

          <HeadingMark />

          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.8 }}
            className="mt-5 text-lg lg:text-xl text-brand-boneDim leading-relaxed max-w-xl"
          >
            הפקה איכותית, מחירי סיטונאות, וליווי מקצועי — מהסקיצה לדלת של העסק שלכם.
          </motion.p>

          <motion.div
            initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.95 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <a
              href="/catalog"
              className="group inline-flex items-center justify-center gap-2 min-h-[54px] w-full sm:w-auto px-6 sm:px-8 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-base shadow-soft hover:bg-brand-goldHi hover:shadow-softHover hover:-translate-y-0.5 transition-all duration-250"
            >
              בחרו מוצר וקבלו הצעה
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center min-h-[54px] w-full sm:w-auto px-6 sm:px-7 rounded-sm border border-brand-gold/50 text-brand-bone font-medium text-base hover:border-brand-gold hover:bg-brand-gold/5 transition-colors duration-200"
            >
              צפו במוצרים
            </a>
          </motion.div>

          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-6 text-sm text-brand-boneDim"
          >
            <span className="font-display italic text-brand-gold font-semibold text-base">+500</span>{" "}
            עסקים בישראל כבר מזמינים מאיתנו
          </motion.p>
        </div>
      </div>

      <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-brand-gold/60">
        <span className="text-[10px] tracking-[0.35em] uppercase">scroll</span>
        <motion.span
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={reduce ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5" />
        </motion.span>
      </div>
    </section>
  );
}
