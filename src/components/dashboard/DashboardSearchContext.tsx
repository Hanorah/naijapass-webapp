"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { detectNigerianState } from "@/lib/locateState";
import {
  DASHBOARD_STATE_KEY,
  normalizeDashboardState,
  readCachedDashboardState,
  writeDashboardState,
} from "@/lib/dashboardState";
import { useSession } from "@/components/SessionProvider";

const DashboardSearchContext = createContext<{
  search: string;
  setSearch: (v: string) => void;
  selectedState: string;
  setSelectedState: (v: string) => void;
  locating: boolean;
  locationSource: "user" | "geo" | "session" | "default";
  coords: { lat: number; lng: number } | null;
}>({
  search: "",
  setSearch: () => {},
  selectedState: "Lagos",
  setSelectedState: () => {},
  locating: false,
  locationSource: "default",
  coords: null,
});

function initialDashboardState() {
  if (typeof window === "undefined") return "Lagos";
  return readCachedDashboardState() ?? "Lagos";
}

export function DashboardSearchProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedStateRaw] = useState(initialDashboardState);
  const [locating, setLocating] = useState(true);
  const [locationSource, setLocationSource] = useState<
    "user" | "geo" | "session" | "default"
  >("default");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [resolved, setResolved] = useState(false);

  const setSelectedState = useCallback((v: string) => {
    const next = writeDashboardState(v);
    setSelectedStateRaw(next);
    setLocationSource("user");
  }, []);

  // Keep in sync when navbar / site state changes elsewhere.
  useEffect(() => {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      setSelectedStateRaw(normalizeDashboardState(detail));
      setLocationSource("user");
    };
    window.addEventListener("naijapass:state", onCustom);
    return () => window.removeEventListener("naijapass:state", onCustom);
  }, []);

  useEffect(() => {
    if (!ready || resolved) return;
    let cancelled = false;

    void (async () => {
      setLocating(true);

      const cached = readCachedDashboardState();
      if (cached) {
        setSelectedStateRaw(cached);
        setLocationSource("user");
      } else if (user?.state) {
        setSelectedStateRaw(normalizeDashboardState(user.state));
        setLocationSource("session");
      }

      const result = await detectNigerianState();
      if (cancelled) return;

      if (result.state) {
        const next = normalizeDashboardState(result.state);
        setSelectedStateRaw(next);
        setLocationSource("geo");
        writeDashboardState(next);
        if (result.lat && result.lng) {
          setCoords({ lat: result.lat, lng: result.lng });
        }
      } else if (!cached && !user?.state) {
        setSelectedStateRaw("Lagos");
        setLocationSource("default");
      }

      setLocating(false);
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, resolved, user?.state]);

  // When profile state loads after first paint, prefer it if we only have default.
  useEffect(() => {
    if (!ready || !user?.state || locationSource === "user" || locationSource === "geo") {
      return;
    }
    setSelectedStateRaw(normalizeDashboardState(user.state));
    setLocationSource("session");
  }, [ready, user?.state, locationSource]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      selectedState,
      setSelectedState,
      locating,
      locationSource,
      coords,
    }),
    [search, selectedState, setSelectedState, locating, locationSource, coords],
  );

  return (
    <DashboardSearchContext.Provider value={value}>
      {children}
    </DashboardSearchContext.Provider>
  );
}

export function useDashboardSearch() {
  return useContext(DashboardSearchContext);
}
