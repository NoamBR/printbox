import crypto from "node:crypto";
import { getDb, logQuoteEvent, QuoteRow } from "./db";
import { loadCatalog } from "./catalog";
import type { QuoteSubmission, CartItem } from "./quote-schema";
import { sendEmail } from "./sender";
import {
  ownerNotifyEmail,
  ownerSlackPayload,
} from "./templates/owner-notify";
import { clientConfirmationEmail } from "./templates/client-confirmation";

const TOKEN_TTL_DAYS = 14;
const FOLLOW_UP_BUSINESS_DAYS = 3;

export function getTokenSecret(): string {
  const s = process.env.QUOTE_TOKEN_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "QUOTE_TOKEN_SECRET is missing or too short (need 16+ chars)"
    );
  }
  return s;
}

export function getAppBaseUrl(): string {
  const fromEnv = process.env.APP_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://print-box.store";
}

export function generatePublicId(): string {
  const year = new Date().getUTCFullYear();
  const db = getDb();
  const row = db
    .prepare(
      "SELECT public_id FROM quotes WHERE public_id LIKE ? ORDER BY id DESC LIMIT 1"
    )
    .get(`PB-Q-${year}-%`) as { public_id: string } | undefined;
  let next = 1;
  if (row?.public_id) {
    const m = row.public_id.match(/-(\d+)$/);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  return `PB-Q-${year}-${String(next).padStart(4, "0")}`;
}

function randomToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export type TokenAction = "approve" | "reject";

export function verifyToken(
  token: string,
  action: TokenAction
): QuoteRow | null {
  if (!token) return null;
  const db = getDb();
  const column = action === "approve" ? "approve_token" : "reject_token";
  const row = db
    .prepare(`SELECT * FROM quotes WHERE ${column} = ?`)
    .get(token) as QuoteRow | undefined;
  if (!row) return null;
  const createdAt = new Date(row.created_at + "Z");
  const ageMs = Date.now() - createdAt.getTime();
  if (ageMs > TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000) return null;
  return row;
}

function findOrCreateProspect(
  email: string,
  fullName: string,
  company: string,
  phone: string
): number | null {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM prospects WHERE email = ?")
    .get(email.toLowerCase()) as { id: number } | undefined;
  if (existing) return existing.id;

  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ") || null;
  try {
    const info = db
      .prepare(
        `INSERT INTO prospects
         (company_name, industry_he, first_name, last_name, email, phone, city, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`
      )
      .run(
        company,
        "—",
        firstName || fullName,
        lastName,
        email.toLowerCase(),
        phone,
        "—",
        "Created from website quote cart submission"
      );
    return Number(info.lastInsertRowid);
  } catch (err) {
    console.warn("[quotes] could not create prospect:", err);
    return null;
  }
}

export type CreateQuoteResult = {
  quote: QuoteRow;
  items: CartItem[];
  needsClarification: boolean;
};

export function createQuote(
  submission: QuoteSubmission,
  userAgent: string | null
): CreateQuoteResult {
  const db = getDb();
  const catalog = loadCatalog();
  const catalogIds = new Set(catalog.map((p) => p.id));
  for (const item of submission.items) {
    if (!catalogIds.has(item.productId)) {
      throw new Error(`Unknown product: ${item.productId}`);
    }
    const product = catalog.find((p) => p.id === item.productId)!;
    if (product.moq != null && item.quantity < product.moq) {
      throw new Error(
        `Quantity for ${item.productId} (${item.quantity}) is below MOQ (${product.moq})`
      );
    }
  }

  const needsClarification = submission.items.some((it) => {
    const hasAnySpec =
      it.specs.dimensions ||
      it.specs.sides ||
      it.specs.finish ||
      it.specs.color ||
      it.specs.notes;
    return !hasAnySpec;
  });

  const publicId = generatePublicId();
  const approveToken = randomToken();
  const rejectToken = randomToken();
  const prospectId = findOrCreateProspect(
    submission.client.email,
    submission.client.fullName,
    submission.client.company,
    submission.client.phone
  );

  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO quotes
         (public_id, client_name, client_company, client_email, client_phone, client_notes,
          status, prospect_id, approve_token, reject_token, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING_OWNER_APPROVAL', ?, ?, ?, ?)`
      )
      .run(
        publicId,
        submission.client.fullName,
        submission.client.company,
        submission.client.email.toLowerCase(),
        submission.client.phone,
        submission.client.notes || null,
        prospectId,
        approveToken,
        rejectToken,
        userAgent
      );
    const quoteId = Number(info.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO quote_items
       (quote_id, product_id, product_title_he, product_title_en, quantity, specs_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const item of submission.items) {
      insertItem.run(
        quoteId,
        item.productId,
        item.productTitleHe,
        item.productTitleEn,
        item.quantity,
        JSON.stringify(item.specs)
      );
    }

    return quoteId;
  });

  const quoteId = tx();
  logQuoteEvent(quoteId, "submitted", {
    itemCount: submission.items.length,
    needsClarification,
  });
  if (needsClarification) {
    logQuoteEvent(quoteId, "needs_clarification", {
      reason: "one or more items submitted without dimensions/finish/notes",
    });
  }

  const quote = db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow;

  return { quote, items: submission.items, needsClarification };
}

export type QuoteWithItems = {
  quote: QuoteRow;
  items: CartItem[];
};

export function loadQuoteWithItems(id: number): QuoteWithItems | null {
  const db = getDb();
  const quote = db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(id) as QuoteRow | undefined;
  if (!quote) return null;
  const rows = db
    .prepare("SELECT * FROM quote_items WHERE quote_id = ? ORDER BY id ASC")
    .all(id) as Array<{
    product_id: string;
    product_title_he: string;
    product_title_en: string;
    quantity: number;
    specs_json: string | null;
  }>;
  const items: CartItem[] = rows.map((r) => ({
    productId: r.product_id,
    productTitleHe: r.product_title_he,
    productTitleEn: r.product_title_en,
    quantity: r.quantity,
    specs: r.specs_json
      ? (JSON.parse(r.specs_json) as CartItem["specs"])
      : { dimensions: "", sides: "", finish: "", color: "", notes: "" },
  }));
  return { quote, items };
}

export function buildApproveUrl(quote: QuoteRow): string {
  return `${getAppBaseUrl()}/api/quote/approve?token=${encodeURIComponent(
    quote.approve_token
  )}`;
}

export function buildRejectUrl(quote: QuoteRow): string {
  return `${getAppBaseUrl()}/api/quote/reject?token=${encodeURIComponent(
    quote.reject_token
  )}`;
}

export function buildPanelUrl(quote: QuoteRow): string {
  return `${getAppBaseUrl()}/panel/quotes/${quote.id}`;
}

export async function notifyOwner(
  quote: QuoteRow,
  items: CartItem[],
  opts: { needsClarification: boolean }
): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  const tasks: Array<Promise<unknown>> = [];

  if (ownerEmail) {
    const { subject, html, text } = ownerNotifyEmail(quote, items, opts);
    tasks.push(
      sendEmail({
        to: ownerEmail,
        subject,
        body: text,
        html,
        dryrunLabel: `owner-notify-${quote.public_id}`,
      })
        .then(() => logQuoteEvent(quote.id, "notify_email_sent", { ownerEmail }))
        .catch((err) => {
          console.error("[quotes] owner email failed:", err);
          logQuoteEvent(quote.id, "notify_email_failed", {
            error: String(err),
          });
        })
    );
  } else {
    logQuoteEvent(quote.id, "notify_email_skipped", {
      reason: "OWNER_EMAIL not set",
    });
  }

  if (slackUrl) {
    const payload = ownerSlackPayload(quote, items, opts);
    tasks.push(
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Slack responded ${res.status}`);
          logQuoteEvent(quote.id, "notify_slack_sent");
        })
        .catch((err) => {
          console.error("[quotes] slack notify failed:", err);
          logQuoteEvent(quote.id, "notify_slack_failed", {
            error: String(err),
          });
        })
    );
  }

  await Promise.allSettled(tasks);
}

export async function notifyCustomer(
  quote: QuoteRow,
  items: CartItem[]
): Promise<void> {
  const { subject, html, text } = clientConfirmationEmail(quote, items);
  try {
    await sendEmail({
      to: quote.client_email,
      subject,
      body: text,
      html,
      dryrunLabel: `client-confirmation-${quote.public_id}`,
    });
    logQuoteEvent(quote.id, "customer_email_sent", {
      clientEmail: quote.client_email,
    });
  } catch (err) {
    console.error("[quotes] customer email failed:", err);
    logQuoteEvent(quote.id, "customer_email_failed", { error: String(err) });
  }
}

export function setOwnerDecision(
  quoteId: number,
  decision: "APPROVED" | "REJECTED"
): QuoteRow | null {
  const db = getDb();
  const now = new Date().toISOString();
  const row = db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow | undefined;
  if (!row) return null;
  if (row.owner_decided_at) {
    return row;
  }
  db.prepare(
    "UPDATE quotes SET status = ?, owner_decided_at = ? WHERE id = ?"
  ).run(decision, now, quoteId);
  logQuoteEvent(quoteId, decision === "APPROVED" ? "owner_approved" : "owner_rejected");
  return db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow;
}

export function setQuotePrice(
  quoteId: number,
  priceIls: number,
  notes: string | null
): QuoteRow | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow | undefined;
  if (!row) return null;
  db.prepare(
    "UPDATE quotes SET final_price_ils = ?, final_price_notes = ? WHERE id = ?"
  ).run(priceIls, notes, quoteId);
  logQuoteEvent(quoteId, "price_set", { priceIls, notes });
  return db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow;
}

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 5 && dow !== 6) added++;
  }
  return d;
}

export function markSentToClient(quoteId: number): QuoteRow | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow | undefined;
  if (!row) return null;
  const now = new Date();
  const followUpDue = addBusinessDays(now, FOLLOW_UP_BUSINESS_DAYS).toISOString();
  db.prepare(
    "UPDATE quotes SET status = 'SENT_TO_CLIENT', sent_to_client_at = ?, follow_up_due_at = ? WHERE id = ?"
  ).run(now.toISOString(), followUpDue, quoteId);
  logQuoteEvent(quoteId, "client_email_sent", { followUpDue });
  return db
    .prepare("SELECT * FROM quotes WHERE id = ?")
    .get(quoteId) as QuoteRow;
}
