"use client";

import { Moon, Sun, Leaf } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "sage";
const STORAGE_KEY = "pb.theme";
const ORDER: Theme[] = ["light", "dark", "sage"];

function getInitial(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "sage") return attr;
  return "light";
}

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,     // currently light → click goes to dark
  dark: Moon,     // currently dark → click goes to sage
  sage: Leaf,     // currently sage → click goes back to light
};

const LABELS: Record<Theme, string> = {
  light: "מצב בהיר",
  dark: "מצב כהה",
  sage: "מצב סייג",
};

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitial());
  }, []);

  function cycle() {
    const idx = ORDER.indexOf(theme);
    const next = ORDER[(idx + 1) % ORDER.length];
    setTheme(next);
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 420);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  const Icon = ICONS[theme];
  const nextTheme = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`החלפת ערכת נושא — כעת ${LABELS[theme]}, הבא ${LABELS[nextTheme]}`}
      title={`${LABELS[theme]} → ${LABELS[nextTheme]}`}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-sm border border-brand-line text-brand-bone/85 hover:text-brand-gold hover:border-brand-gold/60 transition-colors ${className}`}
    >
      <Icon className="size-4" strokeWidth={1.8} />
    </button>
  );
}
