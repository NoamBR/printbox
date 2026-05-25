import fs from "node:fs";
import path from "node:path";

export type CatalogProduct = {
  id: string;
  sku: string;
  category: string;
  categoryEn: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  material: string;
  dimensions?: string;
  moq: number | null;
  image: string;
};

const CATALOG_DIR = path.join(process.cwd(), "catalog");

const ORDER = [
  "PB-003",
  "PB-001",
  "PB-005",
  "PB-004",
  "PB-006",
  "PB-008",
  "PB-007",
  "PB-002",
];

let _cache: CatalogProduct[] | null = null;

export function loadCatalog(): CatalogProduct[] {
  if (_cache) return _cache;
  const items: CatalogProduct[] = [];
  for (const id of ORDER) {
    const files = fs.readdirSync(CATALOG_DIR).filter(
      (f) => f.startsWith(`${id}_`) && f.endsWith(".json")
    );
    if (files.length === 0) continue;
    const raw = fs.readFileSync(path.join(CATALOG_DIR, files[0]), "utf8");
    const j = JSON.parse(raw) as Record<string, unknown>;
    const specs = (j.specs ?? {}) as Record<string, unknown>;
    items.push({
      id: String(j.product_id),
      sku: String(j.sku ?? ""),
      category: extractCategory(String(j.category ?? ""), "he"),
      categoryEn: String(j.category ?? ""),
      titleHe: String(j.title_he ?? ""),
      titleEn: String(j.title_en ?? ""),
      descriptionHe: String(j.description_he ?? ""),
      material: String(specs.material ?? ""),
      dimensions:
        typeof specs.approx_dimensions_mm === "string"
          ? specs.approx_dimensions_mm
          : undefined,
      moq:
        typeof specs.moq_units === "number" ? (specs.moq_units as number) : null,
      image: `/renders/${j.product_id}_branded.png`,
    });
  }
  _cache = items;
  return items;
}

const CATEGORY_HE: Record<string, string> = {
  "Beverage Packaging / Cold Cups": "כוסות משקה",
  "Food Packaging / Burger Boxes": "מארזי המבורגר",
  "Food Packaging / Meal Boxes": "קופסאות ארוחה",
  "Takeaway Bags / SOS Paper Bags": "שקיות נשיאה",
  "Food Packaging / Fries & Snack Cups": "כוסות חטיף",
  "Brand Print / Business Cards": "כרטיסי ביקור",
  "Tabletop & Accessories / Printed Napkins": "מפיות מודפסות",
};

function extractCategory(raw: string, locale: "he" | "en"): string {
  if (locale === "he") return CATEGORY_HE[raw] ?? raw;
  return raw;
}
