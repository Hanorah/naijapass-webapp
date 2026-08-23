"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const nodes = [
  { id: "sokoto", label: "Sokoto", x: 109, y: 46, major: false },
  { id: "katsina", label: "Katsina", x: 205, y: 47, major: false },
  { id: "kano", label: "Kano", x: 241, y: 88, major: true },
  { id: "maiduguri", label: "Maiduguri", x: 426, y: 95, major: true },
  { id: "kebbi", label: "Kebbi", x: 68, y: 69, major: false },
  { id: "kaduna", label: "Kaduna", x: 198, y: 150, major: true },
  { id: "abuja", label: "Abuja", x: 200, y: 212, major: true },
  { id: "bauchi", label: "Bauchi", x: 294, y: 159, major: false },
  { id: "gombe", label: "Gombe", x: 347, y: 160, major: false },
  { id: "yola", label: "Yola", x: 399, y: 205, major: false },
  { id: "ilorin", label: "Ilorin", x: 82, y: 235, major: false },
  { id: "lokoja", label: "Lokoja", x: 170, y: 265, major: false },
  { id: "makurdi", label: "Makurdi", x: 241, y: 267, major: false },
  { id: "ibadan", label: "Ibadan", x: 56, y: 282, major: true },
  { id: "lagos", label: "Lagos", x: 35, y: 318, major: true },
  { id: "benin", label: "Benin", x: 124, y: 326, major: false },
  { id: "enugu", label: "Enugu", x: 200, y: 322, major: true },
  { id: "ph", label: "Port Harcourt", x: 180, y: 390, major: true },
  { id: "calabar", label: "Calabar", x: 234, y: 384, major: false },
  { id: "jos", label: "Jos", x: 256, y: 176, major: false },
  { id: "minna", label: "Minna", x: 162, y: 188, major: false },
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
  interactive = true,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".glass-node", {
          scale: 0,
          autoAlpha: 0,
          duration: 0.65,
          stagger: { each: 0.035, from: "center" },
          ease: "back.out(2.2)",
          delay: 0.35,
        });
        gsap.from(".glass-edge", {
          autoAlpha: 0,
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 0.9,
          stagger: 0.015,
          ease: "power2.out",
          delay: 0.2,
        });
        gsap.from(".glass-map-fill", {
          autoAlpha: 0,
          scale: 0.92,
          transformOrigin: "50% 50%",
          duration: 1.2,
          ease: "power3.out",
        });
        gsap.from(".glass-orb", {
          scale: 0.6,
          autoAlpha: 0,
          duration: 1.4,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.1,
        });

        gsap.to(".glass-pulse", {
          scale: 2,
          autoAlpha: 0,
          duration: 2.8,
          stagger: { each: 0.4, repeat: -1 },
          ease: "power1.out",
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) / rect.width) * 100;
    const gy = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
    el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
    el.style.setProperty("--mx", `${((gx - 50) * 0.08).toFixed(2)}deg`);
    el.style.setProperty("--my", `${((gy - 50) * -0.06).toFixed(2)}deg`);
  };

  const onLeave = () => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--gx", "28%");
    el.style.setProperty("--gy", "18%");
    el.style.setProperty("--mx", "0deg");
    el.style.setProperty("--my", "0deg");
    setHoveredNode(null);
  };

  return (
    <div
      ref={root}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`glass-nigeria group relative overflow-hidden rounded-[32px] p-4 sm:p-6 md:p-8 ${className}`}
      style={
        {
          "--gx": "28%",
          "--gy": "18%",
          "--mx": "0deg",
          "--my": "0deg",
        } as CSSProperties
      }
    >
      {/* Ambient orbs */}
      <div className="glass-orb pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="glass-orb pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-teal-300/15 blur-2xl" />
      <div className="glass-orb pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/8 blur-xl" />

      {/* Top highlight edge */}
      <div className="pointer-events-none absolute inset-x-6 top-0 z-[3] h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-12 top-px z-[3] h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

      {/* Corner accents */}
      <div className="pointer-events-none absolute left-4 top-4 z-[3] h-8 w-8 rounded-tl-2xl border-l border-t border-white/25" />
      <div className="pointer-events-none absolute bottom-4 right-4 z-[3] h-8 w-8 rounded-br-2xl border-b border-r border-white/20" />

      <svg
        viewBox="0 0 520 460"
        className="glass-map-svg relative z-[1] h-auto w-full"
        role="img"
        aria-label="Interactive glass network map of Nigeria"
        style={{
          transform: "perspective(900px) rotateX(var(--my)) rotateY(var(--mx))",
          transition: "transform 0.15s ease-out",
        }}
      >
        <defs>
          <linearGradient id="glassMapFill" x1="8%" y1="0%" x2="92%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="35%" stopColor="rgba(52,211,153,0.42)" />
            <stop offset="70%" stopColor="rgba(15,157,108,0.38)" />
            <stop offset="100%" stopColor="rgba(6,40,48,0.65)" />
          </linearGradient>
          <linearGradient id="glassMapShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="glassWire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="40%" stopColor="rgba(110,231,183,0.95)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.75)" />
          </linearGradient>
          <radialGradient id="glassNode" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#0d9488" />
          </radialGradient>
          <radialGradient id="glassNodeMajor" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <filter id="glassGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glassSoftBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="glassNg">
            <path d={NIGERIA_PATH} />
          </clipPath>
        </defs>

        {/* Outer glow silhouette */}
        <path
          d={NIGERIA_PATH}
          fill="none"
          stroke="rgba(52,211,153,0.35)"
          strokeWidth="6"
          filter="url(#glassGlow)"
          opacity="0.6"
        />

        {/* Main fill */}
        <path
          className="glass-map-fill"
          d={NIGERIA_PATH}
          fill="url(#glassMapFill)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.8"
        />

        {/* Inner shine overlay */}
        <path
          d={NIGERIA_PATH}
          fill="url(#glassMapShine)"
          opacity="0.5"
          clipPath="url(#glassNg)"
        />

        {/* Grid lines */}
        <g clipPath="url(#glassNg)" opacity="0.22">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={40 + i * 46}
              x2="520"
              y2={40 + i * 46}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.35"
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={30 + i * 50}
              y1="0"
              x2={30 + i * 50}
              y2="460"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.35"
            />
          ))}
        </g>

        {/* Network edges */}
        <g clipPath="url(#glassNg)" filter="url(#glassSoftBlur)">
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
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g clipPath="url(#glassNg)">
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const r = node.major ? 5.5 : 3.8;
            const glowR = node.major ? 14 : 10;
            return (
              <g
                key={node.id}
                className="glass-node origin-center cursor-default"
                onMouseEnter={() => interactive && setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Pulse ring */}
                {node.major && (
                  <circle
                    className="glass-pulse"
                    cx={node.x}
                    cy={node.y}
                    r={glowR}
                    fill="none"
                    stroke="rgba(110,231,183,0.5)"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                )}
                {/* Glow halo */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? glowR + 4 : glowR}
                  fill={isHovered ? "rgba(110,231,183,0.25)" : "rgba(255,255,255,0.08)"}
                  style={{ transition: "r 0.2s ease, fill 0.2s ease" }}
                />
                {/* Core dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? r + 1.5 : r}
                  fill={node.major ? "url(#glassNodeMajor)" : "url(#glassNode)"}
                  filter="url(#glassGlow)"
                  style={{ transition: "r 0.2s ease" }}
                />
                {/* Label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={node.x - 36}
                      y={node.y - 28}
                      width="72"
                      height="18"
                      rx="6"
                      fill="rgba(12,18,24,0.85)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={node.x}
                      y={node.y - 16}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Live indicator */}
      <div className="absolute bottom-5 left-5 z-[4] flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
          Live network
        </span>
      </div>
    </div>
  );
}
