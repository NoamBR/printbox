import { NextResponse } from "next/server";
import { getDb, logEvent } from "@/lib/db";
import { loadSequence, renderTemplate, markTouchSent } from "@/lib/sequencer";
import { currentSendMode, sendEmail } from "@/lib/sender";
import { attachmentsForStep } from "@/lib/attachments";
import type { ProspectRow } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  prospect_ids: z.array(z.number().int().positive()).min(1),
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { prospect_ids, step } = parsed.data;
  const cfg = loadSequence();
  const stepCfg = cfg.steps.find((s) => s.step === step);
  if (!stepCfg) {
    return NextResponse.json({ error: `unknown step ${step}` }, { status: 400 });
  }

  const db = getDb();
  const mode = currentSendMode();
  const results: {
    prospect_id: number;
    ok: boolean;
    message_id?: string;
    error?: string;
  }[] = [];

  for (const id of prospect_ids) {
    const prospect = db
      .prepare("SELECT * FROM prospects WHERE id = ?")
      .get(id) as ProspectRow | undefined;
    if (!prospect) {
      results.push({ prospect_id: id, ok: false, error: "ליד לא נמצא" });
      continue;
    }
    if (prospect.opted_out) {
      results.push({ prospect_id: id, ok: false, error: "הליד opt-out" });
      continue;
    }

    try {
      const rendered = renderTemplate(stepCfg.template, prospect);
      if (
        rendered.warnings.some((w) => w.startsWith("merge tags unresolved"))
      ) {
        results.push({
          prospect_id: id,
          ok: false,
          error: `שדות חסרים: ${rendered.warnings.join(", ")}`,
        });
        continue;
      }
      if (
        rendered.subject.length > cfg.validation.block_send_if_subject_over_chars
      ) {
        results.push({
          prospect_id: id,
          ok: false,
          error: `נושא ארוך מדי (${rendered.subject.length} תווים)`,
        });
        continue;
      }

      const sendRes = await sendEmail({
        to: prospect.email,
        subject: rendered.subject,
        body: rendered.body,
        prospect_id: prospect.id,
        step,
        attachments: attachmentsForStep(step),
      });
      const messageId =
        "messageId" in sendRes && sendRes.messageId
          ? sendRes.messageId
          : `<force-${prospect.id}-${step}-${Date.now()}@printbox.local>`;

      db.prepare(
        `INSERT INTO messages
           (prospect_id, direction, step, message_id, thread_root, from_addr, to_addr, subject, body)
         VALUES (?, 'out', ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        prospect.id,
        step,
        messageId,
        step === 1 ? messageId : null,
        process.env.SENDER_EMAIL ??
          process.env.MAIL_USER ??
          process.env.GMAIL_USER ??
          "noreply@printbox.local",
        prospect.email,
        rendered.subject,
        rendered.body
      );

      db.prepare(
        `UPDATE prospects
           SET status = CASE WHEN status IN ('replied','opted_out') THEN status ELSE 'in_sequence' END,
               sequence_id = COALESCE(sequence_id, ?),
               updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(cfg.sequence_id, prospect.id);
      markTouchSent(prospect.id, step);
      logEvent(prospect.id, mode === "smtp" ? "sent" : "sent_dryrun", step, {
        message_id: messageId,
        forced: true,
      });
      results.push({ prospect_id: id, ok: true, message_id: messageId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logEvent(id, "error", step, { error: msg, forced: true });
      results.push({ prospect_id: id, ok: false, error: msg });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;
  return NextResponse.json({
    mode,
    step,
    sent,
    failed,
    results,
    at: new Date().toISOString(),
  });
}
