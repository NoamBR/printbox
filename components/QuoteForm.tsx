"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quoteSchema,
  productOptions,
  quantityOptions,
  type QuoteInput,
} from "@/lib/quote-schema";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { useState } from "react";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const reasons = [
  { Icon: Sparkles, text: "מענה מותאם מהמעצבים שלנו, לא בוט." },
  { Icon: Clock, text: "תגובה ראשונית תוך יום עסקים אחד." },
  { Icon: ShieldCheck, text: "ללא התחייבות. הצעה כתובה במייל." },
];

const inputClass =
  "w-full min-h-[48px] px-4 rounded-lg bg-white border border-brand-line text-brand-ink placeholder:text-brand-muted/60 focus:border-brand-amber focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none transition-shadow duration-150";

export default function QuoteForm() {
  const reduce = useReducedMotion();
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

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
      className="bg-gradient-to-b from-brand-cream to-brand-paper/40 scroll-mt-24"
      aria-labelledby="quote-heading"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          {/* Right (RTL first): pitch */}
          <RevealOnScroll className="lg:col-span-2 text-right" as="div">
            <p className="text-sm font-semibold text-brand-amber uppercase tracking-wide mb-3">
              מתחילים
            </p>
            <h2
              id="quote-heading"
              className="text-[clamp(28px,4vw,40px)] font-bold text-brand-espresso leading-tight mb-5"
            >
              קבלו הצעת מחיר מותאמת
            </h2>
            <p className="text-lg text-brand-ink/80 leading-relaxed mb-8">
              ‎חוזרים אליכם תוך יום עסקים אחד עם תמחור, חלופות חומר וזמני הפקה.
            </p>
            <ul className="space-y-4">
              {reasons.map((r) => (
                <li key={r.text} className="flex items-start gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-brand-amber/15 text-brand-amber flex items-center justify-center">
                    <r.Icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="pt-1 text-base text-brand-ink/85">{r.text}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          {/* Left (RTL second): form card */}
          <RevealOnScroll className="lg:col-span-3" as="div" y={24}>
            <div className="relative rounded-2xl bg-white border border-brand-line shadow-softHover p-6 lg:p-10">
              <AnimatePresence mode="wait">
                {submitState === "success" ? (
                  <motion.div
                    key="success"
                    initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center py-10"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mb-5">
                      <CheckCircle2 className="size-9" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-espresso mb-2">
                      ההצעה שלכם בדרך 🎉
                    </h3>
                    <p className="text-brand-ink/80">
                      נחזור אליכם תוך יום עסקים אחד עם הצעת מחיר מפורטת.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitState("idle")}
                      className="mt-6 text-brand-amber font-semibold hover:underline"
                    >
                      שליחת בקשה נוספת
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
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
                      <select className={inputClass} defaultValue="" {...register("product")}>
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
                      <select className={inputClass} defaultValue="" {...register("quantity")}>
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
                      <Field label="הוסיפו פרטים (אופציונלי)" error={errors.notes?.message}>
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
                        className="w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-xl bg-brand-amber text-white font-semibold text-base shadow-soft hover:bg-brand-amberHi hover:shadow-softHover hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-5 animate-spin" />
                            שולח…
                          </>
                        ) : (
                          "שלחו בקשה לקבלת הצעה"
                        )}
                      </button>

                      {submitState === "error" && (
                        <p
                          role="alert"
                          className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                        >
                          משהו השתבש. נסו שוב או שלחו לנו מייל ל-
                          <a href="mailto:hello@printbox.co.il" className="underline font-semibold">
                            hello@printbox.co.il
                          </a>
                        </p>
                      )}

                      <p className="mt-4 text-xs text-brand-muted">
                        לא נשלח ספאם. הפרטים שלכם נשארים אצלנו בלבד.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </RevealOnScroll>
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
  const id = label.replace(/\s+/g, "-");
  return (
    <label htmlFor={id} className="block text-right">
      <span className="block text-sm font-semibold text-brand-espresso mb-2">
        {label}
      </span>
      {/* Attach id to first child input via cloneElement-ish: rely on register's name */}
      <div className="[&>*]:w-full">
        {children}
      </div>
      {error && (
        <span
          role="alert"
          className="mt-1.5 inline-block text-xs text-red-600"
        >
          {error}
        </span>
      )}
    </label>
  );
}
