"use client";

/**
 * Shared selected-state for marketing + dashboard.
 * Persists to localStorage so Navbar and Live projects stay in sync.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { nigerianStates, type NigerianState } from "@/data/states";

const LOCATION_KEY = "naijapass.selectedState.v2";

type SiteStateContextValue = {
  selectedState: string;
  setSelectedState: (v: string) => void;
  ready: boolean;
};

const SiteStateContext = createContext<SiteStateContextValue>({
  selectedState: "All States",
  setSelectedState: () => {},
  ready: false,
});

function normalize(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "All States";
  if (/^all\s*states?$/i.test(cleaned)) return "All States";
  if (/abuja|fct|federal capital/i.test(cleaned)) return "FCT";
  const match = nigerianStates.find(
    (s) => s.toLowerCase() === cleaned.toLowerCase().replace(/\s+state$/i, ""),
  );
  return match ?? cleaned;
}

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [selectedState, setSelectedStateRaw] = useState("All States");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(LOCATION_KEY);
      if (cached) setSelectedStateRaw(normalize(cached));
    } catch {
      /* ignore */
    }
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCATION_KEY && e.newValue) {
        setSelectedStateRaw(normalize(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSelectedState = useCallback((v: string) => {
    const next = normalize(v);
    setSelectedStateRaw(next);
    try {
      window.localStorage.setItem(LOCATION_KEY, next);
      window.dispatchEvent(
        new CustomEvent("naijapass:state", { detail: next }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setSelectedStateRaw(normalize(detail));
    };
    window.addEventListener("naijapass:state", onCustom);
    return () => window.removeEventListener("naijapass:state", onCustom);
  }, []);

  const value = useMemo(
    () => ({ selectedState, setSelectedState, ready }),
    [selectedState, setSelectedState, ready],
  );

  return (
    <SiteStateContext.Provider value={value}>{children}</SiteStateContext.Provider>
  );
}

export function useSiteState() {
  return useContext(SiteStateContext);
}

export function isFct(state: string) {
  return state === "FCT" || /abuja/i.test(state);
}

export function projectMatchesState(projectState: string, selected: string) {
  if (!selected || /^all\s*states?$/i.test(selected)) return true;
  if (isFct(selected)) {
    return isFct(projectState) || projectState === "FCT";
  }
  return projectState.toLowerCase() === selected.toLowerCase();
}

export type { NigerianState };
