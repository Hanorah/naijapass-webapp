"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { safeReturnPath } from "@/lib/returnUrl";

const DEFAULT_ADMIN_EMAIL = "admin@naijapass.ng";

function normalizeAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized === "admin@naijapass.com") return DEFAULT_ADMIN_EMAIL;
  return normalized;
}

export default function AdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { signIn, signOut, user, ready, live } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "admin") {
      router.replace(safeReturnPath(next, "/admin"));
    }
  }, [ready, user, next, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Enter your admin email and password.");
      return;
    }

    const loginEmail = normalizeAdminEmail(email);
    if (loginEmail !== email.trim().toLowerCase()) {
      setEmail(loginEmail);
    }

    setBusy(true);
    try {
      const result = await Promise.race([
        signIn(loginEmail, password),
        new Promise<never>((_, reject) =>
          window.setTimeout(
            () =>
              reject(
                new Error(
                  "Sign-in timed out. Check your network, then confirm the API is running at NEXT_PUBLIC_API_URL.",
                ),
              ),
            15000,
          ),
        ),
      ]);

      if (result.error) {
        const message =
          result.error === "Email or password is incorrect."
            ? "Email or password is incorrect. Use admin@naijapass.ng / AdminPass123! (run npm run db:seed in naijapass-api to reset)."
            : result.error;
        setFormError(message);
        toast.error(message);
        return;
      }
      if (!result.user) {
        setFormError("No account found for that email.");
        return;
      }
      if (result.user.role !== "admin") {
        await signOut();
        if (result.user.role === "govt") {
          setFormError("That is a state government account. Use /govt/signin instead.");
          return;
        }
        setFormError(
          "Signed in, but this account does not have the admin role.",
        );
        return;
      }

      toast.success("Welcome back.");
      window.location.assign(safeReturnPath(next, "/admin"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#120a1a] px-6 py-12 text-white">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <NaijaPassMark />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-200">
            <Shield className="h-3.5 w-3.5" />
            Admin sign-in
          </span>

          <h1 className="mt-4 font-serif text-3xl tracking-[-0.03em]">Admin Console</h1>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-white/90">
                Email
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                  }}
                  autoComplete="username"
                  placeholder={DEFAULT_ADMIN_EMAIL}
                  className="w-full rounded-2xl border border-white/12 bg-white/5 py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/15"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-white/90">
                Password
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError(null);
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 py-3.5 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/15"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {formError ? (
              <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-xs leading-relaxed text-red-200">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-violet-500 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {!live ? (
            <p className="mt-5 text-xs leading-relaxed text-amber-200/90">
              Offline demo — use <strong>{DEFAULT_ADMIN_EMAIL}</strong> with any password.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link href="/" className="font-semibold text-white/60 hover:text-white">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
