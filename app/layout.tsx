import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ThemeBootstrap from "@/components/ThemeBootstrap";

const frankRuhlSans = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-sans-he",
});

const frankRuhlSerif = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-serif-he",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-latin-display",
});

export const metadata: Metadata = {
  title: "PrintBox | אריזות ממותגות לעסקים",
  description:
    "הפקה איכותית של כוסות, מנשאים, מארזי מזון וקופסאות משלוח ממותגות. מהסקיצה לדלת תוך 14 ימי עסקים, החל מ-100 יחידות.",
  metadataBase: new URL("https://printbox.example.com"),
  icons: {
    icon: [{ url: "/logo/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "PrintBox | אריזות ממותגות לעסקים",
    description:
      "כוסות, מנשאים, מארזי מזון וקופסאות משלוח עם העיצוב שלכם. מ-100 יחידות.",
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      data-theme="light"
      className={`${frankRuhlSans.variable} ${frankRuhlSerif.variable} ${cormorant.variable}`}
    >
      <body className="font-sans bg-brand-noir text-brand-bone">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
