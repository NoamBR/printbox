"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const SIZE = 320;
const SPRING = { stiffness: 220, damping: 30, mass: 0.4 };

export default function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  useEffect(() => {
    if (reduce) return;
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mql.matches) return;
    setEnabled(true);

    function onMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function onOver(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = !!t.closest(
        "a, button, [role='button'], input, select, textarea, [data-cursor-grow]"
      );
      setHovering(interactive);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        width: SIZE,
        height: SIZE,
      }}
      animate={{ scale: hovering ? 1.2 : 1, opacity: hovering ? 0.9 : 0.55 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-[15]"
    >
      {/* Uses --c-accent (powder blue on light, gold on dark) at low opacity */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--c-accent) / 0.18) 0%, rgb(var(--c-accent) / 0.08) 35%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </motion.div>
  );
}
