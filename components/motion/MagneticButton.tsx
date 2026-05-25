"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

const SPRING = { stiffness: 240, damping: 22, mass: 0.5 };
const RADIUS = 90; // px from button center where pull begins
const MAX = 14; // max translate in px

type Props = {
  children: ReactNode;
  className?: string;
  as?: "a" | "button" | "div";
} & React.HTMLAttributes<HTMLElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function MagneticButton({
  children,
  className,
  as = "a",
  ...rest
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS + Math.max(r.width, r.height) / 2) {
      x.set(0);
      y.set(0);
      return;
    }
    const k = Math.min(1, RADIUS / Math.max(dist, 1));
    x.set((dx / RADIUS) * MAX * k);
    y.set((dy / RADIUS) * MAX * k);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const Tag = motion[as] as typeof motion.a;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLAnchorElement>}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { x: sx, y: sy }}
      data-cursor-grow=""
      className={className}
      {...(rest as React.ComponentProps<typeof Tag>)}
    >
      {children}
    </Tag>
  );
}
