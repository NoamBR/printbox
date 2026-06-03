"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CART_STORAGE_KEY,
  cartItemSchema,
  type CartItem,
} from "./quote-schema";
import { z } from "zod";

const cartStateSchema = z.object({
  items: cartItemSchema.array(),
  updatedAt: z.string(),
});

const EVENT_NAME = "printbox:cart-updated";
const OPEN_DRAWER_EVENT = "printbox:cart-open-drawer";

export function openCartDrawer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_DRAWER_EVENT));
}

export const CART_OPEN_DRAWER_EVENT = OPEN_DRAWER_EVENT;

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = cartStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    return parsed.data.items;
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    items,
    updatedAt: new Date().toISOString(),
  });
  window.localStorage.setItem(CART_STORAGE_KEY, payload);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useQuoteCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
    const onUpdate = () => setItems(readCart());
    window.addEventListener(EVENT_NAME, onUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === CART_STORAGE_KEY) onUpdate();
    });
    return () => {
      window.removeEventListener(EVENT_NAME, onUpdate);
    };
  }, []);

  const add = useCallback((item: CartItem): number => {
    const current = readCart();
    const newIndex = current.length;
    writeCart([...current, item]);
    return newIndex;
  }, []);

  const update = useCallback((index: number, patch: Partial<CartItem>) => {
    const current = readCart();
    if (index < 0 || index >= current.length) return;
    const merged: CartItem = {
      ...current[index],
      ...patch,
      specs: { ...current[index].specs, ...(patch.specs ?? {}) },
    };
    const parsed = cartItemSchema.safeParse(merged);
    if (!parsed.success) return;
    const next = [...current];
    next[index] = parsed.data;
    writeCart(next);
  }, []);

  const remove = useCallback((index: number) => {
    const current = readCart();
    if (index < 0 || index >= current.length) return;
    const next = current.filter((_, i) => i !== index);
    writeCart(next);
  }, []);

  const clear = useCallback(() => {
    writeCart([]);
  }, []);

  const totalQty = items.reduce((a, b) => a + b.quantity, 0);

  return { items, hydrated, add, update, remove, clear, count: items.length, totalQty };
}
