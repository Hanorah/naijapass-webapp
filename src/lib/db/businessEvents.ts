export const BUSINESSES_CHANGED_EVENT = "naijapass:businesses-changed";

export function notifyBusinessesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BUSINESSES_CHANGED_EVENT));
}
