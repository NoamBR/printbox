import Papa from "papaparse";
import { z } from "zod";

export const prospectRowSchema = z.object({
  company_name: z.string().min(1, "company_name חסר"),
  industry_he: z.string().min(1, "industry_he חסר"),
  first_name: z.string().min(1, "first_name חסר"),
  last_name: z.string().optional().default(""),
  role: z.string().optional().default(""),
  email: z.string().email("email לא תקין"),
  phone: z.string().optional().default(""),
  city: z.string().min(1, "city חסר"),
  website: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type ParsedRow = z.infer<typeof prospectRowSchema>;

export type ParseResult = {
  valid: ParsedRow[];
  errors: { row: number; messages: string[] }[];
  total: number;
};

export function parseProspectsCsv(text: string): ParseResult {
  const out = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const valid: ParsedRow[] = [];
  const errors: ParseResult["errors"] = [];
  out.data.forEach((raw, i) => {
    const result = prospectRowSchema.safeParse(raw);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: i + 2,
        messages: result.error.issues.map(
          (iss) => `${iss.path.join(".") || "row"}: ${iss.message}`
        ),
      });
    }
  });
  return { valid, errors, total: out.data.length };
}
