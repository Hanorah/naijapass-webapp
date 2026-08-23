/** First + last token initials for avatar fallback when no portrait URL exists. */
export function governorInitials(rawName: string): string {
  const cleaned = rawName
    .replace(/\(.*?\)/g, "")
    .replace(
      /\b(Dr|Prof|Rev|Fr|Engr|Hon|Prince|Sen|Alhaji|Mal|Rt\.?\s*Hon\.?|Pastor|Malam)\.?\s/gi,
      "",
    )
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
