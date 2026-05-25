import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog"],
        disallow: ["/panel", "/api"],
      },
    ],
    sitemap: "https://printbox.example.com/sitemap.xml",
  };
}
