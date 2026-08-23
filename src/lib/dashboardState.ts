/** Shared state key — must match siteState.tsx so navbar and dashboard stay in sync. */
import { nigerianStates } from "@/data/states";

export const DASHBOARD_STATE_KEY = "naijapass.selectedState.v2";

/**
 * Canonical state name used everywhere (DB filters, portal scoping, hub).
 * Case-insensitive and strips a trailing "State".
 */
export function normalizeDashboardState(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned || /^all\s*states?$/i.test(cleaned)) return "Lagos";
  if (/abuja|fct|federal capital/i.test(cleaned)) return "FCT";

  const stripped = cleaned.replace(/\s+state$/i, "").trim();
  const exact = nigerianStates.find(
    (state) => state.toLowerCase() === stripped.toLowerCase(),
  );
  if (exact) return exact;

  const startsWith = nigerianStates.find((state) =>
    stripped.toLowerCase().startsWith(state.toLowerCase()),
  );
  return startsWith ?? stripped;
}

export function readCachedDashboardState(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(DASHBOARD_STATE_KEY);
    return cached ? normalizeDashboardState(cached) : null;
  } catch {
    return null;
  }
}

export function writeDashboardState(state: string) {
  const next = normalizeDashboardState(state);
  try {
    window.localStorage.setItem(DASHBOARD_STATE_KEY, next);
    window.dispatchEvent(new CustomEvent("naijapass:state", { detail: next }));
  } catch {
    /* ignore */
  }
  return next;
}
