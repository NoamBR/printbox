import Image from "next/image";
import { CatalogProduct } from "@/lib/catalog";

export function ProductSpread({
  product,
  index,
}: {
  product: CatalogProduct;
  index: number;
}) {
  const flip = index % 2 === 1;
  const issueNumber = String(index + 1).padStart(2, "0");

  return (
    <section
      id={product.id}
      className="relative border-t border-brand-line/60 py-20 lg:py-28"
      aria-label={product.titleHe}
    >
      <div className="max-w-container mx-auto px-6 lg:px-12">
        {/* Brand title — Cormorant italic, English category */}
        <div className="flex items-baseline justify-between mb-10 lg:mb-14">
          <p className="font-display italic text-brand-gold text-2xl lg:text-3xl tracking-wide">
            {product.categoryEn}
          </p>
          <span className="font-display italic text-brand-gold/40 text-3xl lg:text-4xl select-none">
            № {issueNumber}
          </span>
        </div>

        <div
          className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
            flip ? "lg:[direction:ltr]" : ""
          }`}
        >
          {/* Image */}
          <div
            className={`relative aspect-square w-full max-w-[560px] mx-auto ${
              flip ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-[8%] bottom-[3%] h-[18%] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--c-gold) / 0.22), transparent 70%)",
                filter: "blur(28px)",
              }}
            />
            <Image
              src={product.image}
              alt={product.titleHe}
              fill
              sizes="(min-width: 1024px) 560px, 90vw"
              className="object-contain relative"
            />
          </div>

          {/* Copy */}
          <div
            className={`text-right ${flip ? "lg:order-1" : "lg:order-2"} ${
              flip ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.32em] text-brand-boneDim mb-3">
              {product.category}
            </div>
            <h2 className="font-serif font-medium text-brand-ink leading-tight text-[clamp(32px,4.2vw,52px)] mb-6">
              {product.titleHe}
            </h2>
            <p className="text-brand-boneDim leading-relaxed text-base lg:text-lg max-w-xl mb-8">
              {product.descriptionHe}
            </p>

            <dl className="grid grid-cols-2 gap-4 max-w-md mb-8 text-sm">
              {product.material && (
                <SpecRow label="חומר" value={product.material} />
              )}
              {product.dimensions && (
                <SpecRow label="ממדים" value={product.dimensions} />
              )}
              {product.moq != null && (
                <SpecRow
                  label="כמות מינ׳"
                  value={`${product.moq.toLocaleString("he-IL")} יח׳`}
                />
              )}
              <SpecRow label="SKU" value={product.sku} mono />
            </dl>

            <a
              href="#quote"
              className="inline-flex items-center gap-2 text-brand-ink hover:text-brand-gold transition-colors text-sm border-b border-brand-gold pb-1"
            >
              <span className="font-display italic">Request a Quote</span>
              <span className="text-brand-boneDim">·</span>
              <span>קבלו הצעת מחיר</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-brand-boneDim mb-1">
        {label}
      </dt>
      <dd className={`text-brand-ink ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
