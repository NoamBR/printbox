import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT e.id, e.prospect_id, e.type, e.step, e.meta_json, e.created_at,
              p.company_name, p.email
       FROM events e
       LEFT JOIN prospects p ON p.id = e.prospect_id
       ORDER BY e.id DESC
       LIMIT ?`
    )
    .all(limit);
  return NextResponse.json({ events: rows });
}
