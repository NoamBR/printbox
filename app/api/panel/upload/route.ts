import { NextResponse } from "next/server";
import { parseProspectsCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let text: string;
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }
    text = await file.text();
  } else {
    text = await req.text();
  }
  const result = parseProspectsCsv(text);
  return NextResponse.json(result);
}
