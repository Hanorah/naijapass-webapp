"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { STATE_CENTERS, detectNigerianState } from "@/lib/locateState";
import { nigerianStates, type NigerianState } from "@/data/states";
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "16px" };

type StateMapProps = {
  selectedState?: string;
  onStateDetected?: (state: string, lat: number, lng: number) => void;
  className?: string;
  height?: string;
};

export default function StateMap({
  selectedState = "Lagos",
  onStateDetected,
  className = "",
  height = "320px",
}: StateMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "naijapass-map",
  });

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const stateCenter =
    STATE_CENTERS[selectedState as NigerianState] ?? STATE_CENTERS.Lagos;

  const detectLocation = useCallback(async () => {
    setDetecting(true);
    setDetectError(null);
    const result = await detectNigerianState();
    setDetecting(false);

    if (result.source === "denied") {
      setDetectError("Location permission denied. Select your state manually.");
      return;
    }
    if (result.lat && result.lng) {
      setUserPos({ lat: result.lat, lng: result.lng });
    }
    if (result.state && onStateDetected && result.lat && result.lng) {
      onStateDetected(result.state, result.lat, result.lng);
    } else if (!result.state) {
      setDetectError("Could not determine your state. Please select manually.");
    }
  }, [onStateDetected]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const mapCenter = userPos ?? stateCenter;

  if (!apiKey) {
    const delta = userPos ? 0.08 : 0.35;
    const bbox = `${mapCenter.lng - delta},${mapCenter.lat - delta},${mapCenter.lng + delta},${mapCenter.lat + delta}`;
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`;

    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ height }}>
        <iframe
          title={`Map of ${selectedState}`}
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-navy shadow-md backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-forest" />
          {selectedState}
          {userPos ? <span className="text-slate">· You are here</span> : null}
        </div>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy shadow-md hover:bg-[#f4f6f8] disabled:opacity-50"
        >
          {detecting ? "Detecting…" : "Re-detect location"}
        </button>
        {detectError ? (
          <p className="absolute bottom-3 left-3 flex max-w-[70%] items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs text-red-600 shadow-md">
            <AlertCircle className="h-3 w-3 shrink-0" /> {detectError}
          </p>
        ) : null}
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-red-50 p-6 text-sm text-red-600 ${className}`}
        style={{ height }}
      >
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#f4f6f8] ${className}`}
        style={{ height }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={userPos ?? stateCenter}
        zoom={userPos ? 10 : 7}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#f4f6f8" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#5a6470" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e8e0" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
        }}
      >
        <Marker
          position={stateCenter}
          title={selectedState}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#0f9d6c",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
        {userPos && (
          <Marker
            position={userPos}
            title="Your location"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#b8956a",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>

      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-navy shadow-md backdrop-blur-sm">
        <MapPin className="h-3 w-3 text-forest" />
        {selectedState}
        {userPos && <span className="text-slate">· You are here</span>}
      </div>

      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy shadow-md hover:bg-[#f4f6f8] disabled:opacity-50"
      >
        {detecting ? "Detecting…" : "Re-detect location"}
      </button>
    </div>
  );
}

export { nigerianStates };
