import fs from "node:fs";
import path from "node:path";

export type EmailAttachment = {
  filename: string;
  path: string;
  size: number;
};

const CATALOG_PDF = path.join(process.cwd(), "PrintBox-Magazine-2026.pdf");

export function attachmentsForStep(step: number): EmailAttachment[] {
  if (step !== 1) return [];
  if (!fs.existsSync(CATALOG_PDF)) return [];
  const stat = fs.statSync(CATALOG_PDF);
  return [
    {
      filename: "PrintBox-Magazine-2026.pdf",
      path: CATALOG_PDF,
      size: stat.size,
    },
  ];
}
