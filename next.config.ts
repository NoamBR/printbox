import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: [
    "better-sqlite3",
    "nodemailer",
    "imapflow",
    "mailparser",
    "@google/genai",
  ],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          path.resolve(process.cwd(), "data") + "/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
