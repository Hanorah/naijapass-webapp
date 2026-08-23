"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const roundedClass = {
  full: "rounded-full",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

export default function InitialsAvatar({
  name,
  src,
  size = 44,
  className = "",
  rounded = "full",
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const initials = initialsFromName(name) || "?";

  if (!showImage) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center bg-forest font-bold text-white ${roundedClass[rounded]} ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src!}
      alt={name}
      width={size}
      height={size}
      className={`object-cover ${roundedClass[rounded]} ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
