"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { products } from "@/lib/products";

export default function HorizontalShowcase() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-82%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const sectionHeight = reduce ? "auto" : `${100 + products.length * 30}vh`;

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative bg-brand-espresso text-brand-onEspresso"
      style={{ height: sectionHeight }}
      aria-labelledby="products-heading"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Subtle gold radial wash on the espresso bg */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 20%, rgb(var(--c-gold) / 0.10) 0%, transparent 60%), radial-gradient(60% 50% at 20% 90%, rgb(var(--c-gold) / 0.06) 0%, transparent 60%)",
          }}
        />

        {/* Giant italic section index "02" floating right */}
        <span
          aria-hidden="true"
          className="hidden lg:block absolute top-20 left-12 font-display italic text-brand-onEspresso/8 leading-none select-none pointer-events-none"
          style={{ fontSize: "clamp(120px, 18vw, 280px)" }}
        >
          02
        </span>

        {/* Header */}
        <div className="relative max-w-container mx-auto w-full px-6 lg:px-10 pt-20 lg:pt-24 pb-6 text-right">
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-4">
            <span className="font-display italic me-2">The</span> Collection · הקטלוג
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2
              id="products-heading"
              className="font-serif font-medium text-[clamp(40px,5.5vw,84px)] text-brand-onEspresso leading-[1.0]"
            >
              {products.length}{" "}
              <span className="italic font-display font-light text-brand-gold">
                קטגוריות
              </span>
              ,
              <br />
              אינסוף הזדמנויות מיתוג.
            </h2>
            <p className="text-sm text-brand-onEspressoDim max-w-xs hidden lg:block">
              גללו למטה כדי לעבור בין המוצרים. כל פריט ניתן להתאמה מלאה —
              חומר, צבע, גימור.
            </p>
          </div>
        </div>

        {/* Track */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            style={reduce ? undefined : { x }}
            className="absolute top-0 bottom-0 right-0 flex items-center gap-6 lg:gap-8 ps-10 pe-[10vw] will-change-transform"
          >
            {products.map((p, i) => (
              <Card key={p.id} item={p} index={i} />
            ))}
          </motion.div>

          {/* Edge fade to espresso */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand-espresso to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand-espresso to-transparent"
          />
        </div>

        {/* Progress bar */}
        <div className="relative max-w-container mx-auto w-full px-6 lg:px-10 pb-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-onEspresso/55 font-medium">
              {String(1).padStart(2, "0")}
            </span>
            <div className="relative flex-1 h-px bg-brand-onEspresso/20 overflow-hidden">
              <motion.div
                style={reduce ? { width: "100%" } : { width: progressWidth }}
                className="absolute inset-y-0 right-0 bg-brand-gold"
              />
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-onEspresso/55 font-medium">
              {String(products.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  item,
  index,
}: {
  item: { id: string; title: string; category: string; image: string };
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30%" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.03 }}
      className="relative shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw] lg:w-[30vw] xl:w-[24vw] h-[68vh] rounded-sm bg-brand-surface border border-brand-line hover:border-brand-gold/60 overflow-hidden group transition-colors shadow-soft hover:shadow-softHover"
      data-cursor-grow=""
    >
      {/* Big italic numeral watermark */}
      <span
        aria-hidden="true"
        className="absolute top-4 start-6 font-display italic text-brand-gold/15 select-none leading-none pointer-events-none"
        style={{ fontSize: "112px" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 768px) 42vw, 78vw"
          className="object-contain p-10 transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      {/* Accent radial glow on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 70%, rgb(var(--c-accent) / 0.22) 0%, transparent 70%)",
        }}
      />
      {/* Brown footer band */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-brand-espresso via-brand-espresso/85 to-transparent">
        <p className="text-[11px] tracking-[0.22em] uppercase text-brand-gold mb-2">
          {item.category}
        </p>
        <h3 className="font-serif text-xl lg:text-2xl text-brand-onEspresso leading-tight mb-3">
          {item.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-brand-gold text-sm font-medium">
          מידע נוסף
          <ArrowLeft className="size-4" />
        </span>
      </div>
    </motion.article>
  );
}
