import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const CSV_PATH = path.join(
  process.cwd(),
  "pricing",
  "PrintBox-Pricing-Template.csv"
);

type Range = { col: string; min: number; max: number };

const RANGES: Range[] = [
  { col: "price_100_500", min: 100, max: 500 },
  { col: "price_500_1000", min: 500, max: 1000 },
  { col: "price_1000_5000", min: 1000, max: 5000 },
  { col: "price_5000_10000", min: 5000, max: 10000 },
  { col: "price_10000_25000", min: 10000, max: 25000 },
  { col: "price_25000_50000", min: 25000, max: 50000 },
  { col: "price_50000_100000", min: 50000, max: 100000 },
  { col: "price_100000_plus", min: 100000, max: Infinity },
];

type ProductRanges = Array<{ range: Range; unitPriceIls: number }>;

let _cache: Map<string, ProductRanges> | null = null;
let _cacheMtime = 0;

function loadCsv(): Map<string, ProductRanges> {
  if (!fs.existsSync(CSV_PATH)) return new Map();
  const stat = fs.statSync(CSV_PATH);
  if (_cache && stat.mtimeMs === _cacheMtime) return _cache;

  const raw = fs.readFileSync(CSV_PATH, "utf8").replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const map = new Map<string, ProductRanges>();
  for (const row of parsed.data) {
    const id = (row.product_id ?? "").trim();
    if (!/^PB-\d{3}$/.test(id)) continue;
    const filled: ProductRanges = [];
    for (const range of RANGES) {
      const cell = (row[range.col] ?? "").trim();
      if (!cell) continue;
      const num = Number(cell);
      if (Number.isFinite(num) && num > 0) {
        filled.push({ range, unitPriceIls: num });
      }
    }
    if (filled.length > 0) map.set(id, filled);
  }

  _cache = map;
  _cacheMtime = stat.mtimeMs;
  return map;
}

/**
 * Returns suggested unit price (₪) for the given product and quantity.
 *
 * Resolution:
 *   1. Locate the range that contains the quantity (lower-inclusive,
 *      upper-exclusive — so qty=5000 falls in the 5000-10000 range).
 *   2. If that range has a filled cell → return its price.
 *   3. Otherwise walk to the nearest filled neighbor — prefer the next
 *      higher tier (cheaper, customer-friendly), else the next lower.
 *   4. Return null if no cell is filled for the product.
 */
export function suggestUnitPrice(
  productId: string,
  quantity: number
): number | null {
  const filled = loadCsv().get(productId);
  if (!filled || filled.length === 0) return null;

  const containingIdx = RANGES.findIndex(
    (r) => quantity >= r.min && quantity < r.max
  );

  if (containingIdx >= 0) {
    const exact = filled.find((f) => f.range.col === RANGES[containingIdx].col);
    if (exact) return exact.unitPriceIls;
  }

  const target = containingIdx >= 0 ? containingIdx : RANGES.length - 1;
  for (let offset = 1; offset < RANGES.length; offset++) {
    const higher = target + offset;
    if (higher < RANGES.length) {
      const hit = filled.find((f) => f.range.col === RANGES[higher].col);
      if (hit) return hit.unitPriceIls;
    }
    const lower = target - offset;
    if (lower >= 0) {
      const hit = filled.find((f) => f.range.col === RANGES[lower].col);
      if (hit) return hit.unitPriceIls;
    }
  }

  return null;
}

/**
 * Returns line total (₪) — unit price × quantity, or null if no pricing.
 */
export function suggestLineTotal(
  productId: string,
  quantity: number
): { unitPrice: number; total: number } | null {
  const unit = suggestUnitPrice(productId, quantity);
  if (unit == null) return null;
  return { unitPrice: unit, total: Math.round(unit * quantity) };
}

export function hasPricingData(): boolean {
  return loadCsv().size > 0;
}
