import Link from "next/link";

export function BrandGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      <circle cx="16" cy="5" r="2.2" fill="currentColor" />
      <circle cx="16" cy="27" r="2.2" fill="currentColor" />
      <circle cx="5" cy="16" r="2.2" fill="currentColor" />
      <circle cx="27" cy="16" r="2.2" fill="currentColor" />
      <circle cx="8.2" cy="8.2" r="1.8" fill="currentColor" />
      <circle cx="23.8" cy="8.2" r="1.8" fill="currentColor" />
      <circle cx="8.2" cy="23.8" r="1.8" fill="currentColor" />
      <circle cx="23.8" cy="23.8" r="1.8" fill="currentColor" />
    </svg>
  );
}

export default function NaijaPassMark({
  light = false,
}: {
  light?: boolean;
}) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
          light ? "bg-white/10 text-forest" : "bg-forest/12 text-forest"
        }`}
      >
        <BrandGlyph className="relative h-5 w-5" />
      </span>
      <span
        className={`font-display text-[17px] font-semibold tracking-tight ${
          light ? "text-white" : "text-navy"
        }`}
      >
        NaijaPass
      </span>
    </Link>
  );
}
