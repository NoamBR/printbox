"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { Box } from "lucide-react";

const navLinks = [
  { href: "#products", label: "מוצרים" },
  { href: "#quote", label: "הצעת מחיר" },
];

export default function StickyNav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (v) => setShow(v > 200));
  }, [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          initial={reduce ? { y: 0 } : { y: -100 }}
          animate={{ y: 0 }}
          exit={reduce ? { y: 0 } : { y: -100 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block fixed inset-x-0 top-0 z-40 bg-brand-cream/85 backdrop-blur-md border-b border-brand-line/60"
          aria-label="ניווט קבוע"
        >
          <div className="max-w-container mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
            <a
              href="#quote"
              className="inline-flex items-center min-h-[44px] px-5 rounded-xl bg-brand-amber text-white font-semibold text-sm hover:bg-brand-amberHi transition-colors"
            >
              קבלו הצעה
            </a>
            <div className="flex items-center gap-7">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-brand-ink/80 hover:text-brand-kraft transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a href="#" className="flex items-center gap-2 font-bold text-brand-espresso">
                <Box className="size-5 text-brand-amber" />
                PrintBox
              </a>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
