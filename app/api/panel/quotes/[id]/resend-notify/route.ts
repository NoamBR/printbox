import { NextResponse } from "next/server";
import { loadQuoteWithItems, notifyOwner } from "@/lib/quotes";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const n = parseInt(id, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const data = loadQuoteWithItems(n);
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  await notifyOwner(data.quote, data.items, { needsClarification: false });
  return NextResponse.json({ ok: true });
}
