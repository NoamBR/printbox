import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sender";

export const runtime = "nodejs";
// Public route — auth via Vercel's CRON_SECRET Bearer token.
// Don't pre-render: every call should run live.
export const dynamic = "force-dynamic";

const ENV_KEYS = [
  "OWNER_EMAIL",
  "SENDER_EMAIL",
  "MAIL_USER",
  "MAIL_PASSWORD",
  "SMTP_HOST",
  "APP_BASE_URL",
] as const;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    return NextResponse.json(
      { ok: false, error: "OWNER_EMAIL not set" },
      { status: 500 }
    );
  }

  const envStatus = ENV_KEYS.map((k) => ({ key: k, present: !!process.env[k] }));
  const missing = envStatus.filter((s) => !s.present).map((s) => s.key);
  const allOk = missing.length === 0;

  const now = new Date();
  const nowIsr = now.toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = `PrintBox heartbeat · ${allOk ? "OK" : "חסר משתנה סביבה"}`;
  const body = [
    `בדיקת חיוּת אוטומטית`,
    nowIsr,
    ``,
    `סטטוס: ${allOk ? "תקין" : "יש להשלים הגדרה"}`,
    ``,
    `משתני סביבה:`,
    ...envStatus.map((s) => `  ${s.present ? "✓" : "✗"} ${s.key}`),
    ``,
    `אתר: ${process.env.APP_BASE_URL ?? "—"}`,
    `Vercel: ${process.env.VERCEL_URL ?? "—"}`,
    ``,
    `(נשלח אוטומטית כל 12 שעות)`,
  ].join("\n");

  try {
    await sendEmail({
      to: ownerEmail,
      subject,
      body,
      dryrunLabel: `heartbeat-${now.toISOString().replace(/[:.]/g, "-")}`,
    });
    return NextResponse.json({ ok: true, allOk, missing, at: now.toISOString() });
  } catch (err) {
    console.error("[cron/heartbeat] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "send failed", detail: String(err) },
      { status: 502 }
    );
  }
}
