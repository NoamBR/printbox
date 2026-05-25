import { NextResponse } from "next/server";
import { getDb, ProspectRow } from "@/lib/db";
import { loadSequence, renderTemplate } from "@/lib/sequencer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const pid = parseInt(id, 10);
  const db = getDb();
  const prospect = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(pid) as ProspectRow | undefined;
  if (!prospect)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  const cfg = loadSequence();
  const rendered = cfg.steps.map((s) => {
    try {
      const r = renderTemplate(s.template, prospect);
      return { step: s.step, offset_days: s.offset_days, ...r };
    } catch (err) {
      return {
        step: s.step,
        offset_days: s.offset_days,
        subject: "",
        body: "",
        warnings: [err instanceof Error ? err.message : String(err)],
      };
    }
  });
  return NextResponse.json({ prospect, rendered });
}
