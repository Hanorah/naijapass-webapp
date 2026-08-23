/** Strip markdown artifacts Gemini sometimes emits; keep readable plain text. */
export function formatChatReply(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/^\s*\*\s+\*\s+\*/gm, "•")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const STARTER_QUERIES = new Set([
  "emergency numbers",
  "open tenders",
  "who is the governor?",
  "business permits",
]);

/** Instant local answers — skip the slow Gemini round-trip. */
export function shouldUseFastReply(message: string): boolean {
  const q = message.trim().toLowerCase();
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)\b/.test(q)) return true;
  if (STARTER_QUERIES.has(q)) return true;
  return false;
}
