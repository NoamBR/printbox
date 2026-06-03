import type { QuoteRow } from "../db";
import type { CartItem } from "../quote-schema";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

export function clientConfirmationEmail(
  quote: QuoteRow,
  items: CartItem[]
): { subject: string; html: string; text: string } {
  const subject = `קיבלנו את בקשתכם · ${quote.public_id}`;
  const greet = firstName(quote.client_name);

  const rowsHtml = items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 14px;border-top:1px solid #e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:14px;color:#1a130e;text-align:right;">
          ${esc(it.productTitleHe)}
          <div style="font-size:11px;color:#7a6a55;margin-top:2px;">${esc(it.productId)}</div>
        </td>
        <td style="padding:12px 14px;border-top:1px solid #e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:15px;color:#1a130e;text-align:left;white-space:nowrap;tabular-nums:1;">
          ${it.quantity.toLocaleString("he-IL")}
        </td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f5ecdc;font-family:'Frank Ruhl Libre',Georgia,serif;color:#1a130e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8dccb;border-radius:6px;">
    <tr><td style="padding:28px 28px 8px;text-align:right;">
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#1a130e;">
        ${greet ? `שלום ${esc(greet)},` : "שלום,"}
      </p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#1a130e;">
        קיבלנו את בקשתכם. נחזור אליכם בקרוב עם הצעת מחיר מפורטת.
      </p>
    </td></tr>
    <tr><td style="padding:8px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:right;padding:8px 14px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6a55;font-weight:600;">פריט</th>
          <th style="text-align:left;padding:8px 14px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6a55;font-weight:600;">כמות</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </td></tr>
    <tr><td style="padding:18px 28px 8px;text-align:right;font-size:12px;color:#7a6a55;">
      מזהה הבקשה: <span style="font-family:Menlo,Consolas,monospace;color:#1a130e;">${esc(quote.public_id)}</span>
    </td></tr>
    <tr><td style="padding:24px 28px;text-align:right;font-size:13px;line-height:1.7;color:#5a4a3a;">
      צוות PrintBox
      <div style="font-size:12px;color:#7a6a55;margin-top:6px;">
        <a href="mailto:marketing@print-box.store" style="color:#5a4a3a;text-decoration:none;">marketing@print-box.store</a>
        &nbsp;·&nbsp;
        <a href="tel:+972-53-306-2022" style="color:#5a4a3a;text-decoration:none;direction:ltr;display:inline-block;">053-306-2022</a>
      </div>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    greet ? `שלום ${greet},` : "שלום,",
    "קיבלנו את בקשתכם. נחזור אליכם בקרוב עם הצעת מחיר מפורטת.",
    "",
    ...items.map(
      (it) =>
        `• ${it.productTitleHe} (${it.productId}) — ${it.quantity.toLocaleString("he-IL")} יח'`
    ),
    "",
    `מזהה הבקשה: ${quote.public_id}`,
    "",
    "צוות PrintBox",
    "marketing@print-box.store · 053-306-2022",
  ].join("\n");

  return { subject, html, text };
}
