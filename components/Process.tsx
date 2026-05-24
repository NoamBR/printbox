"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import {
  LayoutGrid,
  Upload,
  CheckCircle2,
  Truck,
  type LucideIcon,
} from "lucide-react";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { ease } from "@/lib/motion";

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
    body: "תקבלו דוגמה דיגיטלית תלת-ממדית תוך 48 שעות. רק אחרי אישור — מתחילים בהפקה.",
    Icon: CheckCircle2,
  },
  {
    n: 4,
    title: "מקבלים עד הדלת",
    body: "ייצור, אריזה ומשלוח בתוך 14 ימי עסקים. עם אחריות מלאה.",
    Icon: Truck,
  },
];

function StepCircle({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-30% 0px -30% 0px", once: true });
  const reduce = useReducedMotion();

  const visible = reduce || inView;

  return (
    <div ref={ref} className="relative flex lg:flex-col items-center lg:items-center gap-4 lg:gap-5 text-right lg:text-center">
      <motion.div
        initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.5, ease: ease.outQuint, delay: index * 0.05 }}
        className="relative z-10 shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white border-2 border-brand-kraft flex items-center justify-center shadow-soft"
      >
        <step.Icon className="size-7 lg:size-8 text-brand-kraft" strokeWidth={2} />
        <span className="absolute -top-2 -end-2 bg-brand-amber text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-soft">
          {step.n}
        </span>
      </motion.div>
      <div className="lg:max-w-[220px]">
        <h3 className="text-lg lg:text-xl font-bold text-brand-espresso mb-1">
          {step.title}
        </h3>
        <p className="text-sm text-brand-ink/80 leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
}

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="bg-brand-paper border-y border-brand-line/50" aria-labelledby="process-heading">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <RevealOnScroll>
          <div className="text-right mb-12 lg:mb-20 max-w-2xl">
            <p className="text-sm font-semibold text-brand-amber uppercase tracking-wide mb-3">
              איך זה עובד
            </p>
            <h2
              id="process-heading"
              className="text-[clamp(28px,4vw,40px)] font-bold text-brand-espresso leading-tight"
            >
              4 צעדים מהרעיון למשלוח
            </h2>
          </div>
        </RevealOnScroll>

        <div ref={ref} className="relative">
          {/* Desktop horizontal connecting line (RTL: right → left fill) */}
          <svg
            aria-hidden="true"
            className="hidden lg:block absolute top-10 inset-x-0 w-full h-1 pointer-events-none"
            viewBox="0 0 1200 4"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="2" x2="1200" y2="2" stroke="#E7D9B8" strokeWidth="2" />
            <motion.line
              x1="1200"
              y1="2"
              x2="0"
              y2="2"
              stroke="#D97706"
              strokeWidth="2"
              style={reduce ? { pathLength: 1 } : { pathLength }}
            />
          </svg>

          {/* Mobile vertical connecting line */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute top-0 bottom-0 end-8 w-0.5 bg-brand-line"
          />

          <div className="grid lg:grid-cols-4 gap-10 lg:gap-6 relative">
            {steps.map((s, i) => (
              <StepCircle key={s.n} step={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
