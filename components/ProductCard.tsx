"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  spec: string;
  illustration: ReactNode;
  accent?: string;
};

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export default function ProductCard({ title, spec, illustration, accent = "#92400E" }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), SPRING);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), SPRING);
  const imageLift = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), SPRING);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    x.set(px);
    y.set(py);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }
      }
      className="group relative bg-white rounded-2xl border border-brand-line shadow-soft hover:shadow-softHover transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: `linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)` }}
      >
        <motion.div
          style={reduce ? undefined : { z: imageLift, transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-[1.04] transition-transform duration-300 ease-out-quint"
        >
          {illustration}
        </motion.div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1.5"
          style={{ background: accent }}
        />
      </div>
      <div className="p-6 text-right">
        <h3 className="text-xl font-bold text-brand-espresso mb-2">{title}</h3>
        <p className="text-sm text-brand-ink/75 leading-relaxed mb-4 min-h-[2.5em]">
          {spec}
        </p>
        <span className="inline-flex items-center gap-1.5 text-brand-amber font-semibold text-sm group-hover:gap-2.5 transition-all duration-200">
          מידע נוסף
          <ArrowLeft className="size-4" />
        </span>
      </div>
    </motion.article>
  );
}
