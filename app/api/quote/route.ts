import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/quote-schema";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const entry = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? null,
  };

  // Dev sink: append to quotes.json in project root.
  // Replace with Resend / CRM integration in production.
  try {
    const filePath = path.join(process.cwd(), "quotes.json");
    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
    existing.push(entry);
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf-8");
  } catch (err) {
    console.error("[quote] failed to persist", err);
  }

  return NextResponse.json({ ok: true });
}
