import { getDb } from "@/lib/db";
import { StatCard } from "@/components/panel/StatCard";
import { ActivityFeed } from "@/components/panel/ActivityFeed";
import { RunTickButton } from "@/components/panel/RunTickButton";
import { SyncInboxButton } from "@/components/panel/SyncInboxButton";
import { Users, Send, MailCheck, Ban, Inbox, Bot } from "lucide-react";
import { currentSendMode } from "@/lib/sender";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const db = getDb();
  const mode = currentSendMode();
  const total = (db.prepare("SELECT COUNT(*) as c FROM prospects").get() as { c: number }).c;
  const inSeq = (db.prepare("SELECT COUNT(*) as c FROM prospects WHERE status = 'in_sequence'").get() as { c: number }).c;
  const replied = (db.prepare("SELECT COUNT(*) as c FROM prospects WHERE replied_at IS NOT NULL").get() as { c: number }).c;
  const optedOut = (db.prepare("SELECT COUNT(*) as c FROM prospects WHERE opted_out = 1").get() as { c: number }).c;
  const sent24h = (db
    .prepare(
      "SELECT COUNT(*) as c FROM events WHERE type IN ('sent', 'sent_dryrun') AND created_at >= datetime('now', '-1 day')"
    )
    .get() as { c: number }).c;
  const inboundUnreviewed = (db
    .prepare(
      "SELECT COUNT(*) as c FROM messages WHERE direction = 'in' AND held_for_review = 1"
    )
    .get() as { c: number }).c;
  const autoReplied24h = (db
    .prepare(
      "SELECT COUNT(*) as c FROM messages WHERE direction = 'out' AND auto_replied = 1 AND created_at >= datetime('now', '-1 day')"
    )
    .get() as { c: number }).c;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-brand-bone">לוח בקרה</h1>
          <p className="text-brand-boneDim text-sm mt-1">
            סקירת מצב רצפי ה-Outbound של פרינטבוקס ·{" "}
            <span
              className={
                mode === "smtp"
                  ? "text-emerald-300"
                  : "text-brand-goldHi"
              }
            >
              מצב שליחה: {mode === "smtp" ? "Live (Gmail)" : "Dry-run"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SyncInboxButton />
          <RunTickButton />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="סך לידים" value={total} icon={Users} />
        <StatCard
          label="ברצף פעיל"
          value={inSeq}
          icon={Send}
          accent="gold"
          hint={`${sent24h} נשלחו ב-24ש"`}
        />
        <StatCard label="השיבו" value={replied} icon={MailCheck} accent="gold" />
        <StatCard label="ביטולים" value={optedOut} icon={Ban} />
        <StatCard
          label="מענה אוטו' 24ש'"
          value={autoReplied24h}
          icon={Bot}
          accent="gold"
        />
        <StatCard
          label="ממתינים לסקירה"
          value={inboundUnreviewed}
          icon={Inbox}
          hint={inboundUnreviewed > 0 ? "→ פתח את תיבת נכנס" : undefined}
        />
      </div>

      <div>
        <h2 className="font-serif text-xl text-brand-bone mb-3">פעילות אחרונה</h2>
        <ActivityFeed limit={25} />
      </div>
    </div>
  );
}
