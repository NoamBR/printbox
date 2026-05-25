import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { products } from "@/lib/products";

export default function MobileCatalogCta() {
  // Use first 8 products as visual thumbnail strip
  const thumbs = products.slice(0, 8);

  return (
    <section
      id="products"
      className="relative bg-brand-noir overflow-hidden"
      aria-labelledby="catalog-cta-heading"
    >
      <div className="relative max-w-container mx-auto px-6 py-12">
        <div className="text-right mb-6">
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-3">
            <span className="font-display italic me-2">The</span> Collection ·
            הקטלוג
          </p>
          <h2
            id="catalog-cta-heading"
            className="font-serif text-[clamp(28px,7vw,44px)] font-medium text-brand-bone leading-[1.05]"
          >
            <span className="italic font-display font-light text-brand-gold">
              {products.length}
            </span>{" "}
            מוצרים בקטלוג.
          </h2>
        </div>

        {/* 4×2 thumbnail collage */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {thumbs.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square rounded-sm bg-brand-surface border border-brand-line overflow-hidden"
            >
              <Image
                src={p.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="22vw"
                className="object-contain p-1.5"
              />
            </div>
          ))}
        </div>

        <p className="text-right text-sm text-brand-boneDim leading-relaxed mb-6">
          כוסות, מארזים, שקיות, מגשים ועוד — כל מוצר ניתן להתאמה מלאה לעיצוב
          ולמיתוג שלכם.
        </p>

        <Link
          href="/catalog"
          className="group inline-flex items-center justify-center gap-2 w-full min-h-[54px] px-8 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-base shadow-soft hover:bg-brand-goldHi transition-colors duration-200"
        >
          צפו בכל הקטלוג
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
