import { z } from "zod";

export const itemSpecsSchema = z.object({
  dimensions: z.string().trim().max(120).optional().or(z.literal("")),
  sides: z.string().trim().max(60).optional().or(z.literal("")),
  finish: z.string().trim().max(120).optional().or(z.literal("")),
  color: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ItemSpecs = z.infer<typeof itemSpecsSchema>;

export const cartItemSchema = z.object({
  productId: z
    .string()
    .regex(/^PB-\d{3}$/, "מזהה מוצר לא תקין"),
  productTitleHe: z.string().min(1),
  productTitleEn: z.string().min(1),
  quantity: z
    .number({ invalid_type_error: "נא להזין כמות" })
    .int("הכמות חייבת להיות מספר שלם")
    .positive("הכמות חייבת להיות חיובית"),
  specs: itemSpecsSchema,
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const clientContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "נא להזין שם מלא")
    .max(80, "השם ארוך מדי"),
  email: z
    .string()
    .trim()
    .min(1, "נא להזין כתובת אימייל")
    .email("כתובת האימייל אינה תקינה"),
  phone: z
    .string()
    .trim()
    .min(9, "נא להזין מספר טלפון תקין")
    .regex(/^[0-9+\-\s()]+$/, "ניתן להזין ספרות, מקפים, רווחים וסוגריים בלבד"),
  company: z.string().trim().min(2, "נא להזין שם עסק"),
  notes: z
    .string()
    .max(2000, "הטקסט ארוך מדי")
    .optional()
    .or(z.literal("")),
});
export type ClientContact = z.infer<typeof clientContactSchema>;

export const quoteSubmissionSchema = z.object({
  client: clientContactSchema,
  items: cartItemSchema
    .array()
    .min(1, "הסל ריק — הוסיפו מוצר אחד לפחות לפני השליחה")
    .max(40, "ניתן לכלול עד 40 פריטים בסל"),
});
export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;

export const CART_STORAGE_KEY = "printbox.quote-cart.v1";
