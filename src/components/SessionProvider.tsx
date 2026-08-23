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
  PROFILE_COLUMNS,
  PROJECT_FEEDBACK_KEY,
  ROLES,
  SESSION_KEY,
  demoUserForEmail,
  findStoredUser,
  profileToSessionUser,
  readJson,
  removeKey,
  upsertUser,
  writeJson,
  type PendingRegistration,
  type ProfileRow,
  type Role,
  type SessionUser,
  type SubmitProjectFeedbackInput,
  type UserProjectFeedback,
} from "@/lib/session";
import {
  seedMarketplaceListings,
  type MarketplaceListing,
} from "@/data/marketplace";
import { mergeBids, readBids, upsertBid, writeBids, type TenderBid } from "@/lib/bids";
import { dbBidToTenderBid } from "@/lib/db/procurement";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { nigerianStates } from "@/data/states";
import type { User as AuthUser } from "@supabase/supabase-js";

export type AuthResult = {
  user: SessionUser | null;
  needsKyc: boolean;
  error?: string;
};

type RegistrationInput = PendingRegistration & { password: string };

type SessionContextValue = {
  ready: boolean;
  /** True when a live Supabase project is backing this session. */
  live: boolean;
  user: SessionUser | null;
  pending: PendingRegistration | null;
  listings: MarketplaceListing[];
  startRegistration: (data: RegistrationInput) => Promise<AuthResult>;
  completeKyc: (extra?: Partial<SessionUser>) => Promise<SessionUser | null>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
  refresh: () => Promise<void>;
  addListing: (listing: MarketplaceListing) => void;
  setListingStatus: (id: string, status: MarketplaceListing["status"]) => void;
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
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Confirm your email address, then sign in again.";
  }
  if (/already registered|already exists/i.test(message)) {
    return "An account with that email already exists. Sign in instead.";
  }
  return message;
}

function toRole(value: unknown): Role {
  return (ROLES as readonly string[]).includes(String(value))
    ? (value as Role)
    : "individual";
}

/** lagos@govt.naijapass.ng → Lagos */
function govtStateFromEmail(email: string): string | undefined {
  const match = email.trim().toLowerCase().match(/^([a-z0-9]+)@govt\.naijapass\.ng$/);
  if (!match) return undefined;
  const local = match[1];
  return nigerianStates.find(
    (state) => state.toLowerCase().replace(/[\s-]/g, "") === local,
  );
}

function fallbackUserFromAuth(authUser: AuthUser): SessionUser {
  const email = authUser.email ?? "";
  const meta = authUser.user_metadata ?? {};
  const fromEmail = govtStateFromEmail(email);
  const metaRole = toRole(meta.role);
  const role: Role =
    metaRole !== "individual"
      ? metaRole
      : fromEmail
        ? "govt"
        : "individual";
  const state =
    (typeof meta.govt_state === "string" && meta.govt_state) ||
    (typeof meta.state === "string" && meta.state) ||
    fromEmail ||
    "";

  return {
    id: authUser.id,
    name:
      (typeof meta.full_name === "string" && meta.full_name) ||
      email.split("@")[0] ||
      "NaijaPass user",
    email,
    phone: typeof meta.phone === "string" ? meta.phone : "",
    state,
    role,
    verified: role === "govt" || role === "admin",
    govtState: role === "govt" ? state || fromEmail : undefined,
    accountStatus: "active",
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const live = isSupabaseConfigured();
  // One browser client for the lifetime of the provider; it owns the auth
  // cookie refresh timer, so recreating it on every render would leak.
  const [supabase] = useState(() => (live ? createClient() : null));

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>(
    seedMarketplaceListings,
  );
  const [projectFeedback, setProjectFeedback] = useState<UserProjectFeedback[]>(
    [],
  );
  const [tenderBids, setTenderBids] = useState<TenderBid[]>([]);

  const loadProfile = useCallback(
    async (authUser?: AuthUser | null): Promise<SessionUser | null> => {
      if (!supabase) return null;

      let user = authUser ?? null;
      if (!user) {
        const { data: auth } = await supabase.auth.getUser();
        user = auth.user;
      }
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        // Auth exists but profile row is missing / blocked — keep portal roles
        // from email/metadata so govt officers are not downgraded to individual.
        return fallbackUserFromAuth(user);
      }

      return profileToSessionUser(data as ProfileRow);
    },
    [supabase],
  );

  /*
   * localStorage cannot be read during render without breaking hydration, so
   * the first paint intentionally shows seed data and these effects correct it
   * once mounted. That is exactly the pattern set-state-in-effect flags.
   */
  /* eslint-disable react-hooks/set-state-in-effect */

  // Hydrate marketplace + local feedback drafts (these stay client-side).
  useEffect(() => {
    setProjectFeedback(readJson<UserProjectFeedback[]>(PROJECT_FEEDBACK_KEY) ?? []);
    setTenderBids(readBids());
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
  }, []);

  const hydrateBidsFromDb = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const res = await fetch("/api/tenders/bids");
      if (!res.ok) return;
      const data = (await res.json()) as {
        bids?: Array<Parameters<typeof dbBidToTenderBid>[0]>;
      };
      if (!data.bids?.length) return;
      const fromDb = data.bids.map(dbBidToTenderBid);
      const merged = mergeBids(fromDb, readBids());
      writeBids(merged);
      setTenderBids(merged);
    } catch {
      /* keep local bids */
    }
  }, []);

  // Establish who is signed in.
  // Use onAuthStateChange (incl. INITIAL_SESSION) so we never deadlock by
  // calling getUser() while the auth client is still locking for the listener.
  useEffect(() => {
    let active = true;

    if (!supabase) {
      setUser(readJson<SessionUser>(SESSION_KEY));
      setPending(readJson<PendingRegistration>(PENDING_KEY));
      setReady(true);
      return;
    }

    const applySession = async (authUser: AuthUser | null) => {
      try {
        if (!authUser) {
          if (!active) return;
          setUser(null);
          setPending(readJson<PendingRegistration>(PENDING_KEY));
          return;
        }
        const profile = await loadProfile(authUser);
        if (!active) return;
        setUser(profile);
        setPending(profile ? null : readJson<PendingRegistration>(PENDING_KEY));
        if (profile) void hydrateBidsFromDb();
      } catch {
        if (!active) return;
        setUser(authUser ? fallbackUserFromAuth(authUser) : null);
      } finally {
        if (active) setReady(true);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (!active) return;
        setUser(null);
        setReady(true);
        return;
      }
      void applySession(session?.user ?? null);
    });

    // Safety net: if auth never fires (rare), unlock the UI after 4s.
    const unlock = window.setTimeout(() => {
      if (active) setReady(true);
    }, 4000);

    return () => {
      active = false;
      window.clearTimeout(unlock);
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile, hydrateBidsFromDb]);

  /* eslint-enable react-hooks/set-state-in-effect */

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setUser(await loadProfile());
  }, [supabase, loadProfile]);

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

      if (!supabase) {
        setPending(record);
        writeJson(PENDING_KEY, record);
        setUser(null);
        removeKey(SESSION_KEY);
        return { user: null, needsKyc: true };
      }

      const { data: result, error } = await supabase.auth.signUp({
        email: record.email,
        password: data.password,
        options: {
          data: {
            full_name: record.name,
            phone: record.phone,
            state: record.state,
            role: record.role,
          },
        },
      });

      if (error) {
        return { user: null, needsKyc: false, error: friendlyAuthError(error.message) };
      }

      setPending(record);
      writeJson(PENDING_KEY, record);

      if (!result.session) {
        // Email confirmation is switched on for this project.
        return {
          user: null,
          needsKyc: false,
          error:
            "Check your inbox and confirm your email address, then sign in to finish verification.",
        };
      }

      const profile = await loadProfile();
      setUser(profile);
      return { user: profile, needsKyc: true };
    },
    [supabase, loadProfile],
  );

  const completeKyc = useCallback(
    async (extra?: Partial<SessionUser>): Promise<SessionUser | null> => {
      if (!supabase) {
        const source = pending;
        if (!source) return null;
        const next: SessionUser = {
          name: source.name,
          email: source.email,
          phone: source.phone,
          state: source.state,
          role: source.role,
          verified: true,
          accountStatus: "active",
          ...extra,
        };
        setUser(next);
        writeJson(SESSION_KEY, next);
        upsertUser(next);
        setPending(null);
        removeKey(PENDING_KEY);
        return next;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;

      const patch: Record<string, unknown> = {
        kyc_status: "verified",
        account_status: "active",
      };
      if (extra?.businessType) patch.business_type = extra.businessType;
      if (extra?.rcNumber) patch.cac_number = extra.rcNumber;
      if (pending?.name) patch.full_name = pending.name;
      if (pending?.phone) patch.phone = pending.phone;
      if (pending?.state) patch.state = pending.state;

      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", auth.user.id);
      if (error) return null;

      const next = await loadProfile();
      setUser(next);
      setPending(null);
      removeKey(PENDING_KEY);
      return next;
    },
    [supabase, pending, loadProfile],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();

      if (!supabase) {
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
        return { user: null, needsKyc: false, error: "No account found." };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) {
        return { user: null, needsKyc: false, error: friendlyAuthError(error.message) };
      }

      const profile = await loadProfile();
      setUser(profile);
      if (!profile) {
        return { user: null, needsKyc: false, error: "Could not load your profile." };
      }
      if (profile.accountStatus === "suspended") {
        await supabase.auth.signOut();
        setUser(null);
        return {
          user: null,
          needsKyc: false,
          error: "This account is suspended. Contact the portal administrator.",
        };
      }
      if (!profile.verified) {
        setPending({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          state: profile.state,
          role: profile.role === "business" ? "business" : "individual",
        });
      }
      return { user: profile, needsKyc: !profile.verified };
    },
    [supabase, loadProfile],
  );

  const signOut = useCallback(async () => {
    setUser(null);
    setPending(null);
    removeKey(SESSION_KEY);
    removeKey(PENDING_KEY);
    if (supabase) await supabase.auth.signOut();
  }, [supabase]);

  const updateUser = useCallback(
    (patch: Partial<SessionUser>) => {
      setUser((curr) => {
        if (!curr) return curr;
        const next = { ...curr, ...patch };
        if (!supabase) {
          writeJson(SESSION_KEY, next);
          upsertUser(next);
        }
        return next;
      });

      if (supabase && user?.id) {
        const row: Record<string, unknown> = {};
        if (patch.name !== undefined) row.full_name = patch.name;
        if (patch.phone !== undefined) row.phone = patch.phone;
        if (patch.state !== undefined) row.state = patch.state;
        if (patch.businessType !== undefined) row.business_type = patch.businessType;
        if (patch.rcNumber !== undefined) row.cac_number = patch.rcNumber;
        if (Object.keys(row).length) {
          void supabase.from("profiles").update(row).eq("id", user.id);
        }
      }
    },
    [supabase, user],
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

      if (supabase && user.id) {
        const { error } = await supabase.from("project_feedback").insert({
          project_id: input.projectId,
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          rating: input.rating,
          topic: entry.topic,
          body: entry.body,
        });
        if (error) return null;
      }

      persistFeedback([entry, ...projectFeedback]);
      return entry;
    },
    [user, supabase, projectFeedback, persistFeedback],
  );

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
