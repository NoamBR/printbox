"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SVGProps } from "react";

/**
 * Stylized two-cups-with-splash composition rendered as inline SVG so it
 * inherits brand colors via CSS vars and scales infinitely. Designed to
 * sit "in" the page (no rectangular frame). Subtle motion: droplets drift,
 * cups breathe.
 */
export default function CupsSplashIcon(props: SVGProps<SVGSVGElement>) {
  const reduce = useReducedMotion();

  // CSS vars resolved via stroke="currentColor" / fill chains
  // Brown = brand.gold token, accent = light blue token
  return (
    <svg
      viewBox="0 0 520 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="cupGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-gold))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(var(--c-goldHi))" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="cupHi" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(var(--c-onEspresso))" stopOpacity="0.18" />
          <stop offset="50%" stopColor="rgb(var(--c-onEspresso))" stopOpacity="0.0" />
          <stop offset="100%" stopColor="rgb(var(--c-onEspresso))" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="pedestal" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgb(var(--c-accent))" stopOpacity="0.55" />
          <stop offset="60%" stopColor="rgb(var(--c-accent))" stopOpacity="0.10" />
          <stop offset="100%" stopColor="rgb(var(--c-accent))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="splashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-gold))" stopOpacity="0.7" />
          <stop offset="100%" stopColor="rgb(var(--c-goldHi))" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Pedestal halo */}
      <ellipse cx="260" cy="440" rx="220" ry="34" fill="url(#pedestal)" />

      {/* === LEFT CUP === */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={
          reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Cup body — trapezoid */}
        <path
          d="M 130 175 L 220 175 L 208 415 L 142 415 Z"
          fill="url(#cupGrad)"
        />
        {/* Side highlight */}
        <path
          d="M 130 175 L 220 175 L 208 415 L 142 415 Z"
          fill="url(#cupHi)"
        />
        {/* Cup outline */}
        <path
          d="M 130 175 L 220 175 L 208 415 L 142 415 Z"
          stroke="rgb(var(--c-goldHi))"
          strokeWidth="2"
          fill="none"
        />
        {/* Dome lid */}
        <path
          d="M 124 175 Q 175 145 226 175"
          fill="rgb(var(--c-onEspresso))"
          fillOpacity="0.35"
          stroke="rgb(var(--c-goldHi))"
          strokeWidth="2"
        />
        <ellipse
          cx="175"
          cy="175"
          rx="51"
          ry="6"
          fill="rgb(var(--c-goldHi))"
          fillOpacity="0.55"
        />
        {/* Straw */}
        <line
          x1="190"
          y1="148"
          x2="206"
          y2="115"
          stroke="rgb(var(--c-bone))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Monogram ring */}
        <line
          x1="138"
          y1="220"
          x2="216"
          y2="220"
          stroke="rgb(var(--c-onEspresso))"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
        {/* Monogram letter */}
        <text
          x="175"
          y="320"
          textAnchor="middle"
          fontFamily="var(--font-latin-display), serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="52"
          fill="rgb(var(--c-onEspresso))"
          fillOpacity="0.85"
        >
          P
        </text>
      </motion.g>

      {/* === RIGHT CUP === */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
        }
      >
        <path
          d="M 300 175 L 390 175 L 378 415 L 312 415 Z"
          fill="url(#cupGrad)"
        />
        <path
          d="M 300 175 L 390 175 L 378 415 L 312 415 Z"
          fill="url(#cupHi)"
        />
        <path
          d="M 300 175 L 390 175 L 378 415 L 312 415 Z"
          stroke="rgb(var(--c-goldHi))"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 294 175 Q 345 145 396 175"
          fill="rgb(var(--c-onEspresso))"
          fillOpacity="0.35"
          stroke="rgb(var(--c-goldHi))"
          strokeWidth="2"
        />
        <ellipse
          cx="345"
          cy="175"
          rx="51"
          ry="6"
          fill="rgb(var(--c-goldHi))"
          fillOpacity="0.55"
        />
        <line
          x1="320"
          y1="148"
          x2="304"
          y2="115"
          stroke="rgb(var(--c-bone))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="308"
          y1="220"
          x2="386"
          y2="220"
          stroke="rgb(var(--c-onEspresso))"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
        <text
          x="345"
          y="320"
          textAnchor="middle"
          fontFamily="var(--font-latin-display), serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="52"
          fill="rgb(var(--c-onEspresso))"
          fillOpacity="0.85"
        >
          B
        </text>
      </motion.g>

      {/* === SPLASH RIBBON between cups === */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={
          reduce ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <path
          d="M 220 140 Q 240 60 270 90 Q 290 110 300 140"
          fill="none"
          stroke="url(#splashGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 200 150 Q 230 110 260 130"
          fill="none"
          stroke="url(#splashGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      </motion.g>

      {/* Floating droplets */}
      {[
        { cx: 175, cy: 60, r: 6, delay: 0 },
        { cx: 240, cy: 40, r: 5, delay: 0.4 },
        { cx: 305, cy: 55, r: 7, delay: 0.8 },
        { cx: 360, cy: 78, r: 4, delay: 1.2 },
        { cx: 130, cy: 95, r: 4, delay: 0.6 },
        { cx: 410, cy: 110, r: 5, delay: 0.2 },
        { cx: 95, cy: 130, r: 3, delay: 1.0 },
        { cx: 440, cy: 145, r: 4, delay: 1.4 },
      ].map((d, i) => (
        <motion.circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="rgb(var(--c-gold))"
          fillOpacity="0.85"
          animate={
            reduce
              ? undefined
              : { y: [0, -8, 0], opacity: [0.85, 0.4, 0.85] }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 3 + (i % 3),
                  delay: d.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      {/* Subtle baseline under cups */}
      <line
        x1="80"
        y1="420"
        x2="440"
        y2="420"
        stroke="rgb(var(--c-gold))"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    </svg>
  );
}
