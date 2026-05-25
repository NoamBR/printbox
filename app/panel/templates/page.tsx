import { getDb } from "@/lib/db";
import { TemplatePreview } from "@/components/panel/TemplatePreview";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  const db = getDb();
  const prospects = db
    .prepare(
      "SELECT id, company_name, email FROM prospects ORDER BY id DESC LIMIT 100"
    )
    .all() as { id: number; company_name: string; email: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-bone">תבניות</h1>
        <p className="text-brand-boneDim text-sm mt-1">
          תצוגה מקדימה של 3 הטאצ'ים, ממולאים עם נתוני ליד נבחר
        </p>
      </div>
      <TemplatePreview prospects={prospects} />
    </div>
  );
}
