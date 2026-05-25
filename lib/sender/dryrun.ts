import fs from "node:fs";
import path from "node:path";

const SENT_DIR = path.join(process.cwd(), "data", "sent");

export type SendInput = {
  to: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
  prospect_id: number;
  step: number;
};

export type SendResult = {
  ok: true;
  mode: "dryrun";
  file: string;
};

export async function dryrunSend(input: SendInput): Promise<SendResult> {
  if (!fs.existsSync(SENT_DIR)) fs.mkdirSync(SENT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${input.prospect_id}_step${input.step}_${ts}.eml`;
  const file = path.join(SENT_DIR, filename);
  const from =
    input.fromName && input.fromEmail
      ? `${input.fromName} <${input.fromEmail}>`
      : "PrintBox <noreply@printbox.local>";
  const eml = [
    `From: ${from}`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Language: he`,
    `X-PrintBox-Mode: dryrun`,
    `X-PrintBox-Prospect: ${input.prospect_id}`,
    `X-PrintBox-Step: ${input.step}`,
    `Date: ${new Date().toUTCString()}`,
    ``,
    input.body,
  ].join("\r\n");
  fs.writeFileSync(file, eml, "utf8");
  return { ok: true, mode: "dryrun", file: path.relative(process.cwd(), file) };
}
