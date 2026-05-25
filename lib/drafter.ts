import { GoogleGenAI } from "@google/genai";
import { ProspectRow, MessageRow } from "./db";
import { Intent } from "./classifier";

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (_client) return _client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY חסר ב-.env.local");
  _client = new GoogleGenAI({ apiKey: key });
  return _client;
}

const BRAND_SYSTEM = `אתה כותב תגובות עבור PrintBox — חברת אריזות פרימיום ממותגות לעסקים בישראל.
שם המותג נכתב תמיד באנגלית: PrintBox (לא "פרינטבוקס").
קהל יעד: בעלי בתי קפה, פוד טראקים, מאפיות, מטבחים מסחריים.

מוצרים: כוסות ממותגות, מנשאים, מארזי קרטון, שקיות הגשה, מפיות מודפסות, כרטיסי ביקור.
אסתטיקה: מאט שחור, זהב מלוטש, חומרים עמידים.
הבטחת מותג: מהסקיצה לדלת תוך 14 ימי עסקים.

טון: פרימיום, סמכותי, תפעולי — מדבר את שפת בעלי העסק (MOQ, מחזור חודשי, חוויית לקוח, חשיפה רחובית).
לא ארוך: 2-4 משפטים קצרים. בלי מילוי. בלי סופרלטיבים זולים.
תמיד בעברית, RTL, ללא אימוג'ים.
תמיד יש CTA ברור (שאלה אחת, פעולה אחת).

אל תמציא נתונים: מחירים, תאריכים, MOQ ספציפיים. אם אתה לא יודע משהו — אמור שתחזור עם פרטים מדויקים.

אסור:
- אל תפתח ב"שלום, אני סוכן AI"
- אל תבטיח מועדי משלוח שלא אושרו
- אל תזרוק bullet points ארוכים
- אל תשלח אנגלית למקבל ישראלי

חתימה חובה בסוף ההודעה (בדיוק כך):
בברכה,
צוות PrintBox — מיתוג אריזות חכם לעסקים

הפלט: רק גוף ההודעה (טקסט נקי לשליחה). בלי נושא, בלי JSON, בלי הסברים, בלי code fences.`;

export type DraftInput = {
  prospect: ProspectRow;
  inboundSubject: string | null;
  inboundText: string;
  priorMessages: Pick<MessageRow, "direction" | "subject" | "body" | "created_at">[];
  intent: Intent;
  intentReason: string;
};

export type DraftResult = {
  body: string;
  model: string;
  usage?: { input_tokens: number; output_tokens: number };
};

export async function draftReply(input: DraftInput): Promise<DraftResult> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const history = input.priorMessages
    .slice(-6)
    .map(
      (m) =>
        `[${m.direction === "out" ? "PrintBox →" : "← ליד"}] ${
          m.subject ?? "(ללא נושא)"
        }\n${(m.body ?? "").slice(0, 1200)}`
    )
    .join("\n\n---\n\n");

  const userMessage =
    `פרטי ליד:\n` +
    `- חברה: ${input.prospect.company_name}\n` +
    `- תעשייה: ${input.prospect.industry_he}\n` +
    `- איש קשר: ${input.prospect.first_name} ${input.prospect.last_name ?? ""}\n` +
    `- עיר: ${input.prospect.city}\n\n` +
    `סיווג התגובה: ${input.intent} — ${input.intentReason}\n\n` +
    `שרשור עד עכשיו (הישן בראש):\n${history || "(אין)"}\n\n` +
    `התגובה החדשה שהתקבלה:\n` +
    `נושא: ${input.inboundSubject ?? "(ללא)"}\n` +
    `גוף:\n${input.inboundText.slice(0, 3000)}\n\n` +
    `כתוב תגובה כעת.`;

  const res = await client().models.generateContent({
    model,
    contents: userMessage,
    config: {
      systemInstruction: BRAND_SYSTEM,
      maxOutputTokens: 600,
      temperature: 0.6,
    },
  });

  const body = (res.text ?? "").trim();
  const usage = res.usageMetadata
    ? {
        input_tokens: res.usageMetadata.promptTokenCount ?? 0,
        output_tokens: res.usageMetadata.candidatesTokenCount ?? 0,
      }
    : undefined;

  return { body, model, usage };
}
