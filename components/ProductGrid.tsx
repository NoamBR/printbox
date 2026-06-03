"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "./ProductCard";
import { products, DEFAULT_VISIBLE } from "@/lib/products";
import { ChevronDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProductGrid() {
  const reduce = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? products : products.slice(0, DEFAULT_VISIBLE);
  const hasMore = products.length > DEFAULT_VISIBLE;

  return (
    <section
      id="products"
      className="relative bg-brand-noir overflow-hidden"
      aria-labelledby="products-heading"
    >
      <span
        aria-hidden="true"
        className="hidden lg:block absolute top-14 left-12 font-display italic text-brand-gold/10 leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
      >
        02
      </span>

      <div className="relative max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-right mb-8 lg:mb-12 max-w-2xl"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-3">
            <span className="font-display italic me-2">The</span> Collection · הקטלוג
          </p>
          <h2
            id="products-heading"
            className="font-serif text-[clamp(28px,4.5vw,64px)] font-medium text-brand-bone leading-[1.05]"
          >
            <span className="italic font-display font-light text-brand-gold">
              {products.length}
            </span>{" "}
            קטגוריות,
            <br />
            אינסוף הזדמנויות מיתוג.
          </h2>
          <p className="mt-3 text-base lg:text-lg text-brand-boneDim leading-relaxed">
            הצגנו את המוצרים הנמכרים ביותר. לחצו על &quot;הצגת עוד&quot; כדי
            לראות את הקטלוג המלא.
          </p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 8) * 0.04 }}
            >
              <ProductCard
                id={p.id}
                title={p.title}
                titleEn={p.titleEn}
                category={p.category}
                image={p.image}
                imageHover={p.imageHover}
                moq={p.moq ?? null}
                index={i}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile RTL snap carousel */}
        <div
          className="md:hidden snap-carousel scrollbar-hide flex gap-4 overflow-x-auto -mx-6 px-6 pb-2"
          dir="rtl"
        >
          {visible.map((p, i) => (
            <div key={p.id} className="shrink-0 w-[82vw] max-w-sm">
              <ProductCard
                id={p.id}
                title={p.title}
                titleEn={p.titleEn}
                category={p.category}
                image={p.image}
                imageHover={p.imageHover}
                moq={p.moq ?? null}
                index={i}
              />
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 lg:mt-12 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="group inline-flex items-center gap-2 min-h-[52px] px-10 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-sm tracking-wide hover:bg-brand-goldHi transition-colors duration-200"
            >
              {showAll ? "הצגת פחות" : "הצגת עוד מוצרים"}
              <ChevronDown
                className={`size-4 transition-transform duration-300 ${
                  showAll ? "rotate-180" : ""
                }`}
              />
            </button>
            <p className="text-xs text-brand-boneDim tracking-wider">
              מציג {visible.length} מתוך {products.length}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
