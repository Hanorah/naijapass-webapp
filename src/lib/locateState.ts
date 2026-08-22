import { nigerianStates, type NigerianState } from "@/data/states";

/** Rough lat/lng boxes for Nigerian states (good enough for default portal state). */
const STATE_BOUNDS: { state: NigerianState; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { state: "Lagos", minLat: 6.3, maxLat: 6.75, minLng: 2.7, maxLng: 4.4 },
  { state: "Ogun", minLat: 6.4, maxLat: 7.7, minLng: 2.6, maxLng: 4.6 },
  { state: "Oyo", minLat: 7.0, maxLat: 9.0, minLng: 2.7, maxLng: 4.6 },
  { state: "Osun", minLat: 7.2, maxLat: 8.1, minLng: 4.0, maxLng: 5.1 },
  { state: "Ondo", minLat: 5.8, maxLat: 7.8, minLng: 4.3, maxLng: 6.1 },
  { state: "Edo", minLat: 5.8, maxLat: 7.5, minLng: 5.0, maxLng: 6.6 },
  { state: "Delta", minLat: 5.0, maxLat: 6.5, minLng: 5.0, maxLng: 6.8 },
  { state: "Rivers", minLat: 4.3, maxLat: 5.7, minLng: 6.3, maxLng: 7.7 },
  { state: "Akwa Ibom", minLat: 4.5, maxLat: 5.5, minLng: 7.3, maxLng: 8.4 },
  { state: "Cross River", minLat: 4.8, maxLat: 6.8, minLng: 7.8, maxLng: 9.3 },
  { state: "Anambra", minLat: 5.9, maxLat: 6.8, minLng: 6.6, maxLng: 7.3 },
  { state: "Enugu", minLat: 6.2, maxLat: 7.1, minLng: 7.0, maxLng: 7.9 },
  { state: "Imo", minLat: 5.3, maxLat: 6.0, minLng: 6.6, maxLng: 7.5 },
  { state: "Abia", minLat: 4.8, maxLat: 6.0, minLng: 7.0, maxLng: 8.0 },
  { state: "FCT", minLat: 8.3, maxLat: 9.3, minLng: 6.8, maxLng: 7.7 },
  { state: "Kaduna", minLat: 9.0, maxLat: 11.5, minLng: 6.0, maxLng: 8.8 },
  { state: "Kano", minLat: 11.3, maxLat: 12.6, minLng: 7.8, maxLng: 9.4 },
  { state: "Katsina", minLat: 11.5, maxLat: 13.4, minLng: 6.8, maxLng: 8.9 },
  { state: "Sokoto", minLat: 11.5, maxLat: 13.9, minLng: 4.1, maxLng: 6.7 },
  { state: "Borno", minLat: 10.0, maxLat: 13.7, minLng: 11.5, maxLng: 14.7 },
  { state: "Plateau", minLat: 8.5, maxLat: 10.4, minLng: 8.5, maxLng: 10.5 },
  { state: "Benue", minLat: 6.5, maxLat: 8.2, minLng: 7.5, maxLng: 10.0 },
  { state: "Kwara", minLat: 8.0, maxLat: 10.2, minLng: 2.7, maxLng: 6.2 },
  { state: "Niger", minLat: 8.2, maxLat: 11.2, minLng: 3.5, maxLng: 7.5 },
  { state: "Bauchi", minLat: 9.5, maxLat: 12.5, minLng: 8.8, maxLng: 11.5 },
];

export function stateFromCoordinates(lat: number, lng: number): NigerianState | null {
  const hit = STATE_BOUNDS.find(
    (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng,
  );
  return hit?.state ?? null;
}

export function normalizeStateName(raw: string): NigerianState | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+state$/i, "");
  if (cleaned.includes("abuja") || cleaned === "fct" || cleaned.includes("federal capital")) {
    return "FCT";
  }
  const match = nigerianStates.find((s) => s.toLowerCase() === cleaned);
  return match ?? null;
}

/**
 * Detect Nigerian state from browser geolocation.
 * Tries Nominatim reverse geocode, then falls back to local bounds.
 */
export async function detectNigerianState(): Promise<{
  state: NigerianState | null;
  source: "geo" | "denied" | "unavailable" | "error";
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { state: null, source: "unavailable" };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 1000 * 60 * 30,
      });
    });

    const { latitude, longitude } = position.coords;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=8&addressdetails=1`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          address?: { state?: string; region?: string; "ISO3166-2-lvl4"?: string };
        };
        const candidate =
          data.address?.state || data.address?.region || "";
        const normalized = normalizeStateName(candidate);
        if (normalized) return { state: normalized, source: "geo" };
      }
    } catch {
      // fall through to bounds
    }

    const fromBounds = stateFromCoordinates(latitude, longitude);
    return { state: fromBounds, source: fromBounds ? "geo" : "error" };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? Number((err as GeolocationPositionError).code)
        : 0;
    if (code === 1) return { state: null, source: "denied" };
    return { state: null, source: "error" };
  }
}
