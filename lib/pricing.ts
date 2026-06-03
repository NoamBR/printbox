import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const CSV_PATH = path.join(
  process.cwd(),
  "pricing",
  "PrintBox-Pricing-Template.csv"
);

export type PriceTier = { qty: number; unitPriceIls: number };
export type ProductPrices = { productId: string; tiers: PriceTier[] };

const TIER_QUANTITIES = [
  500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
] as const;

let _cache: Map<string, PriceTier[]> | null = null;
let _cacheMtime = 0;

function loadCsv(): Map<string, PriceTier[]> {
  if (!fs.existsSync(CSV_PATH)) return new Map();
  const stat = fs.statSync(CSV_PATH);
  if (_cache && stat.mtimeMs === _cacheMtime) return _cache;
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const noBom = raw.replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(noBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const map = new Map<string, PriceTier[]>();
  for (const row of parsed.data) {
    const id = (row.product_id ?? "").trim();
    if (!/^PB-\d{3}$/.test(id)) continue;
    const tiers: PriceTier[] = [];
    for (const qty of TIER_QUANTITIES) {
      const cell = (row[`unit_price_at_${qty}`] ?? "").trim();
      if (!cell) continue;
      const num = Number(cell);
      if (Number.isFinite(num) && num > 0) tiers.push({ qty, unitPriceIls: num });
    }
    if (tiers.length > 0) map.set(id, tiers);
  }
  _cache = map;
  _cacheMtime = stat.mtimeMs;
  return map;
}

/**
 * Returns suggested unit price (₪) for the given product and quantity.
 * Uses the tier matching the largest qty ≤ requested. Returns null if no data.
 */
export function suggestUnitPrice(
  productId: string,
  quantity: number
): number | null {
  const map = loadCsv();
  const tiers = map.get(productId);
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  let chosen: PriceTier | null = null;
  for (const t of sorted) {
    if (quantity >= t.qty) chosen = t;
  }
  return chosen ? chosen.unitPriceIls : sorted[0].unitPriceIls;
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
