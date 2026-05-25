import { dryrunSend, SendInput, SendResult } from "./dryrun";
import { smtpSend, SmtpSendInput, SmtpSendResult } from "./smtp";
import { getSetting } from "../db";

export type { SendInput, SendResult, SmtpSendInput, SmtpSendResult };

export type AnySendInput = SmtpSendInput;
export type AnySendResult = (SendResult | SmtpSendResult) & {
  messageId?: string;
};

export function currentSendMode(): "dryrun" | "smtp" {
  const fromDb = getSetting("send_mode");
  if (fromDb === "smtp" || fromDb === "dryrun") return fromDb;
  const env = (process.env.SEND_MODE ?? "dryrun").toLowerCase();
  return env === "live" || env === "smtp" ? "smtp" : "dryrun";
}

export async function sendEmail(input: AnySendInput): Promise<AnySendResult> {
  const mode = currentSendMode();
  if (mode === "smtp") {
    return smtpSend(input);
  }
  return dryrunSend(input);
}
