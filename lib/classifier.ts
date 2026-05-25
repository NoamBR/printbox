import { GoogleGenAI, Type } from "@google/genai";

export type Intent =
  | "opt_out"
  | "interested"
  | "objection"
  | "question"
  | "out_of_office"
  | "not_now"
  | "wrong_person"
  | "spam";

export type Classification = {
  intent: Intent;
  confidence: number;
  reason: string;
  source: "regex" | "llm";
};

const OPT_OUT_PATTERNS: RegExp[] = [
  /הסר[ו]?\s+אות[יו]/i,
  /אנא\s+הסיר/i,
  /להסיר\s+מהרשימה/i,
  /להוריד\s+מהרשימה/i,
  /להפסיק\s+(?:לקבל|מיילים|לשלוח)/i,
  /(?:^|\s)הפסיק[וי]?(?:\s|$)/i,
  /לא\s+מעוניין/i,
  /\bunsubscribe\b/i,
  /\bopt[-\s]?out\b/i,
  /\bremove\s+me\b/i,
  /\bstop\s+(?:sending|emailing|contacting)\b/i,
  /\btake\s+me\s+off\b/i,
];

const OOO_PATTERNS: RegExp[] = [
  /out\s+of\s+office/i,
  /vacation\s+(?:reply|response)/i,
  /automatic\s+reply/i,
  /אני\s+(?:בחופשה|בחופש|במילואים|לא\s+זמין)/i,
  /הודעה\s+אוטומטית/i,
  /חוזר\s+ל[א-ת]+\s+ב-?\d/i,
];

const WRONG_PERSON_PATTERNS: RegExp[] = [
  /לא\s+הכתובת\s+הנכונה/i,
  /אני\s+כבר\s+לא\s+(?:עובד|אצל)/i,
  /\bno\s+longer\s+(?:with|at)\b/i,
  /\bwrong\s+(?:person|address|contact)\b/i,
];

export function regexClassify(text: string): Classification | null {
  const normalized = text.normalize("NFKC");
  if (OPT_OUT_PATTERNS.some((r) => r.test(normalized))) {
    return {
      intent: "opt_out",
      confidence: 0.98,
      reason: "keyword match: opt-out phrase",
      source: "regex",
    };
  }
  if (OOO_PATTERNS.some((r) => r.test(normalized))) {
    return {
      intent: "out_of_office",
      confidence: 0.9,
      reason: "keyword match: auto-responder",
      source: "regex",
    };
  }
  if (WRONG_PERSON_PATTERNS.some((r) => r.test(normalized))) {
    return {
      intent: "wrong_person",
      confidence: 0.9,
      reason: "keyword match: wrong contact",
      source: "regex",
    };
  }
  return null;
}

const SYSTEM_PROMPT = `אתה מסווג כוונות עבור פרינטבוקס — חברת אריזות פרימיום ממותגות לעסקים (בתי קפה, פוד טראקים, מאפיות, מטבחים מסחריים) בישראל.

הקלט: תגובה נכנסת לאימייל יוצא של PrintBox (אימייל מכירה).
הפלט: JSON אחד בלבד עם השדות intent, confidence, reason.

הגדרות:
- opt_out: מבקש מפורשות להפסיק / להסיר אותו / "לא מעוניין"
- interested: מבטא עניין, רוצה פרטים נוספים, מבקש קטלוג / מחיר / שיחה
- objection: מעלה התנגדות ספציפית (מחיר, MOQ, עיתוי) אבל לא סוגר את הדלת
- question: שואל שאלה ספציפית על מוצר/תהליך/חומרים
- out_of_office: מענה אוטומטי על חופשה / מילואים / יציאה
- not_now: לא הזמן הנכון, אולי בעתיד
- wrong_person: לא הכתובת הנכונה / כבר לא בתפקיד / הפנייה לאחר
- spam: לא רלוונטי, פרסומת, ספאם

confidence: מספר 0-1
reason: עד 15 מילים בעברית.`;

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (_client) return _client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY חסר ב-.env.local");
  _client = new GoogleGenAI({ apiKey: key });
  return _client;
}

const CLASSIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: [
        "opt_out",
        "interested",
        "objection",
        "question",
        "out_of_office",
        "not_now",
        "wrong_person",
        "spam",
      ],
    },
    confidence: { type: Type.NUMBER },
    reason: { type: Type.STRING },
  },
  required: ["intent", "confidence", "reason"],
  propertyOrdering: ["intent", "confidence", "reason"],
};

export async function llmClassify(
  inboundText: string,
  subject: string | null
): Promise<Classification> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const userBlock =
    `נושא: ${subject ?? "(ללא)"}\n\n` +
    `גוף ההודעה:\n${inboundText.slice(0, 4000)}`;
  const res = await client().models.generateContent({
    model,
    contents: userBlock,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: CLASSIFICATION_SCHEMA,
      maxOutputTokens: 256,
    },
  });
  const text = (res.text ?? "").trim();
  const parsed = safeParseJson(text);
  const intent = (parsed.intent as Intent) ?? "question";
  const confidence =
    typeof parsed.confidence === "number" ? parsed.confidence : 0.5;
  const reason = typeof parsed.reason === "string" ? parsed.reason : "—";
  return { intent, confidence, reason, source: "llm" };
}

export async function classifyInbound(
  inboundText: string,
  subject: string | null,
  headersExtra?: { autoSubmitted?: boolean; precedenceBulk?: boolean }
): Promise<Classification> {
  if (headersExtra?.autoSubmitted || headersExtra?.precedenceBulk) {
    return {
      intent: "out_of_office",
      confidence: 0.95,
      reason: "Auto-Submitted / bulk header",
      source: "regex",
    };
  }
  const regex = regexClassify(inboundText);
  if (regex) return regex;
  return llmClassify(inboundText, subject);
}

function safeParseJson(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
    return {};
  }
}
