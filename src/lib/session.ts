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
  name: string;
  email: string;
  phone: string;
  state: string;
  role: Role;
  verified: boolean;
  businessType?: string;
  rcNumber?: string;
};

export const SESSION_KEY = "naijapass.session";
export const PENDING_KEY = "naijapass.pending";
export const LISTINGS_KEY = "naijapass.listings";
export const USERS_KEY = "naijapass.users";
export const SIGNUP_ROLE_KEY = "naijapass.signupRole";

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
    };
  }
  if (normalized === "govt@naijapass.ng") {
    return {
      name: "FCT Secretariat",
      email: normalized,
      phone: "+234 800 000 0002",
      state: "FCT",
      role: "govt",
      verified: true,
    };
  }
  return null;
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
