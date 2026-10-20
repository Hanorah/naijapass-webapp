import type { SessionUser } from "@/lib/session";

const TOKEN_KEY = "naijapass.token";

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  /** Skip Authorization header */
  anonymous?: boolean;
};

/** Call the Express API at NEXT_PUBLIC_API_URL. */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(500, "NEXT_PUBLIC_API_URL is not set.");
  }

  const headers = new Headers(options.headers);
  // FormData needs the browser to set the multipart boundary itself.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (!options.anonymous) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

export async function apiLogin(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    anonymous: true,
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  state?: string;
  role?: "individual" | "business";
  businessName?: string;
  businessType?: string;
  cacNumber?: string;
}) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    anonymous: true,
    body: JSON.stringify(input),
  });
}

export async function apiMe() {
  return apiFetch<{ user: SessionUser }>("/api/auth/me");
}

export type UpdateMeInput = {
  fullName?: string;
  phone?: string;
  state?: string;
  department?: string;
  officeTitle?: string;
  businessType?: string;
  businessName?: string;
  avatarUrl?: string;
};

/** PATCH /api/auth/me. Returns the refreshed session user when the API sends one. */
export async function apiUpdateMe(input: UpdateMeInput) {
  return apiFetch<{ user?: SessionUser }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function apiChangePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ ok?: boolean }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function apiForgotPassword(email: string) {
  return apiFetch<{ ok?: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    anonymous: true,
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token: string, newPassword: string) {
  return apiFetch<{ ok?: boolean }>("/api/auth/reset-password", {
    method: "POST",
    anonymous: true,
    body: JSON.stringify({ token, newPassword }),
  });
}

export type ApiListing = {
  id: string;
  seller_id: string | null;
  business_id: string | null;
  title: string;
  category: string;
  state: string;
  lga: string | null;
  price: number | null;
  currency: string;
  description: string | null;
  status: string;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function apiListListings(params?: { state?: string; all?: boolean }) {
  const q = new URLSearchParams();
  if (params?.state) q.set("state", params.state);
  if (params?.all) q.set("all", "1");
  const suffix = q.toString() ? `?${q}` : "";
  return apiFetch<{ listings: ApiListing[] }>(`/api/listings${suffix}`, {
    anonymous: true,
  });
}

export async function apiCreateListing(input: {
  title: string;
  category: string;
  state: string;
  lga?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  status?: "pending" | "live" | "hidden";
}) {
  return apiFetch<{ listing: ApiListing }>("/api/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiSetListingStatus(
  id: string,
  status: "pending" | "live" | "hidden" | "sold" | "expired",
) {
  return apiFetch<{ listing: ApiListing }>(`/api/listings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
