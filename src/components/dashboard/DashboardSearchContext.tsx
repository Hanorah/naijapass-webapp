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
import { useSession } from "@/components/SessionProvider";

const LOCATION_KEY = "naijapass.detectedState";

const DashboardSearchContext = createContext<{
  search: string;
  setSearch: (v: string) => void;
  selectedState: string;
  setSelectedState: (v: string) => void;
  locating: boolean;
  locationSource: "user" | "geo" | "session" | "default";
}>({
  search: "",
  setSearch: () => {},
  selectedState: "Lagos",
  setSelectedState: () => {},
  locating: false,
  locationSource: "default",
});

export function DashboardSearchProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedStateRaw] = useState("Lagos");
  const [locating, setLocating] = useState(true);
  const [locationSource, setLocationSource] = useState<
    "user" | "geo" | "session" | "default"
  >("default");
  const [resolved, setResolved] = useState(false);

  const setSelectedState = useCallback((v: string) => {
    setSelectedStateRaw(v);
    setLocationSource("user");
    try {
      window.localStorage.setItem(LOCATION_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!ready || resolved) return;
    let cancelled = false;

    (async () => {
      setLocating(true);

      try {
        const cached = window.localStorage.getItem(LOCATION_KEY);
        if (cached) {
          if (!cancelled) {
            setSelectedStateRaw(cached);
            setLocationSource("user");
            setLocating(false);
            setResolved(true);
          }
          return;
        }
      } catch {
        /* ignore */
      }

      if (user?.state) {
        if (!cancelled) {
          setSelectedStateRaw(user.state);
          setLocationSource("session");
        }
      }

      const result = await detectNigerianState();
      if (cancelled) return;

      if (result.state) {
        setSelectedStateRaw(result.state);
        setLocationSource("geo");
        try {
          window.localStorage.setItem(LOCATION_KEY, result.state);
        } catch {
          /* ignore */
        }
      } else if (!user?.state) {
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

  const value = useMemo(
    () => ({
      search,
      setSearch,
      selectedState,
      setSelectedState,
      locating,
      locationSource,
    }),
    [search, selectedState, setSelectedState, locating, locationSource],
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
