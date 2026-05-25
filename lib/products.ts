// Product manifest. Top 8 = curated "most beautiful" picks shown by default.
// Hebrew titles + categories sourced from catalog-page.html.

export type Product = {
  id: string;
  title: string;
  category: string;
  image: string;
  imageHover?: string;
};

const v1 = (id: string) => `/renders/${id}_v1.png`;
const v2 = (id: string) => `/renders/${id}_v2.png`;

const titles: Record<string, { title: string; category: string }> = {
  "PB-001": { title: "קופסת המבורגר צדפה", category: "מארזי המבורגר" },
  "PB-002": { title: "קופסת המבורגר קראפט", category: "מארזי המבורגר" },
  "PB-003": { title: "כוס משקה קר 16oz", category: "כוסות משקה" },
  "PB-004": { title: "שקית נשיאה SOS", category: "שקיות נשיאה" },
  "PB-005": { title: "קופסת ארוחה מרובעת", category: "קופסאות ארוחה" },
  "PB-006": { title: "כוס/סקופ צ'יפס", category: "כוסות חטיף" },
  "PB-007": { title: "מפיות נייר ממותגות", category: "מפיות" },
  "PB-008": { title: "כרטיסי ביקור", category: "כרטיסי ביקור" },
  "PB-009": { title: "כוס בצורת U מנייר", category: "כוסות משקה" },
  "PB-010": { title: "כוס U פלסטיק שקוף", category: "כוסות משקה" },
  "PB-011": { title: "כוס פלסטיק שקוף קלאסית", category: "כוסות משקה" },
  "PB-012": { title: "נייר עטיפה למזון", category: "אביזרי הגשה" },
  "PB-013": { title: "שקית קוקי יחידנית", category: "אריזות מאפייה" },
  "PB-014": { title: "קופסת דונאטס / מאפים", category: "אריזות מאפייה" },
  "PB-015": { title: "שקית לחם מאפייה Tin-Tie", category: "אריזות מאפייה" },
  "PB-016": { title: "מגש נשיאה ל-3 כוסות", category: "מגשי הגשה" },
  "PB-017": { title: 'מגש סכו"ם עם תכולה', category: "מגשי הגשה" },
  "PB-018": { title: "קופסת מתנה פויל יוקרתית", category: "אריזות מתנה" },
  "PB-019": { title: "קופסת ארוחה Gable", category: "קופסאות ארוחה" },
  "PB-020": { title: "קופסת קומבו עוף", category: "קופסאות ארוחה" },
  "PB-021": { title: "קופסת דונאטס מחולקת", category: "אריזות מאפייה" },
  "PB-022": { title: "מגשית", category: "מגשי הגשה" },
  "PB-023": { title: "קופסת פיצה משולשת", category: "אריזות פיצה" },
  "PB-024": { title: "קופסת פיצה מרובעת", category: "אריזות פיצה" },
  "PB-025": { title: "גליל סושי — גרסה דקה", category: "אריזות סושי" },
  "PB-026": { title: "גליל סושי (פטנט-Shape)", category: "אריזות סושי" },
  "PB-027": { title: "קערת סלט / פוקה / פסטה", category: "קערות אוכל" },
  "PB-028": { title: "כוס גלידה פינט 1PINT", category: "אריזות גלידה" },
  "PB-029": { title: "כוס חמה דופן רגילה", category: "כוסות משקה חם" },
  "PB-030": { title: "כוס חמה דופן כפולה", category: "כוסות משקה חם" },
};

function entry(id: string): Product {
  const meta = titles[id] ?? {
    title: `מוצר ${id.replace("PB-", "")}`,
    category: "מוצרים",
  };
  return {
    id,
    title: meta.title,
    category: meta.category,
    image: v1(id),
    imageHover: v2(id),
  };
}

// Curated top-8 — most iconic / commercially common
const top8 = [
  "PB-003", // cold cup
  "PB-001", // clamshell burger box
  "PB-005", // square meal box
  "PB-004", // SOS bag
  "PB-006", // fries scoop
  "PB-008", // business cards
  "PB-007", // napkins
  "PB-002", // kraft burger box
];

const remaining = Array.from({ length: 30 }, (_, i) =>
  `PB-${String(i + 1).padStart(3, "0")}`
).filter((id) => !top8.includes(id));

export const products: Product[] = [...top8, ...remaining].map(entry);

export const DEFAULT_VISIBLE = 8;
