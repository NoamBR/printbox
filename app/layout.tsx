import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-heebo-hebrew",
});

export const metadata: Metadata = {
  title: "PrintBox | אריזות ממותגות לעסקים",
  description:
    "הפקה איכותית של כוסות, מנשאים, מארזי מזון וקופסאות משלוח ממותגות. מהסקיצה לדלת תוך 14 ימי עסקים, החל מ-100 יחידות.",
  metadataBase: new URL("https://printbox.example.com"),
  openGraph: {
    title: "PrintBox | אריזות ממותגות לעסקים",
    description:
      "כוסות, מנשאים, מארזי מזון וקופסאות משלוח עם העיצוב שלכם. מ-100 יחידות.",
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFBEB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans bg-brand-cream text-brand-ink">
        {children}
      </body>
    </html>
  );
}
