"use client";

import { useCallback, useState } from "react";
import { openCartDrawer, useQuoteCart } from "@/lib/cart-store";
import { Minus, Plus } from "lucide-react";

type Props = {
  productId: string;
  titleHe: string;
  titleEn: string;
  moq: number | null;
};

const fieldClass =
  "w-full min-h-[44px] px-3 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone focus:border-brand-gold focus:outline-none";

export default function AddToCartPanel({
  productId,
  titleHe,
  titleEn,
  moq,
}: Props) {
  const { add, update } = useQuoteCart();
  const stepSize = moq && moq >= 1000 ? 100 : moq && moq >= 500 ? 50 : 10;
  const minQty = moq ?? 100;

  const [phase, setPhase] = useState<"initial" | "added">("initial");
  const [quantity, setQuantity] = useState<number>(minQty);
  const [addedIndex, setAddedIndex] = useState<number | null>(null);
  const [addedQty, setAddedQty] = useState<number>(minQty);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [dimensions, setDimensions] = useState("");
  const [sides, setSides] = useState("");
  const [finish, setFinish] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");

  const saveSpecs = useCallback(
    (next: { dimensions?: string; sides?: string; finish?: string; color?: string; notes?: string }) => {
      if (addedIndex == null) return;
      update(addedIndex, {
        specs: {
          dimensions: next.dimensions ?? dimensions,
          sides: next.sides ?? sides,
          finish: next.finish ?? finish,
          color: next.color ?? color,
          notes: next.notes ?? notes,
        },
      });
    },
    [addedIndex, update, dimensions, sides, finish, color, notes]
  );

  function handleAdd() {
    if (!Number.isFinite(quantity) || quantity < minQty) return;
    const idx = add({
      productId,
      productTitleHe: titleHe,
      productTitleEn: titleEn,
      quantity: Math.round(quantity),
      specs: { dimensions: "", sides: "", finish: "", color: "", notes: "" },
    });
    setAddedIndex(idx);
    setAddedQty(quantity);
    setPhase("added");
    openCartDrawer();
  }

  function reset() {
    setPhase("initial");
    setCustomizeOpen(false);
    setAddedIndex(null);
    setDimensions("");
    setSides("");
    setFinish("");
    setColor("");
    setNotes("");
  }

  if (phase === "initial") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div className="text-right">
          <label className="block text-xs text-brand-boneDim mb-2">
            כמות{moq ? ` · מינימום ${moq.toLocaleString("he-IL")}` : ""}
          </label>
          <div className="inline-flex items-stretch border border-brand-line rounded-sm bg-brand-surfaceHi">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(minQty, q - stepSize))}
              disabled={quantity <= minQty}
              aria-label="הפחתה"
              className="px-3 text-brand-bone hover:bg-brand-surface disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="size-4" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              dir="ltr"
              min={minQty}
              step={stepSize}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-24 sm:w-28 text-center bg-transparent text-brand-bone tabular-nums focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + stepSize)}
              aria-label="הוספה"
              className="px-3 text-brand-bone hover:bg-brand-surface"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={quantity < minQty}
          className="inline-flex items-center justify-center min-h-[50px] px-7 rounded-sm bg-brand-gold text-brand-onEspresso font-medium text-sm hover:bg-brand-goldHi transition-colors disabled:opacity-50"
        >
          הוספה לסל
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 text-right">
        <button
          type="button"
          onClick={reset}
          className="text-xs text-brand-boneDim hover:text-brand-bone underline-offset-2 hover:underline"
        >
          הוספה נוספת
        </button>
        <p className="text-sm text-brand-bone">
          נוסף לסל · {addedQty.toLocaleString("he-IL")} יח&apos;
        </p>
      </div>

      <button
        type="button"
        onClick={() => setCustomizeOpen((v) => !v)}
        aria-expanded={customizeOpen}
        className="w-full text-right text-xs text-brand-boneDim hover:text-brand-bone border-t border-brand-line pt-3"
      >
        {customizeOpen ? "מפרט (אופציונלי) −" : "מפרט (אופציונלי) +"}
      </button>

      {customizeOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right pt-1">
          <label className="block">
            <span className="block text-xs text-brand-boneDim mb-1.5">מידות</span>
            <input
              type="text"
              className={fieldClass}
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              onBlur={() => saveSpecs({ dimensions })}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-brand-boneDim mb-1.5">צבעים</span>
            <input
              type="text"
              className={fieldClass}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              onBlur={() => saveSpecs({ color })}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-brand-boneDim mb-1.5">צדדים</span>
            <select
              className={fieldClass}
              value={sides}
              onChange={(e) => {
                setSides(e.target.value);
                saveSpecs({ sides: e.target.value });
              }}
            >
              <option value="">—</option>
              <option value="חד-צדדי">חד-צדדי</option>
              <option value="דו-צדדי">דו-צדדי</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-brand-boneDim mb-1.5">גימור</span>
            <select
              className={fieldClass}
              value={finish}
              onChange={(e) => {
                setFinish(e.target.value);
                saveSpecs({ finish: e.target.value });
              }}
            >
              <option value="">—</option>
              <option value="מאט">מאט</option>
              <option value="מבריק">מבריק</option>
              <option value="Spot UV">Spot UV</option>
              <option value="פויל זהב">פויל זהב</option>
              <option value="פויל כסף">פויל כסף</option>
              <option value="Soft-Touch">Soft-Touch</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-xs text-brand-boneDim mb-1.5">הערות</span>
            <textarea
              rows={2}
              className={`${fieldClass} py-2 resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveSpecs({ notes })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
