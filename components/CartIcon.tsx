"use client";

import { ShoppingBag } from "lucide-react";
import { openCartDrawer, useQuoteCart } from "@/lib/cart-store";

export default function CartIcon() {
  const { count, hydrated } = useQuoteCart();
  const showBadge = hydrated && count > 0;

  return (
    <button
      type="button"
      onClick={() => openCartDrawer()}
      aria-label={`סל הצעות${showBadge ? ` (${count})` : ""}`}
      className="relative inline-flex items-center justify-center w-11 h-11 text-brand-bone hover:text-brand-gold transition-colors"
    >
      <ShoppingBag className="size-5" strokeWidth={1.4} />
      {showBadge && (
        <span
          className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gold text-brand-onEspresso text-[10px] font-medium flex items-center justify-center tabular-nums"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}
