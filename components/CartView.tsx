"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useQuoteCart } from "@/lib/cart-store";
import {
  clientContactSchema,
  type ClientContact,
  type CartItem,
} from "@/lib/quote-schema";

const inputClass =
  "w-full min-h-[48px] px-4 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone placeholder:text-brand-boneDim/60 focus:border-brand-gold focus:shadow-[0_0_0_3px_rgb(var(--c-gold)/0.18)] focus:outline-none transition-shadow duration-150";

function specsSummary(it: CartItem): string {
  const parts: string[] = [];
  if (it.specs.dimensions) parts.push(it.specs.dimensions);
  if (it.specs.sides) parts.push(it.specs.sides);
  if (it.specs.finish) parts.push(it.specs.finish);
  if (it.specs.color) parts.push(it.specs.color);
  return parts.join(" · ");
}

export default function CartView() {
  const { items, hydrated, update, remove, clear, totalQty } = useQuoteCart();
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [publicId, setPublicId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientContact>({
    resolver: zodResolver(clientContactSchema),
    mode: "onBlur",
  });

  async function onSubmit(client: ClientContact) {
    setSubmitState("idle");
    try {
      const res = await fetch("/api/quote-cart/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, items }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        publicId?: string;
      };
      if (!res.ok) throw new Error("server");
      setPublicId(data.publicId ?? null);
      setSubmitState("success");
      clear();
      reset();
    } catch {
      setSubmitState("error");
    }
  }

  if (!hydrated) {
    return (
      <section className="bg-brand-noir min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-7 animate-spin text-brand-gold" />
      </section>
    );
  }

  if (submitState === "success") {
    return (
      <section className="bg-brand-noir min-h-[60vh] py-24">
        <div className="max-w-xl mx-auto px-6 text-right">
          <h1 className="font-serif text-3xl text-brand-bone mb-3">
            הבקשה נשלחה.
          </h1>
          <p className="text-brand-boneDim mb-2">
            נחזור אליכם בקרוב עם הצעת מחיר מפורטת.
          </p>
          {publicId && (
            <p className="text-sm text-brand-boneDim mb-8">
              מזהה:{" "}
              <span className="font-mono text-brand-bone">{publicId}</span>
            </p>
          )}
          <Link
            href="/catalog"
            className="text-sm text-brand-gold hover:text-brand-goldHi border-b border-brand-gold pb-0.5"
          >
            חזרה לקטלוג
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-brand-noir min-h-[60vh] py-24">
        <div className="max-w-xl mx-auto px-6 text-right">
          <h1 className="font-serif text-3xl text-brand-bone mb-3">הסל ריק.</h1>
          <Link
            href="/catalog"
            className="text-sm text-brand-gold hover:text-brand-goldHi border-b border-brand-gold pb-0.5"
          >
            לקטלוג
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-noir min-h-[60vh] py-12 lg:py-16">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <header className="mb-8 text-right">
          <h1 className="font-serif text-3xl lg:text-4xl text-brand-bone">
            הסל שלך
          </h1>
        </header>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          {/* Items */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="rounded-sm bg-brand-surface border border-brand-line divide-y divide-brand-line">
              {items.map((it, idx) => (
                <article
                  key={`${it.productId}-${idx}`}
                  className="p-5 lg:p-6 flex flex-col sm:flex-row gap-5 text-right"
                >
                  <div className="relative shrink-0 w-full sm:w-28 h-28 rounded-sm bg-brand-surfaceHi border border-brand-line overflow-hidden">
                    <Image
                      src={`/renders/${it.productId}_branded.png`}
                      alt={it.productTitleHe}
                      fill
                      sizes="120px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        aria-label="הסרת פריט"
                        className="text-brand-boneDim hover:text-red-400 transition-colors p-1 -m-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <h3 className="font-serif text-lg text-brand-bone leading-tight">
                        {it.productTitleHe}
                      </h3>
                    </div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-brand-boneDim mb-3">
                      {it.productId}
                    </p>
                    {specsSummary(it) && (
                      <p className="text-sm text-brand-boneDim mb-3 leading-relaxed">
                        {specsSummary(it)}
                      </p>
                    )}
                    {it.specs.notes && (
                      <p className="text-xs text-brand-boneDim/80 mb-3 italic leading-relaxed">
                        “{it.specs.notes}”
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <span className="text-xs text-brand-boneDim">
                        כמות:
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={10}
                        dir="ltr"
                        value={it.quantity}
                        onChange={(e) =>
                          update(idx, {
                            quantity: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-28 min-h-[40px] px-3 rounded-sm bg-brand-surfaceHi border border-brand-line text-brand-bone text-end focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </article>
              ))}
              <div className="p-5 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={clear}
                  className="text-brand-boneDim hover:text-red-400 transition-colors"
                >
                  ניקוי הסל
                </button>
                <div className="text-brand-bone">
                  <span className="text-brand-boneDim">סה&quot;כ פריטים:</span>{" "}
                  <span className="font-semibold">{items.length}</span>
                  <span className="mx-3 text-brand-boneDim/40">·</span>
                  <span className="text-brand-boneDim">סה&quot;כ יח&apos;:</span>{" "}
                  <span className="font-semibold text-brand-gold tabular-nums">
                    {totalQty.toLocaleString("he-IL")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="rounded-sm bg-brand-surface border border-brand-line p-6 lg:p-8 text-right">
              <h2 className="font-serif text-xl text-brand-bone mb-5">
                פרטי קשר
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-4"
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
                    placeholder="052-123-4567"
                    {...register("phone")}
                  />
                </Field>
                <Field label="הערות נוספות (אופציונלי)" error={errors.notes?.message}>
                  <textarea
                    rows={3}
                    className={`${inputClass} py-3 min-h-[96px] resize-y`}
                    placeholder="תאריך יעד, העדפות חומר, פרטי משלוח…"
                    {...register("notes")}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="mt-2 w-full min-h-[50px] inline-flex items-center justify-center gap-2 px-8 rounded-sm bg-brand-gold text-brand-onEspresso font-medium text-sm hover:bg-brand-goldHi transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      שולח…
                    </>
                  ) : (
                    "שליחה"
                  )}
                </button>
                {submitState === "error" && (
                  <p
                    role="alert"
                    className="text-xs text-red-300"
                  >
                    משהו השתבש. נסו שוב או שלחו ל-
                    <a
                      href="mailto:marketing@print-box.store"
                      className="underline"
                    >
                      marketing@print-box.store
                    </a>
                  </p>
                )}
              </form>
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
        <span role="alert" className="mt-1.5 inline-block text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}
