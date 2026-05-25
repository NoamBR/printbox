import { ImapFlow, type FetchMessageObject } from "imapflow";
import { simpleParser, ParsedMail } from "mailparser";
import { getDb, getSetting, setSetting } from "./db";

export type InboundMessage = {
  uid: number;
  messageId: string | null;
  inReplyTo: string | null;
  references: string[];
  from: string | null;
  to: string | null;
  subject: string | null;
  text: string;
  html: string | null;
  date: Date | null;
  headers: string;
  autoSubmitted: boolean;
  precedenceBulk: boolean;
};

export async function fetchNewInbound(): Promise<InboundMessage[]> {
  const user = process.env.MAIL_USER ?? process.env.GMAIL_USER;
  const passRaw =
    process.env.MAIL_PASSWORD ?? process.env.GMAIL_APP_PASSWORD;
  if (!user || !passRaw) {
    throw new Error("MAIL_USER / MAIL_PASSWORD חסרים ב-.env.local");
  }
  const pass = passRaw.replace(/\s+/g, "");
  const host = process.env.IMAP_HOST ?? "imap.gmail.com";
  const port = parseInt(process.env.IMAP_PORT ?? "993", 10);
  const secure =
    (process.env.IMAP_SECURE ?? (port === 993 ? "true" : "false")) === "true";
  const client = new ImapFlow({
    host,
    port,
    secure,
    auth: { user, pass },
    logger: false,
  });

  const out: InboundMessage[] = [];
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const status = await client.status("INBOX", { uidValidity: true, uidNext: true });
      const storedValidity = getSetting("imap_uid_validity");
      const storedLast = parseInt(getSetting("imap_last_uid") ?? "0", 10);
      const currentValidity = String(status.uidValidity);

      let sinceUid: number;
      if (storedValidity !== currentValidity) {
        sinceUid = status.uidNext ?? 1;
        setSetting("imap_uid_validity", currentValidity);
        setSetting("imap_last_uid", String(sinceUid - 1));
      } else {
        sinceUid = storedLast + 1;
      }

      const range = `${sinceUid}:*`;
      const fetched: FetchMessageObject[] = [];
      for await (const msg of client.fetch(
        range,
        { uid: true, source: true, envelope: true, internalDate: true },
        { uid: true }
      )) {
        if (msg.uid < sinceUid) continue;
        fetched.push(msg);
      }

      let maxUid = storedLast;
      for (const msg of fetched) {
        const source = msg.source as Buffer | undefined;
        if (!source) continue;
        const parsed: ParsedMail = await simpleParser(source);
        const refsHeader = parsed.headers.get("references");
        const references: string[] = [];
        if (typeof refsHeader === "string") {
          references.push(...refsHeader.split(/\s+/).filter(Boolean));
        } else if (Array.isArray(refsHeader)) {
          references.push(...refsHeader.flatMap((r) => String(r).split(/\s+/)).filter(Boolean));
        }
        const autoSubmittedHeader = String(parsed.headers.get("auto-submitted") ?? "").toLowerCase();
        const precedenceHeader = String(parsed.headers.get("precedence") ?? "").toLowerCase();
        const fromAddr =
          parsed.from?.value?.[0]?.address ?? parsed.from?.text ?? null;
        const toAddr = Array.isArray(parsed.to)
          ? parsed.to[0]?.value?.[0]?.address ?? null
          : parsed.to?.value?.[0]?.address ?? null;
        out.push({
          uid: msg.uid,
          messageId: parsed.messageId ?? null,
          inReplyTo: (parsed.inReplyTo as string | undefined) ?? null,
          references,
          from: fromAddr,
          to: toAddr,
          subject: parsed.subject ?? null,
          text: parsed.text ?? "",
          html: parsed.html || null,
          date: parsed.date ?? null,
          headers: parsed.headerLines.map((h) => h.line).join("\n"),
          autoSubmitted: autoSubmittedHeader !== "" && autoSubmittedHeader !== "no",
          precedenceBulk: /^(bulk|list|junk)$/i.test(precedenceHeader),
        });
        if (msg.uid > maxUid) maxUid = msg.uid;
      }

      if (maxUid > storedLast) {
        setSetting("imap_last_uid", String(maxUid));
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
  return out;
}

export function findProspectIdFromInbound(msg: InboundMessage): number | null {
  const db = getDb();
  const chain = [msg.inReplyTo, ...msg.references].filter(Boolean) as string[];
  for (const mid of chain) {
    const row = db
      .prepare(
        "SELECT prospect_id FROM messages WHERE message_id = ? AND prospect_id IS NOT NULL LIMIT 1"
      )
      .get(mid) as { prospect_id: number } | undefined;
    if (row?.prospect_id) return row.prospect_id;
  }
  if (msg.from) {
    const norm = msg.from.toLowerCase();
    const row = db
      .prepare("SELECT id FROM prospects WHERE LOWER(email) = ? LIMIT 1")
      .get(norm) as { id: number } | undefined;
    if (row?.id) return row.id;
  }
  return null;
}
