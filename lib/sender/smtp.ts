import nodemailer, { Transporter } from "nodemailer";
import { SendInput } from "./dryrun";

let _transporter: Transporter | null = null;

export type MailCreds = {
  user: string;
  pass: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
};

export function getMailCreds(): MailCreds {
  const user =
    process.env.MAIL_USER ?? process.env.GMAIL_USER ?? "";
  const passRaw =
    process.env.MAIL_PASSWORD ?? process.env.GMAIL_APP_PASSWORD ?? "";
  if (!user || !passRaw) {
    throw new Error("MAIL_USER ו-MAIL_PASSWORD חייבים להיות מוגדרים ב-.env.local");
  }
  const pass = passRaw.replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT ?? "465", 10);
  const smtpSecure = (process.env.SMTP_SECURE ?? (smtpPort === 465 ? "true" : "false")) === "true";
  return { user, pass, smtpHost, smtpPort, smtpSecure };
}

function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  const c = getMailCreds();
  _transporter = nodemailer.createTransport({
    host: c.smtpHost,
    port: c.smtpPort,
    secure: c.smtpSecure,
    auth: { user: c.user, pass: c.pass },
    pool: true,
    maxConnections: 2,
  });
  return _transporter;
}

export type SmtpAttachment = {
  filename: string;
  path: string;
};

export type SmtpSendInput = SendInput & {
  inReplyTo?: string;
  references?: string[];
  headers?: Record<string, string>;
  attachments?: SmtpAttachment[];
};

export type SmtpSendResult = {
  ok: true;
  mode: "smtp";
  file: string;
  messageId: string;
  accepted: string[];
  rejected: string[];
};

export async function smtpSend(input: SmtpSendInput): Promise<SmtpSendResult> {
  const transporter = getTransporter();
  const creds = getMailCreds();
  const fromName = input.fromName ?? process.env.SENDER_NAME ?? "PrintBox";
  const fromEmail =
    input.fromEmail ?? process.env.SENDER_EMAIL ?? creds.user;
  const replyTo = process.env.REPLY_TO || undefined;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: input.to,
    replyTo,
    subject: input.subject,
    text: input.body,
    inReplyTo: input.inReplyTo,
    references: input.references,
    attachments: input.attachments,
    headers: {
      "X-PrintBox-Mode": "smtp",
      "X-PrintBox-Prospect": String(input.prospect_id),
      "X-PrintBox-Step": String(input.step),
      ...(input.headers ?? {}),
    },
  });

  return {
    ok: true,
    mode: "smtp",
    file: "",
    messageId: info.messageId,
    accepted: (info.accepted ?? []) as string[],
    rejected: (info.rejected ?? []) as string[],
  };
}
