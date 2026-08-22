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
import {
  LISTINGS_KEY,
  PENDING_KEY,
  SESSION_KEY,
  demoUserForEmail,
  findStoredUser,
  readJson,
  removeKey,
  upsertUser,
  writeJson,
  type PendingRegistration,
  type SessionUser,
} from "@/lib/session";
import {
  seedMarketplaceListings,
  type MarketplaceListing,
} from "@/data/marketplace";

type SessionContextValue = {
  ready: boolean;
  user: SessionUser | null;
  pending: PendingRegistration | null;
  listings: MarketplaceListing[];
  startRegistration: (data: PendingRegistration) => void;
  completeKyc: (extra?: Partial<SessionUser>) => SessionUser | null;
  signIn: (email: string) => { user: SessionUser | null; needsKyc: boolean };
  signOut: () => void;
  updateUser: (patch: Partial<SessionUser>) => void;
  addListing: (listing: MarketplaceListing) => void;
  setListingStatus: (id: string, status: MarketplaceListing["status"]) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>(
    seedMarketplaceListings,
  );

  useEffect(() => {
    setUser(readJson<SessionUser>(SESSION_KEY));
    setPending(readJson<PendingRegistration>(PENDING_KEY));
    const stored = readJson<MarketplaceListing[]>(LISTINGS_KEY);
    if (stored?.length) {
      const byId = new Map(stored.map((item) => [item.id, item]));
      for (const seed of seedMarketplaceListings) {
        if (!byId.has(seed.id)) byId.set(seed.id, seed);
      }
      const merged = Array.from(byId.values());
      setListings(merged);
      writeJson(LISTINGS_KEY, merged);
    } else {
      setListings(seedMarketplaceListings);
    }
    setReady(true);
  }, []);

  const persistListings = useCallback((next: MarketplaceListing[]) => {
    setListings(next);
    writeJson(LISTINGS_KEY, next);
  }, []);

  const startRegistration = useCallback((data: PendingRegistration) => {
    setPending(data);
    writeJson(PENDING_KEY, data);
    setUser(null);
    removeKey(SESSION_KEY);
  }, []);

  const completeKyc = useCallback(
    (extra?: Partial<SessionUser>) => {
      const source = pending;
      if (!source) return null;
      const next: SessionUser = {
        name: source.name,
        email: source.email,
        phone: source.phone,
        state: source.state,
        role: source.role,
        verified: true,
        ...extra,
      };
      setUser(next);
      writeJson(SESSION_KEY, next);
      upsertUser(next);
      setPending(null);
      removeKey(PENDING_KEY);
      return next;
    },
    [pending],
  );

  const signIn = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase();
      const demo = demoUserForEmail(normalized);
      if (demo) {
        setUser(demo);
        writeJson(SESSION_KEY, demo);
        upsertUser(demo);
        setPending(null);
        removeKey(PENDING_KEY);
        return { user: demo, needsKyc: false };
      }

      const saved = findStoredUser(normalized);
      if (saved) {
        setUser(saved);
        writeJson(SESSION_KEY, saved);
        return { user: saved, needsKyc: !saved.verified };
      }

      const waiting = readJson<PendingRegistration>(PENDING_KEY);
      if (waiting && waiting.email.toLowerCase() === normalized) {
        setPending(waiting);
        return { user: null, needsKyc: true };
      }

      if (pending && pending.email.toLowerCase() === normalized) {
        return { user: null, needsKyc: true };
      }

      return { user: null, needsKyc: false };
    },
    [pending],
  );

  const signOut = useCallback(() => {
    setUser(null);
    removeKey(SESSION_KEY);
  }, []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((curr) => {
      if (!curr) return curr;
      const next = { ...curr, ...patch };
      writeJson(SESSION_KEY, next);
      upsertUser(next);
      return next;
    });
  }, []);

  const addListing = useCallback(
    (listing: MarketplaceListing) => {
      persistListings([listing, ...listings.filter((item) => item.id !== listing.id)]);
    },
    [listings, persistListings],
  );

  const setListingStatus = useCallback(
    (id: string, status: MarketplaceListing["status"]) => {
      persistListings(
        listings.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    [listings, persistListings],
  );

  const value = useMemo(
    () => ({
      ready,
      user,
      pending,
      listings,
      startRegistration,
      completeKyc,
      signIn,
      signOut,
      updateUser,
      addListing,
      setListingStatus,
    }),
    [
      ready,
      user,
      pending,
      listings,
      startRegistration,
      completeKyc,
      signIn,
      signOut,
      updateUser,
      addListing,
      setListingStatus,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
