import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT status, COUNT(*) as c FROM prospects GROUP BY status`
    )
    .all() as { status: string; c: number }[];
  const byStatus: Record<string, number> = {};
  rows.forEach((r) => (byStatus[r.status] = r.c));

  const total = (db.prepare("SELECT COUNT(*) as c FROM prospects").get() as { c: number }).c;
  const optedOut = (db.prepare("SELECT COUNT(*) as c FROM prospects WHERE opted_out = 1").get() as { c: number }).c;
  const replied = (db.prepare("SELECT COUNT(*) as c FROM prospects WHERE replied_at IS NOT NULL").get() as { c: number }).c;
  const sentLast24h = (db
    .prepare(
      `SELECT COUNT(*) as c FROM events
       WHERE type = 'sent_dryrun'
       AND created_at >= datetime('now', '-1 day')`
    )
    .get() as { c: number }).c;

  return NextResponse.json({
    total,
    byStatus,
    optedOut,
    replied,
    sentLast24h,
  });
}
