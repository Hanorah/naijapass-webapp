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
  PROJECT_FEEDBACK_KEY,
  SESSION_KEY,
  readJson,
  removeKey,
  writeJson,
  type PendingRegistration,
  type SessionUser,
  type SubmitProjectFeedbackInput,
  type UserProjectFeedback,
} from "@/lib/session";
import {
  seedMarketplaceListings,
  type MarketplaceListing,
} from "@/data/marketplace";
import { mergeBids, readBids, upsertBid, writeBids, type TenderBid } from "@/lib/bids";
import {
  apiCreateListing,
  apiFetch,
  apiListListings,
  apiLogin,
  apiMe,
  apiRegister,
  apiSetListingStatus,
  apiUpdateMe,
  clearToken,
  getToken,
  isApiConfigured,
  setToken,
} from "@/lib/api/client";
import { apiListingToMarketplace, marketplaceToCreatePayload } from "@/lib/listings";

export type AuthResult = {
  user: SessionUser | null;
  needsKyc: boolean;
  error?: string;
};

type RegistrationInput = PendingRegistration & { password: string };

type SessionContextValue = {
  ready: boolean;
  /** True when NEXT_PUBLIC_API_URL is set. */
  live: boolean;
  user: SessionUser | null;
  pending: PendingRegistration | null;
  listings: MarketplaceListing[];
  startRegistration: (data: RegistrationInput) => Promise<AuthResult>;
  completeKyc: (extra?: Partial<SessionUser>) => Promise<SessionUser | null>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
  /** PATCH /api/auth/me, then sync the session (local patch when offline). */
  saveProfile: (
    patch: Partial<SessionUser> & { businessName?: string },
  ) => Promise<{ user: SessionUser | null; error?: string }>;
  refresh: () => Promise<void>;
  addListing: (listing: MarketplaceListing) => Promise<void>;
  setListingStatus: (
    id: string,
    status: MarketplaceListing["status"],
  ) => Promise<void>;
  tenderBids: TenderBid[];
  submitBid: (bid: TenderBid) => TenderBid;
  bidForTender: (tenderRef: string, tenderId?: string) => TenderBid | undefined;
  projectFeedback: UserProjectFeedback[];
  submitProjectFeedback: (
    input: SubmitProjectFeedbackInput,
  ) => Promise<UserProjectFeedback | null>;
  feedbackForProject: (projectId: string) => UserProjectFeedback[];
};

const SessionContext = createContext<SessionContextValue | null>(null);

function friendlyAuthError(message: string) {
  if (/invalid email or password|invalid login/i.test(message)) {
    return "Email or password is incorrect.";
  }
  if (/already exists|already registered/i.test(message)) {
    return "An account with that email already exists. Sign in instead.";
  }
  return message;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const live = isApiConfigured();

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>(seedMarketplaceListings);
  const [projectFeedback, setProjectFeedback] = useState<UserProjectFeedback[]>([]);
  const [tenderBids, setTenderBids] = useState<TenderBid[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProjectFeedback(readJson<UserProjectFeedback[]>(PROJECT_FEEDBACK_KEY) ?? []);
    setTenderBids(readBids());

    let active = true;
    void (async () => {
      if (live) {
        try {
          const body = await apiListListings();
          if (!active) return;
          const fromApi = (body.listings ?? []).map(apiListingToMarketplace);
          const byId = new Map(seedMarketplaceListings.map((item) => [item.id, item]));
          for (const item of fromApi) byId.set(item.id, item);
          const merged = Array.from(byId.values());
          setListings(merged);
          writeJson(LISTINGS_KEY, merged);
          return;
        } catch {
          /* fall through to local seeds */
        }
      }

      const stored = readJson<MarketplaceListing[]>(LISTINGS_KEY);
      if (stored?.length) {
        const byId = new Map(stored.map((item) => [item.id, item]));
        for (const seed of seedMarketplaceListings) {
          if (!byId.has(seed.id)) byId.set(seed.id, seed);
        }
        const merged = Array.from(byId.values());
        if (!active) return;
        setListings(merged);
        writeJson(LISTINGS_KEY, merged);
      } else if (active) {
        setListings(seedMarketplaceListings);
      }
    })();

    return () => {
      active = false;
    };
  }, [live]);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!live) {
        if (!active) return;
        setUser(readJson<SessionUser>(SESSION_KEY));
        setPending(readJson<PendingRegistration>(PENDING_KEY));
        setReady(true);
        return;
      }

      const token = getToken();
      if (!token) {
        if (!active) return;
        setUser(null);
        setPending(readJson<PendingRegistration>(PENDING_KEY));
        setReady(true);
        return;
      }

      try {
        const { user: me } = await apiMe();
        if (!active) return;
        setUser(me);
        writeJson(SESSION_KEY, me);
        setPending(me.verified ? null : readJson<PendingRegistration>(PENDING_KEY));
      } catch {
        if (!active) return;
        clearToken();
        setUser(null);
        setPending(readJson<PendingRegistration>(PENDING_KEY));
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [live]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const refresh = useCallback(async () => {
    if (!live) return;
    try {
      const { user: me } = await apiMe();
      setUser(me);
      writeJson(SESSION_KEY, me);
    } catch {
      clearToken();
      setUser(null);
    }
  }, [live]);

  const persistListings = useCallback((next: MarketplaceListing[]) => {
    setListings(next);
    writeJson(LISTINGS_KEY, next);
  }, []);

  const startRegistration = useCallback(
    async (data: RegistrationInput): Promise<AuthResult> => {
      const record: PendingRegistration = {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        state: data.state,
        role: data.role,
      };

      if (!live) {
        return {
          user: null,
          needsKyc: false,
          error: "API is not configured. Set NEXT_PUBLIC_API_URL.",
        };
      }

      try {
        const result = await apiRegister({
          email: record.email,
          password: data.password,
          fullName: record.name,
          phone: record.phone,
          state: record.state,
          role: record.role,
        });
        setToken(result.token);
        setUser(result.user);
        writeJson(SESSION_KEY, result.user);
        setPending(record);
        writeJson(PENDING_KEY, record);
        return { user: result.user, needsKyc: !result.user.verified };
      } catch (err) {
        return {
          user: null,
          needsKyc: false,
          error: friendlyAuthError(err instanceof Error ? err.message : "Registration failed."),
        };
      }
    },
    [live],
  );

  const completeKyc = useCallback(
    async (extra?: Partial<SessionUser>): Promise<SessionUser | null> => {
      if (!live) return null;
      try {
        const { user: me } = await apiMe();
        const next: SessionUser = {
          ...me,
          verified: true,
          accountStatus: "active",
          ...extra,
        };
        setUser(next);
        writeJson(SESSION_KEY, next);
        setPending(null);
        removeKey(PENDING_KEY);
        return next;
      } catch {
        return null;
      }
    },
    [live],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();

      if (!live) {
        return {
          user: null,
          needsKyc: false,
          error: "API is not configured. Set NEXT_PUBLIC_API_URL.",
        };
      }

      try {
        const result = await apiLogin(normalized, password);
        setToken(result.token);
        setUser(result.user);
        writeJson(SESSION_KEY, result.user);
        setPending(null);
        removeKey(PENDING_KEY);

        if (result.user.accountStatus === "suspended") {
          clearToken();
          setUser(null);
          return {
            user: null,
            needsKyc: false,
            error: "This account is suspended. Contact the portal administrator.",
          };
        }

        const needsKyc = !result.user.verified;
        if (needsKyc) {
          setPending({
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            state: result.user.state,
            role: result.user.role === "business" ? "business" : "individual",
          });
        }
        return { user: result.user, needsKyc };
      } catch (err) {
        return {
          user: null,
          needsKyc: false,
          error: friendlyAuthError(err instanceof Error ? err.message : "Sign-in failed."),
        };
      }
    },
    [live],
  );

  const signOut = useCallback(async () => {
    setUser(null);
    setPending(null);
    removeKey(SESSION_KEY);
    removeKey(PENDING_KEY);
    clearToken();
  }, []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((curr) => {
      if (!curr) return curr;
      const next = { ...curr, ...patch };
      writeJson(SESSION_KEY, next);
      return next;
    });
  }, []);

  const saveProfile = useCallback(
    async (
      patch: Partial<SessionUser> & { businessName?: string },
    ): Promise<{ user: SessionUser | null; error?: string }> => {
      if (!user) return { user: null, error: "Sign in first." };
      const { businessName, ...sessionPatch } = patch;
      if (!live || !getToken()) {
        const next = { ...user, ...sessionPatch };
        setUser(next);
        writeJson(SESSION_KEY, next);
        return { user: next };
      }
      try {
        const body = await apiUpdateMe({
          fullName: sessionPatch.name,
          phone: sessionPatch.phone,
          state: sessionPatch.state,
          department: sessionPatch.department,
          officeTitle: sessionPatch.officeTitle,
          businessType: sessionPatch.businessType,
          businessName,
          avatarUrl: sessionPatch.avatarUrl,
        });
        const next = body.user ?? { ...user, ...sessionPatch };
        setUser(next);
        writeJson(SESSION_KEY, next);
        return { user: next };
      } catch (err) {
        return {
          user: null,
          error: err instanceof Error ? err.message : "Could not save profile.",
        };
      }
    },
    [user, live],
  );

  const persistFeedback = useCallback((next: UserProjectFeedback[]) => {
    setProjectFeedback(next);
    writeJson(PROJECT_FEEDBACK_KEY, next);
  }, []);

  const feedbackForProject = useCallback(
    (projectId: string) =>
      projectFeedback.filter((entry) => entry.projectId === projectId),
    [projectFeedback],
  );

  const submitProjectFeedback = useCallback(
    async (input: SubmitProjectFeedbackInput): Promise<UserProjectFeedback | null> => {
      if (!user?.verified) return null;
      const entry: UserProjectFeedback = {
        id: `UF-${input.projectId}-${Date.now()}`,
        projectId: input.projectId,
        userEmail: user.email,
        userName: user.name,
        rating: input.rating,
        topic: input.topic.trim(),
        body: input.body.trim(),
        createdAt: new Date().toISOString(),
      };

      if (live && user.id) {
        try {
          await apiFetch(`/api/projects/${input.projectId}/feedback`, {
            method: "POST",
            body: JSON.stringify({
              rating: input.rating,
              topic: entry.topic,
              body: entry.body,
            }),
          });
        } catch {
          return null;
        }
      }

      persistFeedback([entry, ...projectFeedback]);
      return entry;
    },
    [user, live, projectFeedback, persistFeedback],
  );

  const addListing = useCallback(
    async (listing: MarketplaceListing) => {
      if (live && getToken()) {
        try {
          const body = await apiCreateListing(marketplaceToCreatePayload(listing));
          const saved = apiListingToMarketplace(body.listing);
          persistListings([saved, ...listings.filter((item) => item.id !== saved.id)]);
          return;
        } catch {
          /* fall through to local persist */
        }
      }
      persistListings([listing, ...listings.filter((item) => item.id !== listing.id)]);
    },
    [listings, persistListings, live],
  );

  const setListingStatus = useCallback(
    async (id: string, status: MarketplaceListing["status"]) => {
      if (live && getToken()) {
        try {
          await apiSetListingStatus(id, status);
        } catch {
          /* still update local view */
        }
      }
      persistListings(
        listings.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    [listings, persistListings, live],
  );

  const submitBid = useCallback((bid: TenderBid) => {
    const saved = upsertBid(bid);
    setTenderBids(readBids());
    return saved;
  }, []);

  const bidForTender = useCallback(
    (tenderRef: string, tenderId?: string) =>
      (tenderBids ?? []).find(
        (item) =>
          item.contactEmail === user?.email &&
          ((tenderId && item.tenderId === tenderId) || item.tenderRef === tenderRef),
      ),
    [tenderBids, user?.email],
  );

  const value = useMemo(
    () => ({
      ready,
      live,
      user,
      pending,
      listings,
      startRegistration,
      completeKyc,
      signIn,
      signOut,
      updateUser,
      saveProfile,
      refresh,
      addListing,
      setListingStatus,
      tenderBids,
      submitBid,
      bidForTender,
      projectFeedback,
      submitProjectFeedback,
      feedbackForProject,
    }),
    [
      ready,
      live,
      user,
      pending,
      listings,
      projectFeedback,
      startRegistration,
      completeKyc,
      signIn,
      signOut,
      updateUser,
      saveProfile,
      refresh,
      addListing,
      setListingStatus,
      tenderBids,
      submitBid,
      bidForTender,
      submitProjectFeedback,
      feedbackForProject,
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
  return {
    ...ctx,
    tenderBids: ctx.tenderBids ?? [],
    submitBid:
      ctx.submitBid ??
      ((bid: TenderBid) => {
        void bid;
        return bid;
      }),
    bidForTender: ctx.bidForTender ?? (() => undefined) as (ref: string, id?: string) => undefined,
  };
}
