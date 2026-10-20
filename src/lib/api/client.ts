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
