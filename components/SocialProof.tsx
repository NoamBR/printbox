"use client";

import { Quote } from "lucide-react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 500, prefix: "+", suffix: "", label: "עסקים פעילים" },
  { value: 50, prefix: "", suffix: "+", label: "אפשרויות התאמה אישית" },
  { value: 98, prefix: "", suffix: "%", label: "חזרות הזמנה תוך שנה" },
];

function CountUp({ to, prefix, suffix }: { to: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setN(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export default function SocialProof() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative bg-brand-espresso text-brand-onEspresso overflow-hidden"
      aria-labelledby="social-proof-heading"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 30%, rgb(var(--c-gold) / 0.10) 0%, transparent 60%), radial-gradient(60% 50% at 80% 90%, rgb(var(--c-gold) / 0.06) 0%, transparent 60%)",
        }}
      />
      <span
        aria-hidden="true"
        className="hidden lg:block absolute top-14 left-12 font-display italic text-brand-onEspresso/10 leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
      >
        04
      </span>

      <div className="relative max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-right mb-8 lg:mb-12 max-w-3xl"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-3">
            <span className="font-display italic me-2">Trust</span>· עסקים שעובדים איתנו
          </p>
          <h2
            id="social-proof-heading"
            className="font-serif font-medium text-[clamp(28px,4.5vw,64px)] text-brand-onEspresso leading-[1.05]"
          >
            <span className="italic font-display font-light text-brand-gold">+500</span>{" "}
            מותגים נבחרו ב-PrintBox
          </h2>
        </motion.div>

        {/* Testimonial */}
        <motion.figure
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-w-4xl mx-auto text-center mb-10 lg:mb-16"
        >
          <Quote className="size-10 text-brand-gold/50 mx-auto mb-4 rtl:-scale-x-100" strokeWidth={1.2} />
          <blockquote className="font-display italic font-light text-[clamp(28px,3vw,44px)] text-brand-onEspresso leading-[1.2]">
            עברנו ל-PrintBox אחרי שבע שנים עם ספק אחר. האיכות והליווי המקצועי{" "}
            <span className="text-brand-gold not-italic font-serif">פשוט אחרים</span>, והלקוחות שלנו מבחינים בזה מיד.
          </blockquote>
          <figcaption className="mt-6 text-sm text-brand-onEspressoDim tracking-wide">
            <span className="text-brand-onEspresso font-semibold">מיכל לוי</span>
            {" — "}מנכ&quot;לית, קפה שדרות
          </figcaption>
        </motion.figure>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
              className="text-center px-4"
            >
              <div
                className="font-display italic font-light text-brand-gold mb-2 tabular-nums leading-[0.9]"
                style={{ fontSize: "clamp(64px, 9vw, 132px)" }}
              >
                <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="text-sm text-brand-onEspressoDim font-medium tracking-[0.15em] uppercase">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
