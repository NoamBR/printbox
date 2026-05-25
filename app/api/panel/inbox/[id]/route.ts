import { NextResponse } from "next/server";
import { getDb, MessageRow } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const mid = parseInt(id, 10);
  const db = getDb();
  const m = db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(mid) as MessageRow | undefined;
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });
  let thread: MessageRow[] = [];
  if (m.prospect_id) {
    thread = db
      .prepare(
        "SELECT * FROM messages WHERE prospect_id = ? ORDER BY id ASC"
      )
      .all(m.prospect_id) as MessageRow[];
  }
  const prospect = m.prospect_id
    ? db.prepare("SELECT * FROM prospects WHERE id = ?").get(m.prospect_id)
    : null;
  return NextResponse.json({ message: m, thread, prospect });
}
