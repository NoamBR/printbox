"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import ProductModal from "./ProductModal";

type Props = {
  id: string;
  title: string;
  category: string;
  image: string;
  imageHover?: string;
  index?: number;
  alt?: string;
};

export default function ProductCard({
  id,
  title,
  category,
  image,
  imageHover,
  index,
  alt,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModalOpen(true)}
        className="group relative bg-brand-surfaceHi rounded-sm border border-brand-line hover:border-brand-gold/60 shadow-soft hover:shadow-softHover transition-all duration-300 overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        aria-label={`${title} — לחצו לצפייה ב-6 וריאציות מיתוג`}
      >
        {typeof index === "number" && (
          <span
            aria-hidden="true"
            className="hidden md:inline absolute top-3 start-5 font-display italic text-brand-gold/15 select-none leading-none pointer-events-none z-10"
            style={{ fontSize: "84px" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}

        <div className="relative aspect-square overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 70%, rgb(var(--c-accent) / 0.18) 0%, transparent 70%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-6 transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <Image
              src={image}
              alt={alt ?? title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 80vw"
              className={`object-contain transition-opacity duration-300 ${
                hovered && imageHover ? "opacity-0" : "opacity-100"
              }`}
            />
            {imageHover && (
              <Image
                src={imageHover}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 80vw"
                className={`object-contain transition-opacity duration-300 ${
                  hovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>

          {/* "6 variants" badge */}
          <span className="absolute top-3 end-3 text-[10px] font-medium tracking-[0.15em] uppercase bg-brand-noir/85 text-brand-onEspresso px-2.5 py-1 rounded-sm">
            6 וריאציות
          </span>
        </div>
        <div className="p-6 text-right">
          <p className="text-[11px] tracking-[0.2em] uppercase text-brand-gold/80 mb-2">
            {category}
          </p>
          <h3 className="font-serif text-xl text-brand-bone mb-4 leading-tight">
            {title}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-brand-gold font-medium text-sm group-hover:gap-2.5 transition-all duration-200">
            צפו בכל הוריאציות
            <ArrowLeft className="size-4" />
          </span>
        </div>
      </article>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={id}
        title={title}
        category={category}
      />
    </>
  );
}
