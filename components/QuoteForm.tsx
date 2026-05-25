"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quoteSchema,
  productOptions,
  quantityOptions,
  type QuoteInput,
} from "@/lib/quote-schema";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";
import { useState } from "react";

const reasons = [
  { Icon: Sparkles, text: "מענה מותאם מהמעצבים שלנו, לא בוט." },
  { Icon: Clock, text: "הצעת מחיר מותאמת ומפורטת לעסק שלכם." },
  { Icon: ShieldCheck, text: "מחיר יצרן · ללא התחייבות · הצעה כתובה." },
];

const inputClass =
  "w-full min-h-[48px] px-4 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone placeholder:text-brand-boneDim/60 focus:border-brand-gold focus:shadow-[0_0_0_3px_rgb(var(--c-gold)/0.18)] focus:outline-none transition-shadow duration-150";

export default function QuoteForm() {
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: QuoteInput) {
    setSubmitState("idle");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("server");
      setSubmitState("success");
      reset();
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <section
      id="quote"
      className="bg-brand-surfaceHi scroll-mt-24 border-t border-brand-line"
      aria-labelledby="quote-heading"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          {/* Pitch */}
          <div className="lg:col-span-2 text-right">
            <p className="text-[11px] font-medium tracking-[0.3em] text-brand-gold uppercase mb-4">
              <span className="font-display italic me-2">Begin</span>· מתחילים
            </p>
            <h2
              id="quote-heading"
              className="font-serif text-[clamp(28px,4.5vw,64px)] font-medium text-brand-bone leading-[1.05] mb-6"
            >
              קבלו{" "}
              <span className="italic font-display font-light text-brand-gold">
                הצעת מחיר
              </span>{" "}
              מותאמת
            </h2>
            <p className="text-lg text-brand-boneDim leading-relaxed mb-8">
              ‎חוזרים אליכם עם תמחור מפורט, חלופות חומר וייעוץ מקצועי מהמעצבים שלנו.
            </p>
            <ul className="space-y-4">
              {reasons.map((r) => (
                <li key={r.text} className="flex items-start gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-sm bg-brand-gold text-brand-onEspresso flex items-center justify-center">
                    <r.Icon className="size-4" strokeWidth={1.8} />
                  </span>
                  <span className="pt-1.5 text-base text-brand-bone">
                    {r.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <div className="lg:col-span-3">
            <div className="relative rounded-sm bg-brand-surface border border-brand-line shadow-soft p-6 lg:p-10">
              {submitState === "success" ? (
                <div
                  className="text-center py-12"
                  role="status"
                  aria-live="polite"
                >
                  <div className="inline-flex w-16 h-16 rounded-full border border-brand-gold/50 bg-brand-gold/10 text-brand-gold items-center justify-center mb-6">
                    <CheckCircle2 className="size-9" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-serif text-3xl text-brand-bone mb-3">
                    ההצעה שלכם בדרך
                  </h3>
                  <p className="text-brand-boneDim">
                    נחזור אליכם בקרוב עם הצעת מחיר מפורטת ומותאמת.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitState("idle")}
                    className="mt-6 text-brand-gold font-medium hover:underline"
                  >
                    שליחת בקשה נוספת
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
                  noValidate
                >
                  <Field label="שם מלא" error={errors.fullName?.message}>
                    <input
                      type="text"
                      autoComplete="name"
                      className={inputClass}
                      {...register("fullName")}
                    />
                  </Field>

                  <Field label="שם העסק" error={errors.company?.message}>
                    <input
                      type="text"
                      autoComplete="organization"
                      className={inputClass}
                      {...register("company")}
                    />
                  </Field>

                  <Field label="אימייל" error={errors.email?.message}>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      dir="ltr"
                      className={`${inputClass} text-start`}
                      {...register("email")}
                    />
                  </Field>

                  <Field label="טלפון" error={errors.phone?.message}>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      className={`${inputClass} text-start`}
                      placeholder="050-1234567"
                      {...register("phone")}
                    />
                  </Field>

                  <Field label="סוג המוצר" error={errors.product?.message}>
                    <select
                      className={inputClass}
                      defaultValue=""
                      {...register("product")}
                    >
                      <option value="" disabled>
                        בחרו…
                      </option>
                      {productOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="כמות משוערת" error={errors.quantity?.message}>
                    <select
                      className={inputClass}
                      defaultValue=""
                      {...register("quantity")}
                    >
                      <option value="" disabled>
                        בחרו…
                      </option>
                      {quantityOptions.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
                      label="הוסיפו פרטים (אופציונלי)"
                      error={errors.notes?.message}
                    >
                      <textarea
                        rows={4}
                        className={`${inputClass} py-3 min-h-[120px] resize-y`}
                        placeholder="סוג הלוגו, צבעים מועדפים, תאריך יעד…"
                        {...register("notes")}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-2 min-h-[54px] px-8 rounded-sm bg-brand-gold text-brand-onEspresso font-semibold text-base shadow-soft hover:bg-brand-goldHi transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          שולח…
                        </>
                      ) : (
                        "קבלו הצעת מחיר חינם ומפורטת"
                      )}
                    </button>

                    {submitState === "error" && (
                      <p
                        role="alert"
                        className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2"
                      >
                        משהו השתבש. נסו שוב או שלחו לנו מייל ל-
                        <a
                          href="mailto:hello@printbox.co.il"
                          className="underline font-semibold"
                        >
                          hello@printbox.co.il
                        </a>
                      </p>
                    )}

                    <p className="mt-4 text-xs text-brand-boneDim/80">
                      לא נשלח ספאם. הפרטים שלכם נשארים אצלנו בלבד.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-right">
      <span className="block text-sm font-medium text-brand-bone mb-2">
        {label}
      </span>
      <div className="[&>*]:w-full">{children}</div>
      {error && (
        <span role="alert" className="mt-1.5 inline-block text-xs text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
