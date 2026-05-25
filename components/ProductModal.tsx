"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  productId: string;
  title: string;
  category: string;
};

export default function ProductModal({
  open,
  onClose,
  productId,
  title,
  category,
}: Props) {
  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  // All 6 brand variations
  const variants = Array.from({ length: 6 }, (_, i) => ({
    n: i + 1,
    src: `/renders/${productId}_v${i + 1}.png`,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-noir/85 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-brand-surface border border-brand-line rounded-sm shadow-softHover"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute top-3 end-3 lg:top-4 lg:end-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-sm border border-brand-line bg-brand-surface text-brand-bone hover:text-brand-gold hover:border-brand-gold transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="px-5 sm:px-6 lg:px-10 pt-12 sm:pt-10 lg:pt-10 pe-14 sm:pe-6 pb-5 sm:pb-6 text-right border-b border-brand-line">
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-2">
            <span className="font-display italic me-2">Brand Variations</span>·
            וריאציות מיתוג
          </p>
          <h3
            id="modal-title"
            className="font-serif text-3xl lg:text-4xl text-brand-bone leading-tight"
          >
            {title}
          </h3>
          <p className="text-sm text-brand-boneDim mt-1.5">{category}</p>
          <p className="text-sm text-brand-boneDim mt-4 max-w-2xl">
            6 וריאציות מיתוג שונות של אותו מוצר. כל מיתוג מוצג כדוגמה לפני
            ההפקה — אחרי האישור שלכם, נפיק את העיצוב המדויק שתבחרו.
          </p>
        </div>

        {/* Variants grid */}
        <div className="p-4 sm:p-6 lg:p-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {variants.map((v) => (
            <figure
              key={v.n}
              className="relative aspect-square rounded-sm bg-brand-surfaceHi border border-brand-line overflow-hidden group"
            >
              <Image
                src={v.src}
                alt={`${title} – וריאציה ${v.n}`}
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <figcaption className="absolute bottom-2 end-3 font-display italic text-brand-gold/80 text-sm tabular-nums">
                #{v.n}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-5 sm:px-6 lg:px-10 py-5 sm:py-6 border-t border-brand-line flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-sm text-brand-boneDim text-right">
            אהבתם וריאציה? קבלו הצעת מחיר על המוצר עם המיתוג שלכם.
          </p>
          <a
            href="#quote"
            onClick={onClose}
            className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-sm hover:bg-brand-goldHi transition-colors"
          >
            קבלו הצעת מחיר
          </a>
        </div>
      </div>
    </div>
  );
}
