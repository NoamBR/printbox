import { NextResponse } from "next/server";
import { setOwnerDecision, verifyToken, getAppBaseUrl } from "@/lib/quotes";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const quote = verifyToken(token, "reject");
  if (!quote) {
    return NextResponse.json(
      { ok: false, error: "Token invalid or expired" },
      { status: 401 }
    );
  }

  if (quote.owner_decided_at) {
    return NextResponse.redirect(
      `${getAppBaseUrl()}/panel/quotes/${quote.id}?notice=already-decided`,
      302
    );
  }

  setOwnerDecision(quote.id, "REJECTED");
  return NextResponse.redirect(
    `${getAppBaseUrl()}/panel/quotes/${quote.id}?notice=rejected`,
    302
  );
}
