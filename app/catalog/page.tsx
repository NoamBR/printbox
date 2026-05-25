import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import StickyNav from "@/components/StickyNav";
import MobileCtaBar from "@/components/MobileCtaBar";

export const metadata = {
  title: "הקטלוג שלנו | PrintBox",
  description:
    "כל 28 סוגי האריזות הממותגות של PrintBox — כוסות, מארזים, שקיות, מגשים ועוד. כל מוצר ניתן להתאמה מלאה.",
};

export default function CatalogPage() {
  return (
    <main className="overflow-x-hidden pb-20 lg:pb-0">
      <StickyNav />

      {/* Page header */}
      <header className="bg-brand-noir pt-12 lg:pt-16 pb-2 border-b border-brand-line">
        <div className="max-w-container mx-auto px-6 lg:px-10 text-right">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-brand-gold hover:text-brand-goldHi transition-colors mb-4"
          >
            <span>חזרה לדף הבית</span>
            <ArrowLeft className="size-4 rtl:rotate-180" />
          </Link>
          <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase">
            <span className="font-display italic me-2">The Full</span>· הקטלוג
            המלא
          </p>
        </div>
      </header>

      <ProductGrid />
      <Footer />
      <MobileCtaBar />
    </main>
  );
}
