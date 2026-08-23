import { NextRequest, NextResponse } from "next/server";
import { normalizeStateName } from "@/lib/locateState";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    return NextResponse.json({ state: null });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&result_type=administrative_area_level_1`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ state: null });

    const data = (await res.json()) as {
      results?: { address_components?: { long_name: string; types: string[] }[] }[];
    };

    for (const result of data.results ?? []) {
      for (const comp of result.address_components ?? []) {
        if (comp.types.includes("administrative_area_level_1")) {
          const state = normalizeStateName(comp.long_name);
          if (state) return NextResponse.json({ state });
        }
      }
    }
  } catch {
    /* fall through */
  }

  return NextResponse.json({ state: null });
}
