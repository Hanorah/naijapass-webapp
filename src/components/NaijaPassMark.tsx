import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Compact mark for tight spots (sidebar icon, etc.). */
export function BrandGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <Image
      src="/naijapass-logoo.png"
      alt=""
      width={128}
      height={64}
      className={cn("h-full w-auto object-contain", className)}
      aria-hidden
    />
  );
}

type MarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-10",
  md: "h-12",
  lg: "h-14 md:h-16",
};

export default function NaijaPassMark({
  className,
  size = "md",
}: MarkProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
      aria-label="NaijaPass home"
    >
      <Image
        src="/naijapass-logoo.png"
        alt="NaijaPass"
        width={320}
        height={120}
        priority
        className={cn("w-auto object-contain", sizeClass[size])}
      />
    </Link>
  );
}
