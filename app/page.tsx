import Hero from "@/components/Hero";
import ValueStrip from "@/components/ValueStrip";
import ProductGrid from "@/components/ProductGrid";
import Process from "@/components/Process";
import SocialProof from "@/components/SocialProof";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";
import StickyNav from "@/components/StickyNav";
import MobileCtaBar from "@/components/MobileCtaBar";

export default function Home() {
  return (
    <main className="overflow-x-hidden pb-20 lg:pb-0">
      <StickyNav />
      <Hero />
      <ValueStrip />
      <ProductGrid />
      <Process />
      <SocialProof />
      <QuoteForm />
      <Footer />
      <MobileCtaBar />
    </main>
  );
}
