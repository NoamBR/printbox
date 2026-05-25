import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const db = getDb();
  const where: string[] = ["m.direction = 'in'"];
  if (filter === "held") where.push("m.held_for_review = 1");
  if (filter === "auto_replied")
    where.push(
      "EXISTS (SELECT 1 FROM messages r WHERE r.prospect_id = m.prospect_id AND r.auto_replied = 1 AND r.id > m.id)"
    );
  if (filter === "opt_out") where.push("m.classification = 'opt_out'");
  const rows = db
    .prepare(
      `SELECT m.id, m.prospect_id, m.subject, m.from_addr, m.classification,
              m.confidence, m.held_for_review, m.created_at, m.thread_root,
              p.company_name, p.status as prospect_status
       FROM messages m
       LEFT JOIN prospects p ON p.id = m.prospect_id
       WHERE ${where.join(" AND ")}
       ORDER BY m.id DESC
       LIMIT 200`
    )
    .all();
  return NextResponse.json({ messages: rows });
}
