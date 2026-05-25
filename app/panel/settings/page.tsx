import { loadSequence } from "@/lib/sequencer";
import { currentSendMode } from "@/lib/sender";
import { getSetting } from "@/lib/db";
import { SendModeToggle } from "@/components/panel/SendModeToggle";
import { AutoReplyToggle } from "@/components/panel/AutoReplyToggle";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const cfg = loadSequence();
  const sendMode = currentSendMode();
  const autoReply =
    (getSetting("auto_reply_enabled") ??
      process.env.AUTO_REPLY_ENABLED ??
      "true").toLowerCase() === "true";
  const mailUser = process.env.MAIL_USER ?? process.env.GMAIL_USER ?? null;
  const mailPass =
    process.env.MAIL_PASSWORD ?? process.env.GMAIL_APP_PASSWORD ?? null;
  const mailConfigured = !!(mailUser && mailPass);
  const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const imapHost = process.env.IMAP_HOST ?? "imap.gmail.com";
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl text-brand-bone">הגדרות</h1>
        <p className="text-brand-boneDim text-sm mt-1">
          מצב שליחה, מענה אוטומטי וחיבורי שירות
        </p>
      </div>

      <section className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-brand-goldHi font-medium">חיבורי שירות</h2>
        </div>
        <StatusRow
          label="תיבת מייל (SMTP + IMAP)"
          ok={mailConfigured}
          okText={`${mailUser} · SMTP: ${smtpHost} · IMAP: ${imapHost}`}
          missingText="הוסף MAIL_USER + MAIL_PASSWORD + SMTP_HOST + IMAP_HOST ל-.env.local"
        />
        <StatusRow
          label="Google Gemini (סיווג + טיוטה)"
          ok={geminiConfigured}
          okText={`API key מוגדר · מודל: ${geminiModel}`}
          missingText="הוסף GEMINI_API_KEY ל-.env.local"
        />
      </section>

      <section className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-4">
        <div>
          <h2 className="text-brand-goldHi font-medium">מצב שליחה</h2>
          <p className="text-brand-boneDim text-xs mt-1">
            <strong className="text-brand-bone">Dry-run</strong>: כותב קבצי .eml תחת{" "}
            <code className="text-brand-goldHi">data/sent/</code> ולא שולח לאף אחד. ·{" "}
            <strong className="text-brand-bone">Live</strong>: שולח באמת דרך {smtpHost}.
          </p>
        </div>
        <SendModeToggle initial={sendMode} gmailConfigured={mailConfigured} />
      </section>

      <section className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-3">
        <div>
          <h2 className="text-brand-goldHi font-medium">מענה אוטומטי</h2>
          <p className="text-brand-boneDim text-xs mt-1">
            כאשר מגיעה תגובה מזוהה (interested / question / objection), הסוכן יכתוב טיוטת
            תשובה בעברית וישלח אותה אוטומטית. opt-out / חופשה / ספאם — לעולם לא יקבלו מענה.
          </p>
        </div>
        <AutoReplyToggle initial={autoReply} />
        <div className="text-xs text-brand-boneDim border-t border-brand-line pt-3 space-y-1">
          <div>· סף ביטחון לשליחה אוטומטית: 0.75</div>
          <div>· מקסימום מענה אוטומטי אחד לליד ב-24 שעות</div>
          <div>· זיהוי opt-out בעברית ובאנגלית (regex לפני LLM)</div>
          <div>· זיהוי autoresponder לפי Auto-Submitted / Precedence</div>
        </div>
      </section>

      <section className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-3">
        <h2 className="text-brand-goldHi font-medium">תצורת רצף</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Sequence ID" value={cfg.sequence_id} />
          <Info
            label="מגבלת נושא"
            value={`${cfg.validation.block_send_if_subject_over_chars} תווים`}
          />
        </div>
        <div className="text-xs text-brand-boneDim border-t border-brand-line pt-3">
          {cfg.steps.length} צעדים · עריכה ידנית ב-{" "}
          <code>outreach/sequence.json</code> ו-<code>outreach/templates/</code>.
        </div>
      </section>

      <section className="bg-brand-surface border border-brand-line rounded-lg p-5 space-y-3">
        <h2 className="text-brand-goldHi font-medium">אוטומציה</h2>
        <div className="text-sm text-brand-bone space-y-2">
          <div>
            הסבב לא רץ ברקע. לחץ "הרץ סבב שליחה" ו"סנכרן תיבה" מלוח הבקרה, או הגדר
            Windows Task Scheduler להריץ:
          </div>
          <div className="bg-brand-noir/50 p-2 rounded">
            <code className="text-brand-goldHi text-xs">
              POST http://localhost:3000/api/panel/sequence/tick
            </code>
            <br />
            <code className="text-brand-goldHi text-xs">
              POST http://localhost:3000/api/panel/inbox/poll
            </code>
          </div>
          <div className="text-brand-boneDim text-xs">
            המלצה: tick כל שעה בשעות עבודה, poll כל 5-10 דקות.
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-brand-boneDim text-[11px] uppercase tracking-wider">
        {label}
      </div>
      <div className="text-brand-bone mt-0.5">{value}</div>
    </div>
  );
}

function StatusRow({
  label,
  ok,
  okText,
  missingText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  missingText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-brand-bone">{label}</div>
      <div className="flex items-center gap-2">
        {ok ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-xs">{okText}</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-xs">{missingText}</span>
          </>
        )}
      </div>
    </div>
  );
}
