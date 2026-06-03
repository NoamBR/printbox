import type { QuoteRow } from "../db";
import type { CartItem } from "../quote-schema";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function priceIls(amountIls: number | null): string {
  if (amountIls == null) return "—";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountIls);
}

function specsLine(it: CartItem): string {
  const parts: string[] = [];
  if (it.specs.dimensions) parts.push(`מידות: ${it.specs.dimensions}`);
  if (it.specs.sides) parts.push(`צדדים: ${it.specs.sides}`);
  if (it.specs.finish) parts.push(`גימור: ${it.specs.finish}`);
  if (it.specs.color) parts.push(`צבע: ${it.specs.color}`);
  if (it.specs.notes) parts.push(`הערות: ${it.specs.notes}`);
  return parts.join(" · ");
}

export function clientQuotationEmail(
  quote: QuoteRow,
  items: CartItem[]
): { subject: string; html: string; text: string } {
  const subject = `הצעת מחיר ${quote.public_id} — PrintBox`;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  const validUntilStr = validUntil.toLocaleDateString("he-IL");

  const rowsHtml = items
    .map((it) => {
      const specs = specsLine(it);
      return `
      <tr>
        <td style="padding:16px 14px;border-top:1px solid #e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:15px;color:#1a130e;">
          <div style="font-weight:600;">${esc(it.productTitleHe)}</div>
          <div style="color:#7a6a55;font-size:12px;margin-top:2px;">${esc(it.productId)}</div>
          ${specs ? `<div style="color:#5a4a3a;font-size:13px;margin-top:6px;">${esc(specs)}</div>` : ""}
        </td>
        <td style="padding:16px 14px;border-top:1px solid #e8dccb;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:16px;color:#1a130e;text-align:left;white-space:nowrap;">
          ${it.quantity.toLocaleString("he-IL")}
        </td>
      </tr>`;
    })
    .join("");

  const priceBlock = `
    <div style="margin:24px 0 16px;padding:20px 22px;background:#f9f3e7;border:1px solid #d4af6a;border-radius:4px;text-align:right;">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a7355;margin-bottom:6px;">סה"כ הצעה</div>
      <div style="font-size:30px;font-weight:600;color:#1a130e;font-family:'Frank Ruhl Libre',Georgia,serif;">${esc(priceIls(quote.final_price_ils))}</div>
      ${quote.final_price_notes ? `<div style="margin-top:10px;font-size:13px;color:#5a4a3a;line-height:1.6;">${esc(quote.final_price_notes)}</div>` : ""}
      <div style="margin-top:12px;font-size:11px;color:#7a6a55;">ההצעה בתוקף עד ${esc(validUntilStr)}</div>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f5ecdc;font-family:'Frank Ruhl Libre',Georgia,serif;color:#1a130e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e8dccb;border-radius:6px;">
    <tr><td style="padding:32px 28px 16px;text-align:right;border-bottom:1px solid #e8dccb;">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af6a;margin-bottom:6px;">PrintBox · פרינטבוקס</div>
      <h1 style="margin:0;font-size:30px;font-weight:500;color:#1a130e;">הצעת המחיר שלכם</h1>
      <div style="font-size:13px;color:#7a6a55;margin-top:6px;">${esc(quote.public_id)}</div>
    </td></tr>
    <tr><td style="padding:24px 28px 8px;text-align:right;font-size:15px;line-height:1.8;color:#1a130e;">
      <p style="margin:0 0 12px;">שלום ${esc(quote.client_name)},</p>
      <p style="margin:0 0 12px;">תודה על פנייתכם ל-PrintBox. להלן הצעת המחיר המפורטת עבור ${esc(quote.client_company)}, מותאמת לבקשתכם.</p>
    </td></tr>
    <tr><td style="padding:8px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:right;padding:10px 14px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6a55;font-weight:600;">מוצר</th>
          <th style="text-align:left;padding:10px 14px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6a55;font-weight:600;">כמות</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </td></tr>
    <tr><td style="padding:0 28px;">${priceBlock}</td></tr>
    <tr><td style="padding:8px 28px 24px;text-align:right;font-size:14px;line-height:1.7;color:#5a4a3a;">
      <p style="margin:0 0 10px;">לאישור ההצעה או להתאמות, פשוט השיבו למייל זה ונחזור אליכם.</p>
      <p style="margin:0;color:#7a6a55;font-size:13px;">תודה,<br>צוות PrintBox</p>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f9f3e7;border-top:1px solid #e8dccb;text-align:center;font-size:11px;color:#7a6a55;letter-spacing:0.1em;">
      print-box.store · marketing@print-box.store
    </td></tr>
  </table>
</body></html>`;

  const totalQty = items.reduce((a, b) => a + b.quantity, 0);
  const text = [
    `הצעת מחיר ${quote.public_id} — PrintBox`,
    ``,
    `שלום ${quote.client_name},`,
    `תודה על פנייתכם. להלן הצעת המחיר עבור ${quote.client_company}:`,
    ``,
    ...items.map(
      (it) =>
        `• ${it.productTitleHe} (${it.productId}) — ${it.quantity.toLocaleString("he-IL")} יח'${
          specsLine(it) ? `\n  ${specsLine(it)}` : ""
        }`
    ),
    ``,
    `סה"כ ${items.length} פריטים · ${totalQty.toLocaleString("he-IL")} יח'`,
    `סה"כ הצעה: ${priceIls(quote.final_price_ils)}`,
    quote.final_price_notes ? `הערות: ${quote.final_price_notes}` : "",
    `בתוקף עד: ${validUntilStr}`,
    ``,
    `לאישור או התאמות, השיבו למייל זה.`,
    `תודה, צוות PrintBox`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
