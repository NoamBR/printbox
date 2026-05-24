"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { duration, ease } from "@/lib/motion";

const H1_LINE_1 = "העיצוב שלכם.";
const H1_LINE_2 = "על כל כוס, מנשא וקופסה.";

function AnimatedHeading() {
  const reduce = useReducedMotion();
  const words = `${H1_LINE_1} ${H1_LINE_2}`.split(" ");

  return (
    <h1 className="text-[clamp(40px,6vw,60px)] leading-[1.05] font-bold text-brand-espresso">
      <span className="block">
        {words.slice(0, H1_LINE_1.split(" ").length).map((w, i) => (
          <motion.span
            key={`a-${i}`}
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: reduce ? 0 : i * 0.05,
              ease: ease.outQuint,
            }}
            className="inline-block me-[0.25em]"
          >
            {w}
          </motion.span>
        ))}
      </span>
      <span className="block">
        {words.slice(H1_LINE_1.split(" ").length).map((w, i) => (
          <motion.span
            key={`b-${i}`}
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: reduce ? 0 : (i + H1_LINE_1.split(" ").length) * 0.05,
              ease: ease.outQuint,
            }}
            className="inline-block me-[0.25em]"
          >
            {w}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

function PackageComposition() {
  const reduce = useReducedMotion();

  const items = [
    {
      label: "כוס נייר ממותגת",
      from: { x: 80, y: 80 },
      pos: "bottom-6 end-8",
      size: "w-40 h-52 md:w-48 md:h-60",
      bg: "linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 100%)",
      ringClass: "ring-2 ring-brand-kraft/20",
      delay: 0,
      svg: (
        <svg viewBox="0 0 100 130" className="w-full h-full">
          <defs>
            <linearGradient id="cup-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FEF3C7" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>
          </defs>
          <path
            d="M20 10 L80 10 L72 120 L28 120 Z"
            fill="#FFFFFF"
            stroke="#92400E"
            strokeWidth="1.4"
          />
          <ellipse cx="50" cy="10" rx="30" ry="5" fill="url(#cup-rim)" stroke="#92400E" strokeWidth="1.4" />
          <rect x="32" y="42" width="36" height="36" rx="4" fill="#92400E" />
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fontSize="11"
            fill="#FFFBEB"
            fontWeight="700"
            fontFamily="var(--font-heebo-hebrew), sans-serif"
          >
            המותג
          </text>
        </svg>
      ),
    },
    {
      label: "מנשא 4 כוסות",
      from: { x: -80, y: -60 },
      pos: "top-2 start-6",
      size: "w-44 h-32 md:w-52 md:h-36",
      bg: "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
      ringClass: "ring-2 ring-brand-kraft/20",
      delay: 0.1,
      svg: (
        <svg viewBox="0 0 130 90" className="w-full h-full">
          <rect x="6" y="20" width="118" height="60" rx="6" fill="#92400E" stroke="#78350F" strokeWidth="1.2" />
          {[18, 48, 78, 108].map((cx) => (
            <circle key={cx} cx={cx} cy={42} r={11} fill="#FFFBEB" stroke="#78350F" strokeWidth="1" />
          ))}
          <rect x="50" y="8" width="30" height="12" rx="2" fill="#78350F" />
        </svg>
      ),
    },
    {
      label: "מארז מזון",
      from: { x: 80, y: -60 },
      pos: "top-6 end-32",
      size: "w-36 h-28 md:w-40 md:h-32",
      bg: "linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)",
      ringClass: "ring-2 ring-brand-kraft/20",
      delay: 0.2,
      svg: (
        <svg viewBox="0 0 120 90" className="w-full h-full">
          <path d="M10 25 L60 8 L110 25 L110 78 L10 78 Z" fill="#FFFBEB" stroke="#92400E" strokeWidth="1.4" />
          <line x1="60" y1="8" x2="60" y2="78" stroke="#92400E" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="40" y="42" width="40" height="14" rx="2" fill="#D97706" />
        </svg>
      ),
    },
    {
      label: "קופסת משלוח",
      from: { x: -80, y: 80 },
      pos: "bottom-12 start-20",
      size: "w-44 h-36 md:w-52 md:h-40",
      bg: "linear-gradient(135deg, #92400E 0%, #78350F 100%)",
      ringClass: "ring-2 ring-brand-kraft/30",
      delay: 0.3,
      svg: (
        <svg viewBox="0 0 130 100" className="w-full h-full">
          <path d="M12 32 L65 12 L118 32 L118 86 L65 95 L12 86 Z" fill="#78350F" stroke="#3B1A05" strokeWidth="1.2" />
          <path d="M12 32 L65 52 L118 32" fill="none" stroke="#3B1A05" strokeWidth="1.2" />
          <path d="M65 52 L65 95" stroke="#3B1A05" strokeWidth="1" />
          <rect x="48" y="62" width="34" height="10" rx="1.5" fill="#FFFBEB" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative h-[420px] md:h-[520px] w-full">
      {items.map((it, idx) => (
        <motion.div
          key={idx}
          aria-hidden="true"
          initial={
            reduce
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 0, ...it.from, scale: 0.92 }
          }
          animate={
            reduce
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 1, x: 0, y: 0, scale: 1 }
          }
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 14,
            delay: reduce ? 0 : it.delay,
          }}
          className={`absolute ${it.pos} ${it.size}`}
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -6, 0] }}
            transition={
              reduce
                ? {}
                : {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.6,
                  }
            }
            className={`relative w-full h-full rounded-2xl ${it.ringClass} shadow-soft p-3 overflow-hidden`}
            style={{ background: it.bg }}
          >
            {it.svg}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.6]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-cream pt-28 pb-20 lg:pt-36 lg:pb-28"
      aria-label="ראש העמוד"
    >
      {/* Soft kraft texture wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 20%, #FEF3C7 0%, transparent 70%), radial-gradient(50% 50% at 20% 80%, #FDE68A 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-container mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div className="order-2 lg:order-1">
          <motion.div
            style={reduce ? undefined : { scale, opacity }}
            className="hidden lg:block"
          >
            <PackageComposition />
          </motion.div>
          <div className="lg:hidden">
            <PackageComposition />
          </div>
        </div>

        <div className="order-1 lg:order-2 text-right">
          <motion.span
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.outQuint }}
            className="inline-block text-sm font-semibold tracking-wide text-brand-amber uppercase mb-5 px-3 py-1 rounded-full bg-brand-amber/10"
          >
            אריזות ממותגות לעסקים
          </motion.span>

          <AnimatedHeading />

          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration.reveal, delay: 0.4 }}
            className="mt-6 text-lg lg:text-xl text-brand-ink/85 leading-relaxed max-w-xl"
          >
            הפקה איכותית, מחירי סיטונאות, ומשלוח עד 14 ימי עסקים — מהסקיצה לדלת
            של העסק שלכם.
          </motion.p>

          <motion.div
            initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: duration.reveal, delay: 0.55, ease: ease.outQuint }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#quote"
              className="group inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-xl bg-brand-amber text-white font-semibold text-base shadow-soft hover:bg-brand-amberHi hover:shadow-softHover hover:-translate-y-0.5 transition-all duration-250 ease-out-quint"
            >
              קבלו הצעת מחיר
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-xl border-2 border-brand-kraft text-brand-kraft font-semibold text-base hover:bg-brand-kraft hover:text-white transition-colors duration-200"
            >
              צפו במוצרים
            </a>
          </motion.div>

          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.75 }}
            className="mt-6 text-sm text-brand-muted"
          >
            ‎+500 עסקים בישראל כבר מזמינים מאיתנו
          </motion.p>
        </div>
      </div>
    </section>
  );
}
