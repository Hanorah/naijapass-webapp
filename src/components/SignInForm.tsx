"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import NigeriaMap from "@/components/NigeriaMap";
import { useSession } from "@/components/SessionProvider";
import {
  homeForRole,
  kycUrl,
  safeReturnPath,
  signUpUrl,
} from "@/lib/returnUrl";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { signIn, signOut, live } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const result = await signIn(email, password);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.user?.role === "admin") {
        await signOut();
        toast.error("Admin accounts use the admin console sign-in.");
        router.push("/admin/signin");
        return;
      }
      if (result.user?.role === "govt") {
        // A state account wandered into the citizen sign-in; send it home.
        toast.success("Opening your state portal.");
        router.push("/govt");
        return;
      }
      if (result.needsKyc) {
        toast.success("Continue verification to open your portal.");
        router.push(kycUrl(safeReturnPath(next)));
        return;
      }
      if (result.user) {
        toast.success(`Signed in as ${result.user.role}.`);
        const home = homeForRole(result.user.role);
        router.push(next ? safeReturnPath(next, home) : home);
        return;
      }
      toast.error("No account found. Register as an individual or business first.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-full flex-1 bg-white lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-14">
        <NaijaPassMark />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <p className="eyebrow mb-4">Portal access</p>
          <h1 className="font-serif text-[2.45rem] leading-[1.08] tracking-[-0.03em] text-navy">
            Sign in to NaijaPass
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            Access your governance portal — projects, procurement, and verified
            directories.
          </p>

          <form onSubmit={onSubmit} className="mt-9">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy">
                Email address
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-navy/10 bg-white py-3.5 pl-10 pr-3 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
                />
              </span>
            </label>

            <label className="mt-5 block">
              <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-navy">
                Password
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Password reset link sent if the account exists.")
                  }
                  className="font-semibold text-forest"
                >
                  Forgot password?
                </button>
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-navy/10 bg-white py-3.5 pl-10 pr-11 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary mt-7 w-full rounded-2xl py-3.5 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-sm text-navy-muted">
            Don&apos;t have an account?{" "}
            <Link href={signUpUrl(safeReturnPath(next))} className="font-semibold text-forest">
              Request access
            </Link>
          </p>

          {!live ? (
            <p className="mt-5 text-xs leading-relaxed text-slate">
              Offline demo mode — no Supabase keys detected. See .env.example
              to connect a live database.
            </p>
          ) : null}
        </div>
      </section>

      <aside className="dark-canvas relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="aurora right-[-20%] top-[-10%] h-[420px] w-[420px] bg-forest/25" />
        <div className="relative mx-auto w-full max-w-lg">
          <p className="eyebrow text-forest">Governance portal</p>
          <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.03em] text-white">
            Your gateway to Nigeria&apos;s 36 states.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/55">
            Civic intelligence, verified directories, and transparent
            procurement — in one portal for businesses, agencies, and citizens.
          </p>
          <div className="mt-10">
            <NigeriaMap />
          </div>
        </div>
      </aside>
    </div>
  );
}
