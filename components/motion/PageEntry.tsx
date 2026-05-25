"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const SESSION_KEY = "printbox.curtain.shown";

export default function PageEntry() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setShow(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          onAnimationComplete={() => setShow(false)}
          className="fixed inset-0 z-[70]"
          style={{
            background:
              "linear-gradient(180deg, #C9A55A 0%, #1C1C1C 60%, #0A0A0A 100%)",
          }}
        >
          {/* Brand mark inside curtain */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }}
              className="font-serif text-5xl text-brand-noir"
            >
              Print<span className="italic font-display">Box</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
