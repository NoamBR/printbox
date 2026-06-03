"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CART_OPEN_DRAWER_EVENT, useQuoteCart } from "@/lib/cart-store";

export default function CartDrawer() {
  const { items, remove, totalQty, hydrated } = useQuoteCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setOpen(true);
    window.addEventListener(CART_OPEN_DRAWER_EVENT, handler);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(CART_OPEN_DRAWER_EVENT, handler);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-brand-noir/70 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="סל הצעות"
        className={`fixed inset-y-0 end-0 z-[61] w-full sm:max-w-md bg-brand-surface border-s border-brand-line flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="px-6 py-5 border-b border-brand-line flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירה"
            className="text-brand-boneDim hover:text-brand-bone"
          >
            <X className="size-5" />
          </button>
          <h2 className="font-serif text-xl text-brand-bone">סל ההצעות</h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? null : items.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-brand-boneDim mb-6">הסל ריק.</p>
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="text-sm text-brand-gold hover:text-brand-goldHi border-b border-brand-gold pb-0.5"
              >
                לקטלוג
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-brand-line">
              {items.map((it, idx) => {
                const specs: string[] = [];
                if (it.specs.dimensions) specs.push(it.specs.dimensions);
                if (it.specs.sides) specs.push(it.specs.sides);
                if (it.specs.finish) specs.push(it.specs.finish);
                if (it.specs.color) specs.push(it.specs.color);
                return (
                  <li
                    key={`${it.productId}-${idx}`}
                    className="px-6 py-4 flex gap-4 text-right"
                  >
                    <div className="relative shrink-0 w-14 h-14 bg-brand-surfaceHi border border-brand-line rounded-sm overflow-hidden">
                      <Image
                        src={`/renders/${it.productId}_branded.png`}
                        alt={it.productTitleHe}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          aria-label="הסרת פריט"
                          className="text-brand-boneDim/70 hover:text-brand-bone text-xs shrink-0"
                        >
                          הסר
                        </button>
                        <h3 className="text-sm text-brand-bone leading-tight">
                          {it.productTitleHe}
                        </h3>
                      </div>
                      <p className="text-xs text-brand-boneDim mt-1 tabular-nums">
                        {it.quantity.toLocaleString("he-IL")} יח&apos;
                      </p>
                      {specs.length > 0 && (
                        <p className="text-xs text-brand-boneDim/80 mt-1 truncate">
                          {specs.join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {hydrated && items.length > 0 && (
          <footer className="border-t border-brand-line px-6 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-brand-bone">
              <span className="tabular-nums">
                {totalQty.toLocaleString("he-IL")} יח&apos;
              </span>
              <span className="text-brand-boneDim">סה&quot;כ</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center min-h-[48px] px-6 rounded-sm bg-brand-gold text-brand-onEspresso font-medium text-sm hover:bg-brand-goldHi transition-colors"
            >
              סקירה ושליחה
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-xs text-brand-boneDim hover:text-brand-bone"
            >
              להמשך דפדוף
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
