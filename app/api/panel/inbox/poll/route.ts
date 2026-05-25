import { NextResponse } from "next/server";
import { getDb, getSetting, logEvent, MessageRow, ProspectRow } from "@/lib/db";
import { fetchNewInbound, findProspectIdFromInbound, InboundMessage } from "@/lib/imap";
import { classifyInbound, Intent } from "@/lib/classifier";
import { draftReply } from "@/lib/drafter";
import { sendEmail, currentSendMode } from "@/lib/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AUTO_REPLY_INTENTS: Intent[] = ["interested", "objection", "question"];
const CONFIDENCE_THRESHOLD = 0.75;
const AUTO_REPLY_COOLDOWN_HOURS = 24;

export async function POST(_req: Request) {
  const db = getDb();
  let inbounds: InboundMessage[] = [];
  try {
    inbounds = await fetchNewInbound();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const summary = {
    fetched: inbounds.length,
    matched: 0,
    classified: {} as Record<string, number>,
    auto_replied: 0,
    held: 0,
    opted_out: 0,
    skipped_no_match: 0,
    errors: [] as string[],
    mode: currentSendMode(),
  };

  const myAddress = (
    process.env.MAIL_USER ?? process.env.GMAIL_USER ?? ""
  ).toLowerCase();
  const autoReplyEnabled =
    (getSetting("auto_reply_enabled") ??
      process.env.AUTO_REPLY_ENABLED ??
      "true").toLowerCase() === "true";

  for (const msg of inbounds) {
    try {
      if (msg.from && msg.from.toLowerCase() === myAddress) {
        continue;
      }

      const prospectId = findProspectIdFromInbound(msg);
      if (!prospectId) {
        summary.skipped_no_match++;
        db.prepare(
          `INSERT OR IGNORE INTO messages
             (prospect_id, direction, message_id, in_reply_to, references_chain,
              from_addr, to_addr, subject, body, imap_uid, raw_headers)
           VALUES (NULL, 'in', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          msg.messageId,
          msg.inReplyTo,
          msg.references.join(" ") || null,
          msg.from,
          msg.to,
          msg.subject,
          msg.text,
          msg.uid,
          msg.headers
        );
        continue;
      }

      summary.matched++;

      const cls = await classifyInbound(msg.text, msg.subject, {
        autoSubmitted: msg.autoSubmitted,
        precedenceBulk: msg.precedenceBulk,
      });
      summary.classified[cls.intent] = (summary.classified[cls.intent] ?? 0) + 1;

      const threadRootRow = db
        .prepare(
          `SELECT thread_root FROM messages
           WHERE prospect_id = ? AND direction = 'out' AND step = 1
           ORDER BY id ASC LIMIT 1`
        )
        .get(prospectId) as { thread_root: string | null } | undefined;
      const threadRoot = threadRootRow?.thread_root ?? null;

      const inboundInsert = db
        .prepare(
          `INSERT OR IGNORE INTO messages
             (prospect_id, direction, message_id, in_reply_to, references_chain,
              thread_root, from_addr, to_addr, subject, body, imap_uid,
              classification, confidence, raw_headers)
           VALUES (?, 'in', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          prospectId,
          msg.messageId,
          msg.inReplyTo,
          msg.references.join(" ") || null,
          threadRoot,
          msg.from,
          msg.to,
          msg.subject,
          msg.text,
          msg.uid,
          cls.intent,
          cls.confidence,
          msg.headers
        );
      const inboundMsgRowId = inboundInsert.lastInsertRowid as number;

      if (cls.intent !== "out_of_office") {
        db.prepare(
          `UPDATE prospects
             SET replied_at = COALESCE(replied_at, CURRENT_TIMESTAMP),
                 status = CASE WHEN status IN ('opted_out') THEN status ELSE 'replied' END,
                 updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(prospectId);
      }

      if (cls.intent === "opt_out") {
        db.prepare(
          `UPDATE prospects
             SET opted_out = 1, status = 'opted_out', updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(prospectId);
        logEvent(prospectId, "opted_out_inbound", null, {
          reason: cls.reason,
          source: cls.source,
        });
        summary.opted_out++;
        continue;
      }

      logEvent(prospectId, "inbound_classified", null, {
        intent: cls.intent,
        confidence: cls.confidence,
        source: cls.source,
      });

      const shouldAutoReply =
        autoReplyEnabled &&
        AUTO_REPLY_INTENTS.includes(cls.intent) &&
        cls.confidence >= CONFIDENCE_THRESHOLD;

      if (!shouldAutoReply) {
        if (
          autoReplyEnabled &&
          AUTO_REPLY_INTENTS.includes(cls.intent) &&
          cls.confidence < CONFIDENCE_THRESHOLD
        ) {
          db.prepare(
            "UPDATE messages SET held_for_review = 1 WHERE id = ?"
          ).run(inboundMsgRowId);
          summary.held++;
        }
        continue;
      }

      const recentAuto = db
        .prepare(
          `SELECT COUNT(*) as c FROM messages
           WHERE prospect_id = ? AND direction = 'out' AND auto_replied = 1
             AND created_at >= datetime('now', '-${AUTO_REPLY_COOLDOWN_HOURS} hours')`
        )
        .get(prospectId) as { c: number };
      if (recentAuto.c > 0) {
        db.prepare("UPDATE messages SET held_for_review = 1 WHERE id = ?").run(
          inboundMsgRowId
        );
        summary.held++;
        logEvent(prospectId, "auto_reply_rate_limited");
        continue;
      }

      const prospect = db
        .prepare("SELECT * FROM prospects WHERE id = ?")
        .get(prospectId) as ProspectRow;
      const prior = db
        .prepare(
          `SELECT direction, subject, body, created_at FROM messages
           WHERE prospect_id = ? AND id < ?
           ORDER BY id ASC`
        )
        .all(prospectId, inboundMsgRowId) as Pick<
        MessageRow,
        "direction" | "subject" | "body" | "created_at"
      >[];

      const draft = await draftReply({
        prospect,
        inboundSubject: msg.subject,
        inboundText: msg.text,
        priorMessages: prior,
        intent: cls.intent,
        intentReason: cls.reason,
      });

      const replySubject = msg.subject
        ? /^re:/i.test(msg.subject)
          ? msg.subject
          : `Re: ${msg.subject}`
        : "Re: PrintBox";
      const references = [...msg.references];
      if (msg.messageId) references.push(msg.messageId);
      else if (threadRoot) references.push(threadRoot);

      const sendRes = await sendEmail({
        to: prospect.email,
        subject: replySubject,
        body: draft.body,
        prospect_id: prospect.id,
        step: 0,
        inReplyTo: msg.messageId ?? threadRoot ?? undefined,
        references,
      });
      const outMsgId =
        "messageId" in sendRes && sendRes.messageId
          ? sendRes.messageId
          : `<auto-${prospect.id}-${Date.now()}@printbox.local>`;

      db.prepare(
        `INSERT INTO messages
           (prospect_id, direction, message_id, in_reply_to, references_chain,
            thread_root, from_addr, to_addr, subject, body, auto_replied)
         VALUES (?, 'out', ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).run(
        prospectId,
        outMsgId,
        msg.messageId ?? threadRoot ?? null,
        references.join(" ") || null,
        threadRoot,
        process.env.SENDER_EMAIL ?? process.env.MAIL_USER ?? process.env.GMAIL_USER ?? "noreply@printbox.local",
        prospect.email,
        replySubject,
        draft.body
      );

      logEvent(prospectId, "auto_replied", null, {
        model: draft.model,
        intent: cls.intent,
        input_tokens: draft.usage?.input_tokens,
        output_tokens: draft.usage?.output_tokens,
      });
      summary.auto_replied++;
    } catch (err) {
      summary.errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString(), ...summary });
}
