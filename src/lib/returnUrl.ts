/** Build auth links that return the user to a page after sign-in or sign-up. */
export function signInUrl(returnPath: string) {
  return `/signin?next=${encodeURIComponent(returnPath)}`;
}

export function signUpUrl(returnPath: string) {
  return `/signup?next=${encodeURIComponent(returnPath)}`;
}

export function registerUrl(role: "individual" | "business", returnPath: string) {
  return `/register?role=${role}&next=${encodeURIComponent(returnPath)}`;
}

export function kycUrl(returnPath: string) {
  return `/kyc?next=${encodeURIComponent(returnPath)}`;
}

/** State officials sign in here, never through /signin or /signup. */
export function govtSignInUrl(returnPath?: string) {
  return returnPath
    ? `/govt/signin?next=${encodeURIComponent(returnPath)}`
    : "/govt/signin";
}

export function safeReturnPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  try {
    const decoded = decodeURIComponent(next);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    /* ignore malformed */
  }
  return fallback;
}

/** Where a signed-in user should land by role. */
export function homeForRole(role: "individual" | "business" | "govt" | "admin") {
  if (role === "admin") return "/admin";
  if (role === "govt") return "/govt";
  return "/dashboard";
}

/** True when `role` is allowed to open `pathname`. Used by middleware and shells. */
export function canAccess(
  role: "individual" | "business" | "govt" | "admin",
  pathname: string,
) {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/govt")) return role === "govt" || role === "admin";
  if (pathname.startsWith("/dashboard")) return role !== "govt";
  return true;
}
