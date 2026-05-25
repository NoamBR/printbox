import { NextResponse } from "next/server";
import { getDb, logEvent } from "@/lib/db";
import { loadSequence } from "@/lib/sequencer";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  prospect_ids: z.array(z.number().int().positive()).min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cfg = loadSequence();
  const db = getDb();
  const upd = db.prepare(
    `UPDATE prospects
     SET status = 'in_sequence',
         sequence_id = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND status IN ('new', 'completed')
       AND opted_out = 0`
  );
  let started = 0;
  const tx = db.transaction((ids: number[]) => {
    for (const id of ids) {
      const info = upd.run(cfg.sequence_id, id);
      if (info.changes > 0) {
        started++;
        logEvent(id, "sequence_started");
      }
    }
  });
  tx(parsed.data.prospect_ids);
  return NextResponse.json({ started, requested: parsed.data.prospect_ids.length });
}
