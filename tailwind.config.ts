import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          kraft: "#92400E",
          espresso: "#78350F",
          cream: "#FFFBEB",
          paper: "#FEF3C7",
          amber: "#D97706",
          amberHi: "#C2780F",
          ink: "#1F2937",
          muted: "#A16207",
          line: "#E7D9B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-heebo-hebrew)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(120,53,15,0.06)",
        softHover: "0 12px 28px rgba(120,53,15,0.12)",
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
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
