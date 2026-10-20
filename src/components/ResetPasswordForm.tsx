"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { apiResetPassword, isApiConfigured } from "@/lib/api/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset link is missing or invalid.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!isApiConfigured()) {
      toast.error("API is not configured.");
      return;
    }

    setBusy(true);
    try {
      await apiResetPassword(token, password);
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/signin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white px-4 py-8 sm:px-10">
      <NaijaPassMark />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <p className="eyebrow mb-4">Security</p>
        <h1 className="font-serif text-[clamp(2rem,7vw,2.45rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Choose a new password
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Enter a new password for your NaijaPass account. This link expires after one hour.
        </p>

        {!token ? (
          <p className="mt-8 rounded-2xl bg-mist/80 px-4 py-3 text-sm text-slate">
            This page needs a valid reset token from your email. Request a new link from sign-in.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-9 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">New password</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-navy/10 bg-white py-3.5 pl-10 pr-3 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
                  required
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-2xl border border-navy/10 bg-white px-3 py-3.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
                required
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full rounded-2xl py-3.5 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-navy-muted">
          <Link href="/signin" className="font-semibold text-forest">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
