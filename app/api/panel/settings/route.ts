import { NextResponse } from "next/server";
import { getDb, getSetting, setSetting } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings: Record<string, string> = {};
  rows.forEach((r) => (settings[r.key] = r.value));
  return NextResponse.json({
    send_mode:
      settings.send_mode ?? process.env.SEND_MODE ?? "dryrun",
    auto_reply_enabled:
      settings.auto_reply_enabled ??
      process.env.AUTO_REPLY_ENABLED ??
      "true",
    imap_last_uid: settings.imap_last_uid ?? null,
    imap_uid_validity: settings.imap_uid_validity ?? null,
    mail_configured: !!(
      (process.env.MAIL_USER || process.env.GMAIL_USER) &&
      (process.env.MAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD)
    ),
    smtp_host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    imap_host: process.env.IMAP_HOST ?? "imap.gmail.com",
    mail_user:
      process.env.MAIL_USER ?? process.env.GMAIL_USER ?? null,
    gemini_configured: !!process.env.GEMINI_API_KEY,
    gemini_model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  });
}

const schema = z.object({
  send_mode: z.enum(["dryrun", "smtp"]).optional(),
  auto_reply_enabled: z.enum(["true", "false"]).optional(),
});

export async function PATCH(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.send_mode) setSetting("send_mode", parsed.data.send_mode);
  if (parsed.data.auto_reply_enabled)
    setSetting("auto_reply_enabled", parsed.data.auto_reply_enabled);
  return NextResponse.json({ ok: true });
}
