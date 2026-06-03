import { NextResponse } from "next/server";
import { getDb, QuoteEventRow } from "@/lib/db";
import {
  loadQuoteWithItems,
  setOwnerDecision,
  setQuotePrice,
} from "@/lib/quotes";
import { z } from "zod";

export const runtime = "nodejs";

function parseId(idParam: string): number | null {
  const n = parseInt(idParam, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const n = parseId(id);
  if (!n) return NextResponse.json({ ok: false }, { status: 400 });
  const data = loadQuoteWithItems(n);
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  const db = getDb();
  const events = db
    .prepare("SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at ASC")
    .all(n) as QuoteEventRow[];
  return NextResponse.json({ ok: true, ...data, events });
}

const patchSchema = z.object({
  action: z.enum(["set_price", "approve", "reject"]),
  priceIls: z.number().int().nonnegative().optional(),
  priceNotes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const n = parseId(id);
  if (!n) return NextResponse.json({ ok: false }, { status: 400 });

  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  if (parsed.data.action === "approve") {
    const row = setOwnerDecision(n, "APPROVED");
    if (!row) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, quote: row });
  }
  if (parsed.data.action === "reject") {
    const row = setOwnerDecision(n, "REJECTED");
    if (!row) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, quote: row });
  }
  if (parsed.data.action === "set_price") {
    if (parsed.data.priceIls == null) {
      return NextResponse.json(
        { ok: false, error: "priceIls required" },
        { status: 422 }
      );
    }
    const row = setQuotePrice(
      n,
      parsed.data.priceIls,
      parsed.data.priceNotes ?? null
    );
    if (!row) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, quote: row });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
