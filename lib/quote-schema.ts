import { z } from "zod";

export const productOptions = [
  "כוסות נייר",
  "מנשאי כוסות",
  "מארזי מזון",
  "קופסאות משלוח",
  "אחר",
] as const;

export const quantityOptions = [
  "100–500",
  "500–2,000",
  "2,000–10,000",
  "10,000+",
] as const;

export const quoteSchema = z.object({
  fullName: z
    .string()
    .min(2, "נא להזין שם מלא")
    .max(80, "השם ארוך מדי"),
  email: z
    .string()
    .min(1, "נא להזין כתובת אימייל")
    .email("כתובת האימייל אינה תקינה"),
  phone: z
    .string()
    .min(9, "נא להזין מספר טלפון תקין")
    .regex(/^[0-9+\-\s()]+$/, "ניתן להזין ספרות, מקפים, רווחים וסוגריים בלבד"),
  company: z.string().min(2, "נא להזין שם עסק"),
  product: z.enum(productOptions, {
    errorMap: () => ({ message: "נא לבחור סוג מוצר" }),
  }),
  quantity: z.enum(quantityOptions, {
    errorMap: () => ({ message: "נא לבחור כמות משוערת" }),
  }),
  notes: z.string().max(2000, "הטקסט ארוך מדי").optional().or(z.literal("")),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
