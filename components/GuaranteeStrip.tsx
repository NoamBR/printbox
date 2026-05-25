import { CheckCircle2 } from "lucide-react";

const badges = [
  { title: "אחריות החזר 100%", body: "אם לא תאהבו את התוצאה" },
  { title: "דוגמה דיגיטלית", body: "ללא עלות ולפני ההפקה" },
  { title: "מחירי יצרן", body: "ישירות לעסק שלכם" },
];

export default function GuaranteeStrip() {
  return (
    <div className="bg-brand-surfaceHi border-y border-brand-line">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
          {badges.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-3 justify-start sm:justify-center text-right"
            >
              <CheckCircle2
                className="size-7 text-brand-gold shrink-0 mt-0.5"
                strokeWidth={1.6}
              />
              <div>
                <h3 className="font-serif text-lg lg:text-xl text-brand-bone leading-tight">
                  {b.title}
                </h3>
                <p className="text-sm text-brand-boneDim mt-1">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
