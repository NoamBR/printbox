import type { Config } from "tailwindcss";
// @ts-expect-error — tailwindcss-rtl ships no types
import tailwindcssRtl from "tailwindcss-rtl";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          noir: "rgb(var(--c-noir) / <alpha-value>)",
          surface: "rgb(var(--c-surface) / <alpha-value>)",
          surfaceHi: "rgb(var(--c-surfaceHi) / <alpha-value>)",
          line: "rgb(var(--c-line) / <alpha-value>)",
          gold: "rgb(var(--c-gold) / <alpha-value>)",
          goldHi: "rgb(var(--c-goldHi) / <alpha-value>)",
          espresso: "rgb(var(--c-espresso) / <alpha-value>)",
          bone: "rgb(var(--c-bone) / <alpha-value>)",
          boneDim: "rgb(var(--c-boneDim) / <alpha-value>)",
          ink: "rgb(var(--c-ink) / <alpha-value>)",
          cta: "rgb(var(--c-cta) / <alpha-value>)",
          ctaHi: "rgb(var(--c-ctaHi) / <alpha-value>)",
          accent: "rgb(var(--c-accent) / <alpha-value>)",
          onEspresso: "rgb(var(--c-onEspresso) / <alpha-value>)",
          onEspressoDim: "rgb(var(--c-onEspressoDim) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans-he)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif-he)", "Georgia", "serif"],
        display: ["var(--font-latin-display)", "var(--font-serif-he)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.32)",
        softHover: "0 16px 40px rgba(0,0,0,0.42), 0 0 0 1px rgba(201,165,90,0.18)",
        goldGlow: "0 0 24px rgba(201,165,90,0.35)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        container: "1200px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        goldShimmer: {
          "0%, 100%": { backgroundPosition: "200% 0" },
          "50%": { backgroundPosition: "-100% 0" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        goldShimmer: "goldShimmer 6s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssRtl],
};

export default config;
