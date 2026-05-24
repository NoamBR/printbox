"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const clientLogos = [
  "קפה שדרות",
  "ברנדס סטודיו",
  "אורבן בייקרי",
  "טאיגר רוסטרי",
  "פייני פוד",
  "Lemon & Sage",
  "מקסים בייטס",
  "סלייס פיצריה",
];

const stats = [
  { value: 500, suffix: "+", label: "עסקים פעילים" },
  { value: 14, suffix: " ימים", label: "זמן הפקה ממוצע" },
  { value: 98, suffix: "%", label: "חזרות הזמנה תוך שנה" },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
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
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export default function SocialProof() {
  return (
    <section className="bg-brand-cream" aria-labelledby="social-proof-heading">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <RevealOnScroll>
          <p className="text-sm font-semibold text-brand-amber uppercase tracking-wide mb-3 text-right">
            עסקים שכבר עובדים איתנו
          </p>
          <h2
            id="social-proof-heading"
            className="text-[clamp(28px,4vw,40px)] font-bold text-brand-espresso leading-tight text-right max-w-2xl mb-10 lg:mb-14"
          >
            ‎+500 מותגים נבחרו ב-PrintBox
          </h2>
        </RevealOnScroll>

        {/* Logo marquee */}
        <div
          className="relative overflow-hidden mask-fade py-6 mb-16 lg:mb-20"
          aria-label="לקוחות שלנו"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex gap-12 lg:gap-16 animate-marquee hover:[animation-play-state:paused] w-max">
            {[...clientLogos, ...clientLogos].map((name, i) => (
              <div
                key={i}
                className="shrink-0 text-2xl lg:text-3xl font-bold text-brand-muted/70 hover:text-brand-kraft transition-colors duration-200 select-none whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <RevealOnScroll>
          <figure className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
            <Quote
              className="size-10 text-brand-amber/40 mx-auto mb-4 rtl:-scale-x-100"
              strokeWidth={1.5}
            />
            <blockquote className="text-xl lg:text-2xl text-brand-espresso leading-relaxed font-medium">
              &ldquo;עברנו ל-PrintBox אחרי שבע שנים עם ספק אחר. הזמן מהזמנה
              למשלוח התקצר בחצי, והאיכות פשוט אחרת. הלקוחות שלנו מבחינים
              בכוסות.&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-sm text-brand-muted">
              <span className="font-bold text-brand-ink">מיכל לוי</span>
              {" — "}מנכ&quot;לית, קפה שדרות
            </figcaption>
          </figure>
        </RevealOnScroll>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="text-center rounded-2xl bg-white border border-brand-line shadow-soft p-8"
            >
              <div className="text-4xl lg:text-5xl font-extrabold text-brand-kraft mb-2 tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-brand-ink/70 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
