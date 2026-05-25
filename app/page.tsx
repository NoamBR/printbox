import Hero from "@/components/Hero";
import ScarcityRibbon from "@/components/ScarcityRibbon";
import ValueStrip from "@/components/ValueStrip";
import ProductGrid from "@/components/ProductGrid";
import Process from "@/components/Process";
import SocialProof from "@/components/SocialProof";
import GuaranteeStrip from "@/components/GuaranteeStrip";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";
import StickyNav from "@/components/StickyNav";
import MobileCtaBar from "@/components/MobileCtaBar";

export default function Home() {
  return (
    <main className="overflow-x-hidden pb-20 lg:pb-0">
      <StickyNav />
      <Hero />
      <ScarcityRibbon />
      <ValueStrip />
      <ProductGrid />
      <Process />
      <SocialProof />
      <GuaranteeStrip />
      <QuoteForm />
      <Footer />
      <MobileCtaBar />
    </main>
  );
}
