import { NextResponse } from "next/server";
import { quoteSubmissionSchema } from "@/lib/quote-schema";
import { createQuote, notifyCustomer, notifyOwner } from "@/lib/quotes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = quoteSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const { quote, items, needsClarification } = createQuote(
      parsed.data,
      req.headers.get("user-agent")
    );
    notifyOwner(quote, items, { needsClarification }).catch((err) => {
      console.error("[quote-cart/submit] notifyOwner threw:", err);
    });
    notifyCustomer(quote, items).catch((err) => {
      console.error("[quote-cart/submit] notifyCustomer threw:", err);
    });
    return NextResponse.json({ ok: true, publicId: quote.public_id });
  } catch (err) {
    console.error("[quote-cart/submit] failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
