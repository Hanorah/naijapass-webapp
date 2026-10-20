import { isApiConfigured } from "@/lib/api/client";

/** True when the Express API is configured (NEXT_PUBLIC_API_URL). */
export function isLiveBackend(): boolean {
  return isApiConfigured();
}

/** Prefer Express API when NEXT_PUBLIC_API_URL is set. */
export function usesApiBackend(): boolean {
  return isApiConfigured();
}
