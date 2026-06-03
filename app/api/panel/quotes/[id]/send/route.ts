import { NextResponse } from "next/server";
import { loadQuoteWithItems, markSentToClient } from "@/lib/quotes";
import { sendEmail } from "@/lib/sender";
import { clientQuotationEmail } from "@/lib/templates/client-quotation";
import { logQuoteEvent } from "@/lib/db";

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
  const { quote, items } = data;
  if (quote.status !== "APPROVED") {
    return NextResponse.json(
      { ok: false, error: "Quote must be APPROVED before sending" },
      { status: 409 }
    );
  }
  if (quote.final_price_ils == null) {
    return NextResponse.json(
      { ok: false, error: "Final price not set" },
      { status: 409 }
    );
  }

  const { subject, html, text } = clientQuotationEmail(quote, items);
  try {
    await sendEmail({
      to: quote.client_email,
      subject,
      body: text,
      html,
      dryrunLabel: `client-quotation-${quote.public_id}`,
    });
  } catch (err) {
    logQuoteEvent(quote.id, "client_email_failed", { error: String(err) });
    return NextResponse.json(
      { ok: false, error: "Email send failed" },
      { status: 502 }
    );
  }

  const updated = markSentToClient(quote.id);
  return NextResponse.json({ ok: true, quote: updated });
}
