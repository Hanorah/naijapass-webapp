export const ROLES = ["individual", "business", "govt", "admin"] as const;
export type Role = (typeof ROLES)[number];
export type SignupRole = "individual" | "business";

export type PendingRegistration = {
  name: string;
  email: string;
  phone: string;
  state: string;
  role: SignupRole;
};

export type SessionUser = {
  /** Supabase auth user id. Absent only in offline demo mode. */
  id?: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  role: Role;
  verified: boolean;
  businessType?: string;
  rcNumber?: string;
  /** For role === "govt": the single state this account may publish for. */
  govtState?: string;
  department?: string;
  officeTitle?: string;
  accountStatus?: "pending" | "active" | "suspended" | "rejected";
};

/** A row of public.profiles, as returned by Supabase. */
export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  account_status: string;
  state: string | null;
  lga: string | null;
  kyc_status: string;
  business_name: string | null;
  business_type: string | null;
  cac_number: string | null;
  govt_state: string | null;
  department: string | null;
  office_title: string | null;
};

export const PROFILE_COLUMNS =
  "id, email, full_name, phone, role, account_status, state, lga, kyc_status, business_name, business_type, cac_number, govt_state, department, office_title";

function toRole(value: string): Role {
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : "individual";
}

export function profileToSessionUser(profile: ProfileRow): SessionUser {
  const role = toRole(profile.role);
  return {
    id: profile.id,
    name: profile.full_name ?? profile.email?.split("@")[0] ?? "NaijaPass user",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    state: profile.govt_state ?? profile.state ?? "",
    role,
    // Government and admin accounts are provisioned, so they are verified by
    // definition; citizens and businesses must clear KYC first.
    verified:
      role === "govt" || role === "admin"
        ? profile.account_status === "active"
        : profile.kyc_status === "verified",
    businessType: profile.business_type ?? undefined,
    rcNumber: profile.cac_number ?? undefined,
    govtState: profile.govt_state ?? undefined,
    department: profile.department ?? undefined,
    officeTitle: profile.office_title ?? undefined,
    accountStatus: profile.account_status as SessionUser["accountStatus"],
  };
}

export const SESSION_KEY = "naijapass.session";
export const PENDING_KEY = "naijapass.pending";
export const LISTINGS_KEY = "naijapass.listings";
export const USERS_KEY = "naijapass.users";
export const SIGNUP_ROLE_KEY = "naijapass.signupRole";
export const PROJECT_FEEDBACK_KEY = "naijapass.projectFeedback";

export type UserProjectFeedback = {
  id: string;
  projectId: string;
  userEmail: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  topic: string;
  body: string;
  createdAt: string;
};

export type SubmitProjectFeedbackInput = {
  projectId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  topic: string;
  body: string;
};

export function isSignupRole(value: unknown): value is SignupRole {
  return value === "individual" || value === "business";
}

export const roleLabels: Record<Role, string> = {
  individual: "Individual",
  business: "Business",
  govt: "Government",
  admin: "Admin",
};

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NP";
  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

/**
 * Offline demo accounts. Only reachable when Supabase is not configured, so
 * the UI stays explorable before anyone has created a database.
 */
export function demoUserForEmail(email: string): SessionUser | null {
  const normalized = email.trim().toLowerCase();
  if (normalized === "admin@naijapass.ng") {
    return {
      name: "Portal Admin",
      email: normalized,
      phone: "+234 800 000 0001",
      state: "FCT",
      role: "admin",
      verified: true,
      accountStatus: "active",
    };
  }
  const govtMatch = /^([a-z]+)@govt\.naijapass\.ng$/.exec(normalized);
  if (govtMatch || normalized === "govt@naijapass.ng") {
    const slug = govtMatch?.[1] ?? "fct";
    const state = demoStateForSlug(slug);
    return {
      name: state === "FCT" ? "Federal Capital Territory Administration" : `${state} State Government`,
      email: normalized,
      phone: "+234 800 000 0002",
      state,
      role: "govt",
      verified: true,
      govtState: state,
      department: "Office of the Secretary to the State Government",
      accountStatus: "active",
    };
  }
  return null;
}

/** Maps "crossriver" back to "Cross River" for the offline demo logins. */
function demoStateForSlug(slug: string): string {
  const known = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
  ];
  const normalized = slug.toLowerCase().replace(/[\s-]/g, "");
  return (
    known.find((s) => s.toLowerCase().replace(/[\s-]/g, "") === normalized) ?? "FCT"
  );
}

export function readUsers(): SessionUser[] {
  return readJson<SessionUser[]>(USERS_KEY) ?? [];
}

export function upsertUser(user: SessionUser) {
  const users = readUsers().filter(
    (item) => item.email.toLowerCase() !== user.email.toLowerCase(),
  );
  writeJson(USERS_KEY, [user, ...users]);
}

export function findStoredUser(email: string): SessionUser | null {
  const normalized = email.trim().toLowerCase();
  return (
    readUsers().find((item) => item.email.toLowerCase() === normalized) ?? null
  );
}
