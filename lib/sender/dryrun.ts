import fs from "node:fs";
import path from "node:path";

const SENT_DIR = path.join(process.cwd(), "data", "sent");

export type SendInput = {
  to: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
  html?: string;
  prospect_id?: number;
  step?: number;
  /** Optional filename prefix used in dryrun mode for human discoverability. */
  dryrunLabel?: string;
};

export type SendResult = {
  ok: true;
  mode: "dryrun";
  file: string;
};

export async function dryrunSend(input: SendInput): Promise<SendResult> {
  if (!fs.existsSync(SENT_DIR)) fs.mkdirSync(SENT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const prospectId = input.prospect_id ?? 0;
  const step = input.step ?? 0;
  const label = input.dryrunLabel ? `${input.dryrunLabel}_` : "";
  const filename = `${label}${prospectId}_step${step}_${ts}.eml`;
  const file = path.join(SENT_DIR, filename);
  const from =
    input.fromName && input.fromEmail
      ? `${input.fromName} <${input.fromEmail}>`
      : "PrintBox <noreply@printbox.local>";
  const headers = [
    `From: ${from}`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    `Content-Language: he`,
    `X-PrintBox-Mode: dryrun`,
    `X-PrintBox-Prospect: ${prospectId}`,
    `X-PrintBox-Step: ${step}`,
    `Date: ${new Date().toUTCString()}`,
  ];
  let eml: string;
  if (input.html) {
    const boundary = `pb_boundary_${Date.now()}`;
    eml =
      [
        ...headers,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        input.body,
        `--${boundary}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        input.html,
        `--${boundary}--`,
        ``,
      ].join("\r\n");
  } else {
    eml = [...headers, `Content-Type: text/plain; charset=utf-8`, ``, input.body].join("\r\n");
  }
  fs.writeFileSync(file, eml, "utf8");
  return { ok: true, mode: "dryrun", file: path.relative(process.cwd(), file) };
}
