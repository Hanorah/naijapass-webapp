"use client";

import { useRef, type CSSProperties, type MouseEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const nodes = [
  { id: "sokoto", x: 109, y: 46 },
  { id: "katsina", x: 205, y: 47 },
  { id: "kano", x: 241, y: 88 },
  { id: "maiduguri", x: 426, y: 95 },
  { id: "kebbi", x: 68, y: 69 },
  { id: "kaduna", x: 198, y: 150 },
  { id: "abuja", x: 200, y: 212 },
  { id: "bauchi", x: 294, y: 159 },
  { id: "gombe", x: 347, y: 160 },
  { id: "yola", x: 399, y: 205 },
  { id: "ilorin", x: 82, y: 235 },
  { id: "lokoja", x: 170, y: 265 },
  { id: "makurdi", x: 241, y: 267 },
  { id: "ibadan", x: 56, y: 282 },
  { id: "lagos", x: 35, y: 318 },
  { id: "benin", x: 124, y: 326 },
  { id: "enugu", x: 200, y: 322 },
  { id: "ph", x: 180, y: 390 },
  { id: "calabar", x: 234, y: 384 },
  { id: "jos", x: 256, y: 176 },
  { id: "minna", x: 162, y: 188 },
];

const edges: [string, string][] = [
  ["sokoto", "kebbi"],
  ["sokoto", "katsina"],
  ["katsina", "kano"],
  ["kano", "kaduna"],
  ["kano", "bauchi"],
  ["kano", "maiduguri"],
  ["maiduguri", "gombe"],
  ["bauchi", "gombe"],
  ["gombe", "yola"],
  ["kaduna", "abuja"],
  ["kaduna", "jos"],
  ["jos", "bauchi"],
  ["jos", "makurdi"],
  ["minna", "abuja"],
  ["minna", "ilorin"],
  ["abuja", "lokoja"],
  ["lokoja", "makurdi"],
  ["lokoja", "benin"],
  ["ilorin", "ibadan"],
  ["ibadan", "lagos"],
  ["lagos", "benin"],
  ["benin", "enugu"],
  ["enugu", "makurdi"],
  ["enugu", "ph"],
  ["ph", "calabar"],
  ["calabar", "yola"],
  ["makurdi", "yola"],
  ["kebbi", "ilorin"],
  ["abuja", "jos"],
];

const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

const NIGERIA_PATH =
  "M8 9 L40 17 C70 16 100 15 130 22 C160 29 190 38 220 42 C250 40 280 38 310 34 C340 29 370 28 400 29 C426 31 452 34 468 55 C456 61 444 67 448 84 C450 93 452 101 466 105 C480 109 484 140 484 172 C476 193 468 214 454 235 C440 256 420 273 400 290 C386 300 372 311 326 326 C280 340 260 366 240 391 C230 399 220 407 200 410 C180 412 160 406 140 399 C120 380 100 361 80 346 C60 332 44 328 28 323 C20 321 12 319 10 298 C8 277 10 246 12 214 C20 183 28 151 34 120 C40 88 28 67 16 46 Z";

export default function NigeriaMap({
  className = "",
}: {
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".glass-node", {
          scale: 0.2,
          autoAlpha: 0,
          duration: 0.55,
          stagger: { each: 0.03, from: "center" },
          ease: "back.out(1.6)",
          delay: 0.25,
        });
        gsap.from(".glass-edge", {
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.012,
          ease: "power2.out",
          delay: 0.15,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) / rect.width) * 100;
    const gy = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
    el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
  };

  return (
    <div
      ref={root}
      onMouseMove={onMove}
      className={`glass-nigeria group relative overflow-hidden rounded-[28px] p-4 sm:p-6 md:p-8 ${className}`}
      style={
        {
          "--gx": "28%",
          "--gy": "18%",
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />

      <svg
        viewBox="0 0 520 460"
        className="relative z-[1] h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
        role="img"
        aria-label="Glass network map of Nigeria"
      >
        <defs>
          <linearGradient id="glassMapFill" x1="12%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="45%" stopColor="rgba(15,157,108,0.35)" />
            <stop offset="100%" stopColor="rgba(8,42,50,0.55)" />
          </linearGradient>
          <linearGradient id="glassWire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="50%" stopColor="rgba(94,234,212,0.9)" />
            <stop offset="100%" stopColor="rgba(103,232,249,0.7)" />
          </linearGradient>
          <radialGradient id="glassNode" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#0d9488" />
          </radialGradient>
          <filter id="glassBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="glassNg">
            <path d={NIGERIA_PATH} />
          </clipPath>
        </defs>

        <path
          d={NIGERIA_PATH}
          fill="url(#glassMapFill)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
        />

        <g clipPath="url(#glassNg)" opacity="0.28">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={40 + i * 46}
              x2="520"
              y2={40 + i * 46}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.4"
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={30 + i * 50}
              y1="0"
              x2={30 + i * 50}
              y2="460"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.4"
            />
          ))}
        </g>

        <g clipPath="url(#glassNg)" filter="url(#glassBlur)">
          {edges.map(([a, b]) => {
            const from = nodeMap[a];
            const to = nodeMap[b];
            return (
              <line
                key={`${a}-${b}`}
                className="glass-edge"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#glassWire)"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        <g clipPath="url(#glassNg)">
          {nodes.map((node, i) => (
            <g key={node.id} className="glass-node origin-center">
              <circle
                cx={node.x}
                cy={node.y}
                r={i % 4 === 0 ? 10 : 7}
                fill="rgba(255,255,255,0.18)"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={i % 5 === 0 ? 4.6 : 3.3}
                fill="url(#glassNode)"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
