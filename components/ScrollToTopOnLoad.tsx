"use client";

import { useEffect } from "react";

/**
 * On every full page load (refresh, direct navigation), start at the very top.
 * Disables the browser's built-in scroll-restoration so it doesn't restore
 * mid-page scroll positions after a reload.
 */
export default function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Defer one frame so layout has a chance to settle (Hebrew fonts, images, etc.)
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);
  return null;
}
