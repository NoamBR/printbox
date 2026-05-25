import { NextResponse } from "next/server";
import { getDb, logEvent } from "@/lib/db";
import {
  getDueProspects,
  getThreadHeadersForFollowup,
  loadSequence,
  markTouchSent,
  renderTemplate,
} from "@/lib/sequencer";
import { currentSendMode, sendEmail } from "@/lib/sender";
import { attachmentsForStep } from "@/lib/attachments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request) {
  const cfg = loadSequence();
  const due = getDueProspects();
  const sentByStep: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const errors: { prospect_id: number; error: string }[] = [];
  let skipped = 0;
  const mode = currentSendMode();
  const db = getDb();

  for (const { prospect, step } of due) {
    const stepCfg = cfg.steps.find((s) => s.step === step)!;
    try {
      const rendered = renderTemplate(stepCfg.template, prospect);
      if (
        cfg.validation.block_send_if_missing_merge_field &&
        rendered.warnings.some((w) => w.startsWith("merge tags unresolved"))
      ) {
        skipped++;
        logEvent(prospect.id, "error", step, {
          reason: "merge_tags_unresolved",
          warnings: rendered.warnings,
        });
        continue;
      }
      if (
        rendered.subject.length > cfg.validation.block_send_if_subject_over_chars
      ) {
        skipped++;
        logEvent(prospect.id, "error", step, {
          reason: "subject_too_long",
          length: rendered.subject.length,
        });
        continue;
      }

      let thread: { inReplyTo?: string; references: string[]; threadRoot?: string } = {
        references: [],
      };
      let subject = rendered.subject;
      if (step === 2 || step === 3) {
        thread = getThreadHeadersForFollowup(prospect.id, step);
        if (thread.inReplyTo && !/^Re:/i.test(subject)) {
          subject = `Re: ${subject}`;
        }
      }

      const sendRes = await sendEmail({
        to: prospect.email,
        subject,
        body: rendered.body,
        prospect_id: prospect.id,
        step,
        inReplyTo: thread.inReplyTo,
        references: thread.references,
        attachments: attachmentsForStep(step),
      });

      const messageId =
        "messageId" in sendRes && sendRes.messageId
          ? sendRes.messageId
          : `<dryrun-${prospect.id}-${step}-${Date.now()}@printbox.local>`;
      const threadRoot = thread.threadRoot ?? (step === 1 ? messageId : null);

      db.prepare(
        `INSERT INTO messages
           (prospect_id, direction, step, message_id, in_reply_to, references_chain,
            thread_root, from_addr, to_addr, subject, body)
         VALUES (?, 'out', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        prospect.id,
        step,
        messageId,
        thread.inReplyTo ?? null,
        thread.references.length ? thread.references.join(" ") : null,
        threadRoot,
        process.env.SENDER_EMAIL ?? process.env.MAIL_USER ?? process.env.GMAIL_USER ?? "noreply@printbox.local",
        prospect.email,
        subject,
        rendered.body
      );

      markTouchSent(prospect.id, step);
      logEvent(prospect.id, mode === "smtp" ? "sent" : "sent_dryrun", step, {
        message_id: messageId,
      });
      sentByStep[step]++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ prospect_id: prospect.id, error: msg });
      logEvent(prospect.id, "error", step, { error: msg });
    }
  }

  return NextResponse.json({
    processed: due.length,
    sentByStep,
    skipped,
    errors,
    mode,
    at: new Date().toISOString(),
  });
}
