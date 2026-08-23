import { nigerianStates, type NigerianState } from "@/data/states";

/** Lat/lng bounding boxes for all 36 states + FCT. */
const STATE_BOUNDS: {
  state: NigerianState;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}[] = [
  { state: "Abia", minLat: 4.8, maxLat: 6.0, minLng: 7.0, maxLng: 7.9 },
  { state: "Adamawa", minLat: 7.5, maxLat: 10.5, minLng: 11.5, maxLng: 13.8 },
  { state: "Akwa Ibom", minLat: 4.4, maxLat: 5.6, minLng: 7.3, maxLng: 8.4 },
  { state: "Anambra", minLat: 5.8, maxLat: 6.9, minLng: 6.6, maxLng: 7.4 },
  { state: "Bauchi", minLat: 9.5, maxLat: 12.5, minLng: 8.8, maxLng: 11.5 },
  { state: "Bayelsa", minLat: 4.3, maxLat: 5.4, minLng: 5.4, maxLng: 6.6 },
  { state: "Benue", minLat: 6.5, maxLat: 8.2, minLng: 7.5, maxLng: 10.0 },
  { state: "Borno", minLat: 10.0, maxLat: 13.7, minLng: 11.5, maxLng: 14.7 },
  { state: "Cross River", minLat: 4.8, maxLat: 6.8, minLng: 7.8, maxLng: 9.3 },
  { state: "Delta", minLat: 5.0, maxLat: 6.5, minLng: 5.0, maxLng: 6.8 },
  { state: "Ebonyi", minLat: 5.7, maxLat: 6.8, minLng: 7.5, maxLng: 8.4 },
  { state: "Edo", minLat: 5.8, maxLat: 7.5, minLng: 5.0, maxLng: 6.6 },
  { state: "Ekiti", minLat: 7.3, maxLat: 8.2, minLng: 4.9, maxLng: 5.8 },
  { state: "Enugu", minLat: 6.2, maxLat: 7.1, minLng: 7.0, maxLng: 7.9 },
  { state: "FCT", minLat: 8.3, maxLat: 9.3, minLng: 6.8, maxLng: 7.7 },
  { state: "Gombe", minLat: 9.5, maxLat: 11.5, minLng: 10.5, maxLng: 12.5 },
  { state: "Imo", minLat: 5.3, maxLat: 6.0, minLng: 6.6, maxLng: 7.5 },
  { state: "Jigawa", minLat: 11.0, maxLat: 13.2, minLng: 8.5, maxLng: 10.5 },
  { state: "Kaduna", minLat: 9.0, maxLat: 11.5, minLng: 6.0, maxLng: 8.8 },
  { state: "Kano", minLat: 11.3, maxLat: 12.6, minLng: 7.8, maxLng: 9.4 },
  { state: "Katsina", minLat: 11.5, maxLat: 13.4, minLng: 6.8, maxLng: 8.9 },
  { state: "Kebbi", minLat: 10.0, maxLat: 13.0, minLng: 3.5, maxLng: 6.5 },
  { state: "Kogi", minLat: 6.8, maxLat: 8.5, minLng: 5.5, maxLng: 7.8 },
  { state: "Kwara", minLat: 8.0, maxLat: 10.2, minLng: 2.7, maxLng: 6.2 },
  { state: "Lagos", minLat: 6.3, maxLat: 6.75, minLng: 2.7, maxLng: 4.4 },
  { state: "Nasarawa", minLat: 7.8, maxLat: 9.5, minLng: 7.0, maxLng: 9.2 },
  { state: "Niger", minLat: 8.2, maxLat: 11.2, minLng: 3.5, maxLng: 7.5 },
  { state: "Ogun", minLat: 6.4, maxLat: 7.7, minLng: 2.6, maxLng: 4.6 },
  { state: "Ondo", minLat: 5.8, maxLat: 7.8, minLng: 4.3, maxLng: 6.1 },
  { state: "Osun", minLat: 7.2, maxLat: 8.1, minLng: 4.0, maxLng: 5.1 },
  { state: "Oyo", minLat: 7.0, maxLat: 9.0, minLng: 2.7, maxLng: 4.6 },
  { state: "Plateau", minLat: 8.5, maxLat: 10.4, minLng: 8.5, maxLng: 10.5 },
  { state: "Rivers", minLat: 4.3, maxLat: 5.7, minLng: 6.3, maxLng: 7.7 },
  { state: "Sokoto", minLat: 11.5, maxLat: 13.9, minLng: 4.1, maxLng: 6.7 },
  { state: "Taraba", minLat: 6.5, maxLat: 9.5, minLng: 9.0, maxLng: 12.0 },
  { state: "Yobe", minLat: 11.0, maxLat: 13.5, minLng: 10.5, maxLng: 13.0 },
  { state: "Zamfara", minLat: 11.0, maxLat: 13.5, minLng: 5.0, maxLng: 7.5 },
];

/** Approximate center coordinates for map markers. */
export const STATE_CENTERS: Record<NigerianState, { lat: number; lng: number }> = {
  Abia: { lat: 5.45, lng: 7.49 },
  Adamawa: { lat: 9.33, lng: 12.4 },
  "Akwa Ibom": { lat: 5.0, lng: 7.85 },
  Anambra: { lat: 6.35, lng: 7.0 },
  Bauchi: { lat: 10.31, lng: 9.84 },
  Bayelsa: { lat: 4.77, lng: 6.07 },
  Benue: { lat: 7.34, lng: 8.74 },
  Borno: { lat: 11.83, lng: 13.15 },
  "Cross River": { lat: 5.87, lng: 8.6 },
  Delta: { lat: 5.7, lng: 5.9 },
  Ebonyi: { lat: 6.26, lng: 8.08 },
  Edo: { lat: 6.34, lng: 5.62 },
  Ekiti: { lat: 7.72, lng: 5.22 },
  Enugu: { lat: 6.52, lng: 7.49 },
  FCT: { lat: 9.06, lng: 7.49 },
  Gombe: { lat: 10.29, lng: 11.17 },
  Imo: { lat: 5.57, lng: 7.07 },
  Jigawa: { lat: 12.0, lng: 9.35 },
  Kaduna: { lat: 10.52, lng: 7.44 },
  Kano: { lat: 11.99, lng: 8.53 },
  Katsina: { lat: 12.99, lng: 7.6 },
  Kebbi: { lat: 11.5, lng: 4.2 },
  Kogi: { lat: 7.8, lng: 6.74 },
  Kwara: { lat: 9.08, lng: 4.6 },
  Lagos: { lat: 6.52, lng: 3.38 },
  Nasarawa: { lat: 8.54, lng: 8.0 },
  Niger: { lat: 9.6, lng: 6.55 },
  Ogun: { lat: 7.0, lng: 3.35 },
  Ondo: { lat: 7.1, lng: 5.1 },
  Osun: { lat: 7.62, lng: 4.56 },
  Oyo: { lat: 8.0, lng: 3.93 },
  Plateau: { lat: 9.22, lng: 9.52 },
  Rivers: { lat: 4.82, lng: 7.0 },
  Sokoto: { lat: 13.06, lng: 5.24 },
  Taraba: { lat: 8.0, lng: 10.77 },
  Yobe: { lat: 12.29, lng: 11.96 },
  Zamfara: { lat: 12.17, lng: 6.66 },
};

export function stateFromCoordinates(lat: number, lng: number): NigerianState | null {
  const hits = STATE_BOUNDS.filter(
    (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng,
  );
  if (hits.length === 1) return hits[0].state;
  if (hits.length > 1) {
    let best = hits[0];
    let bestDist = Infinity;
    for (const h of hits) {
      const center = STATE_CENTERS[h.state];
      const dist = Math.hypot(lat - center.lat, lng - center.lng);
      if (dist < bestDist) {
        bestDist = dist;
        best = h;
      }
    }
    return best.state;
  }
  return null;
}

export function normalizeStateName(raw: string): NigerianState | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+state$/i, "");
  if (cleaned.includes("abuja") || cleaned === "fct" || cleaned.includes("federal capital")) {
    return "FCT";
  }
  const match = nigerianStates.find((s) => s.toLowerCase() === cleaned);
  return match ?? null;
}

async function reverseGeocodeGoogle(
  lat: number,
  lng: number,
): Promise<NigerianState | null> {
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: string };
    if (data.state) return normalizeStateName(data.state);
  } catch {
    /* fall through */
  }
  return null;
}

async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
): Promise<NigerianState | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=8&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: { state?: string; region?: string };
    };
    const candidate = data.address?.state || data.address?.region || "";
    return normalizeStateName(candidate);
  } catch {
    return null;
  }
}

export type LocationResult = {
  state: NigerianState | null;
  lat: number | null;
  lng: number | null;
  source: "geo" | "denied" | "unavailable" | "error";
};

/**
 * Detect Nigerian state from browser geolocation.
 * Tries Google Geocoding → Nominatim → local bounding boxes.
 */
export async function detectNigerianState(): Promise<LocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { state: null, lat: null, lng: null, source: "unavailable" };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000 * 60 * 15,
      });
    });

    const { latitude, longitude } = position.coords;

    const fromGoogle = await reverseGeocodeGoogle(latitude, longitude);
    if (fromGoogle) {
      return { state: fromGoogle, lat: latitude, lng: longitude, source: "geo" };
    }

    const fromNominatim = await reverseGeocodeNominatim(latitude, longitude);
    if (fromNominatim) {
      return { state: fromNominatim, lat: latitude, lng: longitude, source: "geo" };
    }

    const fromBounds = stateFromCoordinates(latitude, longitude);
    return {
      state: fromBounds,
      lat: latitude,
      lng: longitude,
      source: fromBounds ? "geo" : "error",
    };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? Number((err as GeolocationPositionError).code)
        : 0;
    if (code === 1) return { state: null, lat: null, lng: null, source: "denied" };
    return { state: null, lat: null, lng: null, source: "error" };
  }
}
