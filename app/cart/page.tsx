import StickyNav from "@/components/StickyNav";
import Footer from "@/components/Footer";
import MobileCtaBar from "@/components/MobileCtaBar";
import CartView from "@/components/CartView";

export const metadata = {
  title: "סל הצעות | PrintBox",
  description: "סקור את הפריטים שבחרת ושלח בקשת הצעת מחיר מותאמת.",
};

export default function CartPage() {
  return (
    <main className="overflow-x-hidden pb-20 lg:pb-0 min-h-screen">
      <StickyNav />
      <CartView />
      <Footer />
      <MobileCtaBar />
    </main>
  );
}
