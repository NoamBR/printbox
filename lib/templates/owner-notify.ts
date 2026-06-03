import type { QuoteRow } from "../db";
import type { CartItem } from "../quote-schema";
import { buildApproveUrl, buildRejectUrl, buildPanelUrl } from "../quotes";
import { suggestLineTotal } from "../pricing";

function ils(amount: number): string {
  // Integers render as ₪3,000; sub-shekel unit prices render as ₪0.40
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function specBullets(it: CartItem): string {
  const parts: string[] = [];
  if (it.specs.dimensions) parts.push(`מידות: ${it.specs.dimensions}`);
  if (it.specs.sides) parts.push(`צדדים: ${it.specs.sides}`);
  if (it.specs.finish) parts.push(`גימור: ${it.specs.finish}`);
  if (it.specs.color) parts.push(`צבע: ${it.specs.color}`);
  if (it.specs.notes) parts.push(`הערות: ${it.specs.notes}`);
  return parts.join(" · ");
}

export function ownerNotifyEmail(
  quote: QuoteRow,
  items: CartItem[],
  opts: { needsClarification: boolean }
): { subject: string; html: string; text: string } {
  const approveUrl = buildApproveUrl(quote);
  const rejectUrl = buildRejectUrl(quote);
  const panelUrl = buildPanelUrl(quote);
  const totalQty = items.reduce((a, b) => a + b.quantity, 0);

  const subject = `הצעת מחיר חדשה ${quote.public_id} – ${quote.client_company}`;

  let suggestedTotal = 0;
  let suggestedComplete = true;

  const itemRowsHtml = items
    .map((it) => {
      const specsLine = specBullets(it);
      const price = suggestLineTotal(it.productId, it.quantity);
      if (price) suggestedTotal += price.total;
      else suggestedComplete = false;
      const priceLine = price
        ? `<div style="color:#d4af6a;font-size:13px;margin-top:6px;direction:ltr;text-align:right;font-family:'Frank Ruhl Libre',Georgia,serif;">
             ${ils(price.unitPrice)}/יח׳ &middot; ${ils(price.total)}
           </div>`
        : `<div style="color:#a39888;font-size:12px;margin-top:6px;font-style:italic;">תמחור חסר ב-pricing/PrintBox-Pricing-Template.csv</div>`;
      return `
        <tr>
          <td style="padding:14px 16px;border-top:1px solid #2a221d;color:#e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:15px;">
            <div style="font-weight:600;">${esc(it.productTitleHe)}</div>
            <div style="color:#a39888;font-size:12px;margin-top:2px;">${esc(it.productId)} · ${esc(it.productTitleEn)}</div>
            ${specsLine ? `<div style="color:#c2b59f;font-size:13px;margin-top:6px;">${esc(specsLine)}</div>` : ""}
            ${priceLine}
          </td>
          <td style="padding:14px 16px;border-top:1px solid #2a221d;color:#d4af6a;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:18px;text-align:left;white-space:nowrap;">
            ${it.quantity.toLocaleString("he-IL")}
          </td>
        </tr>`;
    })
    .join("");

  const suggestedBlock = suggestedTotal > 0
    ? `<tr><td colspan="2" style="padding:18px 16px 4px;border-top:2px solid #d4af6a;text-align:right;color:#e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;">
         <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a39888;margin-bottom:6px;">הצעת תמחור מהמטריצה${suggestedComplete ? "" : " (חלקי)"}</div>
         <div style="font-size:22px;font-weight:600;color:#d4af6a;direction:ltr;text-align:right;">${ils(suggestedTotal)}</div>
       </td></tr>`
    : "";

  const clarif = opts.needsClarification
    ? `<div style="background:#3a2a1f;border:1px solid #7a5a3a;color:#f0c98a;padding:12px 16px;border-radius:4px;margin:16px 0;font-size:13px;text-align:right;">
        ⚠ בקשה זו נשלחה ללא פרטי גימור/מידות באחד או יותר מהפריטים — מומלץ לחזור ללקוח לפני התמחור.
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:#1a130e;font-family:'Frank Ruhl Libre',Georgia,serif;color:#e8dccb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#221911;border:1px solid #2a221d;border-radius:6px;">
    <tr><td style="padding:24px 28px;border-bottom:1px solid #2a221d;">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af6a;margin-bottom:8px;">PrintBox · הצעת מחיר חדשה</div>
      <div style="font-size:24px;font-weight:500;color:#f5ecdc;">${esc(quote.public_id)}</div>
      <div style="font-size:14px;color:#a39888;margin-top:4px;">${esc(quote.client_company)} · ${esc(quote.client_name)}</div>
    </td></tr>
    <tr><td style="padding:20px 28px;font-size:14px;line-height:1.7;color:#c2b59f;text-align:right;">
      <div><strong style="color:#e8dccb;">אימייל:</strong> <a href="mailto:${esc(quote.client_email)}" style="color:#d4af6a;direction:ltr;display:inline-block;">${esc(quote.client_email)}</a></div>
      <div><strong style="color:#e8dccb;">טלפון:</strong> <span dir="ltr">${esc(quote.client_phone)}</span></div>
      ${quote.client_notes ? `<div style="margin-top:8px;"><strong style="color:#e8dccb;">הערות הלקוח:</strong> ${esc(quote.client_notes)}</div>` : ""}
    </td></tr>
    ${clarif ? `<tr><td style="padding:0 28px;">${clarif}</td></tr>` : ""}
    <tr><td style="padding:8px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:right;padding:10px 16px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a39888;font-weight:600;">מוצר</th>
          <th style="text-align:left;padding:10px 16px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a39888;font-weight:600;">כמות</th>
        </tr></thead>
        <tbody>${itemRowsHtml}</tbody>
        <tfoot><tr>
          <td style="padding:14px 16px;border-top:2px solid #2a221d;color:#a39888;font-size:13px;">סה"כ פריטים: ${items.length}</td>
          <td style="padding:14px 16px;border-top:2px solid #2a221d;color:#d4af6a;font-size:16px;text-align:left;font-weight:600;">${totalQty.toLocaleString("he-IL")}</td>
        </tr>${suggestedBlock}</tfoot>
      </table>
    </td></tr>
    <tr><td style="padding:24px 28px 28px;text-align:center;">
      <a href="${approveUrl}" style="display:inline-block;background:#d4af6a;color:#1a130e;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:3px;margin:0 6px 8px;font-size:14px;">אישור הצעה</a>
      <a href="${rejectUrl}" style="display:inline-block;background:transparent;color:#e8dccb;font-weight:500;text-decoration:none;padding:14px 28px;border-radius:3px;margin:0 6px 8px;border:1px solid #4a3a2e;font-size:14px;">דחייה</a>
      <a href="${panelUrl}" style="display:inline-block;background:transparent;color:#d4af6a;font-weight:500;text-decoration:none;padding:14px 28px;border-radius:3px;margin:0 6px 8px;border:1px solid #d4af6a;font-size:14px;">פתיחה בפאנל</a>
      <div style="color:#a39888;font-size:12px;margin-top:14px;">הקישורים תקפים לזמן מוגבל. תמחור נקבע בפאנל לפני שליחה ללקוח.</div>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `הצעת מחיר חדשה ${quote.public_id}`,
    `${quote.client_company} · ${quote.client_name}`,
    `אימייל: ${quote.client_email}`,
    `טלפון: ${quote.client_phone}`,
    quote.client_notes ? `הערות: ${quote.client_notes}` : "",
    "",
    ...items.map((it) => {
      const price = suggestLineTotal(it.productId, it.quantity);
      const priceLine = price
        ? `\n  תמחור: ${ils(price.unitPrice)}/יח׳ · ${ils(price.total)}`
        : "";
      return `• ${it.productId} ${it.productTitleHe} — ${it.quantity.toLocaleString("he-IL")} יח'${
        specBullets(it) ? `\n  ${specBullets(it)}` : ""
      }${priceLine}`;
    }),
    "",
    `סה"כ ${items.length} פריטים, ${totalQty.toLocaleString("he-IL")} יח'`,
    suggestedTotal > 0
      ? `הצעת תמחור${suggestedComplete ? "" : " (חלקי)"}: ${ils(suggestedTotal)}`
      : "",
    opts.needsClarification
      ? "⚠ פרטי גימור/מידות חסרים באחד או יותר מהפריטים."
      : "",
    "",
    `אישור: ${approveUrl}`,
    `דחייה: ${rejectUrl}`,
    `פתיחה בפאנל: ${panelUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function ownerSlackPayload(
  quote: QuoteRow,
  items: CartItem[],
  opts: { needsClarification: boolean }
) {
  const approveUrl = buildApproveUrl(quote);
  const rejectUrl = buildRejectUrl(quote);
  const panelUrl = buildPanelUrl(quote);
  const totalQty = items.reduce((a, b) => a + b.quantity, 0);

  const itemLines = items
    .map((it) => {
      const specs = specBullets(it);
      return `• *${it.productTitleHe}* (${it.productId}) — ${it.quantity.toLocaleString("he-IL")}${specs ? `\n   _${specs}_` : ""}`;
    })
    .join("\n");

  return {
    text: `הצעת מחיר חדשה ${quote.public_id} – ${quote.client_company}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Quote ${quote.public_id}` },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Company:*\n${quote.client_company}` },
          { type: "mrkdwn", text: `*Contact:*\n${quote.client_name}` },
          { type: "mrkdwn", text: `*Email:*\n${quote.client_email}` },
          { type: "mrkdwn", text: `*Phone:*\n${quote.client_phone}` },
        ],
      },
      ...(opts.needsClarification
        ? [
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "⚠ One or more items submitted without dimensions/finish/notes.",
                },
              ],
            },
          ]
        : []),
      { type: "divider" },
      { type: "section", text: { type: "mrkdwn", text: itemLines } },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${items.length} items · ${totalQty.toLocaleString("he-IL")} total units`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            style: "primary",
            text: { type: "plain_text", text: "Approve" },
            url: approveUrl,
          },
          {
            type: "button",
            style: "danger",
            text: { type: "plain_text", text: "Reject" },
            url: rejectUrl,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Open in panel" },
            url: panelUrl,
          },
        ],
      },
    ],
  };
}
