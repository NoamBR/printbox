import { NextResponse } from "next/server";
import { getDb, QuoteRow } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const db = getDb();

  let rows: QuoteRow[];
  if (status) {
    rows = db
      .prepare(
        "SELECT * FROM quotes WHERE status = ? ORDER BY created_at DESC LIMIT 500"
      )
      .all(status) as QuoteRow[];
  } else {
    rows = db
      .prepare("SELECT * FROM quotes ORDER BY created_at DESC LIMIT 500")
      .all() as QuoteRow[];
  }

  const itemAgg = db
    .prepare(
      "SELECT quote_id, COUNT(*) as item_count, SUM(quantity) as total_qty FROM quote_items GROUP BY quote_id"
    )
    .all() as Array<{ quote_id: number; item_count: number; total_qty: number }>;
  const aggMap = new Map(itemAgg.map((r) => [r.quote_id, r]));

  const pendingCount = (db
    .prepare("SELECT COUNT(*) as c FROM quotes WHERE status = 'PENDING_OWNER_APPROVAL'")
    .get() as { c: number }).c;

  return NextResponse.json({
    ok: true,
    pendingCount,
    quotes: rows.map((r) => ({
      ...r,
      item_count: aggMap.get(r.id)?.item_count ?? 0,
      total_qty: aggMap.get(r.id)?.total_qty ?? 0,
    })),
  });
}
