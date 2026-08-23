"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  UserRound,
  Wrench,
} from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { nigerianStates } from "@/data/states";
import {
  SIGNUP_ROLE_KEY,
  isSignupRole,
  readJson,
  writeJson,
  type SignupRole,
} from "@/lib/session";
import { kycUrl, safeReturnPath } from "@/lib/returnUrl";

export default function RegisterPage() {
  const router = useRouter();
  const { startRegistration } = useSession();
  const [role, setRole] = useState<SignupRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [returnPath, setReturnPath] = useState("/dashboard");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnPath(safeReturnPath(params.get("next")));
    const fromQuery = params.get("role");
    const stored = readJson<SignupRole>(SIGNUP_ROLE_KEY);
    const next = isSignupRole(fromQuery) ? fromQuery : stored;
    if (!isSignupRole(next)) {
      router.replace("/signup");
      return;
    }
    writeJson(SIGNUP_ROLE_KEY, next);
    setRole(next);
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) {
      router.replace("/signup");
      return;
    }
    if (!name || !email || !phone || !state || !password) {
      toast.error("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Use a password of at least 8 characters.");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }

    setBusy(true);
    try {
      const result = await startRegistration({
        name,
        email: email.trim().toLowerCase(),
        phone,
        state,
        role,
        password,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        role === "business"
          ? "Business account created. Complete corporate verification next."
          : "Account created. Complete verification to continue.",
      );
      router.push(kycUrl(returnPath));
    } finally {
      setBusy(false);
    }
  };

  if (!role) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
        Loading registration…
      </div>
    );
  }

  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="flex flex-col bg-white px-6 py-8 sm:px-10 lg:px-14">
        <NaijaPassMark />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <p className="eyebrow mb-4">Registration</p>
          <h1 className="font-serif text-[2.35rem] leading-[1.08] tracking-[-0.03em] text-navy">
            {role === "business" ? "Register your business" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            {role === "business"
              ? "Enter your company details, then complete CAC and tax verification."
              : "Enter your details, then complete identity verification to enter the portal."}
          </p>
          <p className="mt-4 text-sm font-medium text-navy">
            Signing up as {role === "business" ? "a business" : "an individual"}.{" "}
            <Link href="/signup" className="font-semibold text-orange">
              Change
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label={role === "business" ? "Business Name" : "Full Name"}>
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  role === "business"
                    ? "e.g. Apex Construction Ltd"
                    : "e.g. Chukwudi Okafor"
                }
                className="auth-input"
              />
            </Field>

            <Field label={role === "business" ? "Business Email" : "Email Address"}>
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="auth-input"
              />
            </Field>

            <Field label="Phone Number">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="auth-input"
              />
            </Field>

            <Field label="Primary State of Operation">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="auth-input appearance-none pr-9"
              >
                <option value="">Select your primary state...</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            </Field>
            <p className="flex items-start gap-1.5 text-xs text-slate">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" />
              {role === "business"
                ? "After signup you’ll upload CAC and tax documents, then you can join the verified directory."
                : "After signup you’ll verify your identity with a valid ID and NIN."}
            </p>

            <Field label="Password">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="auth-input"
              />
            </Field>

            <label className="flex items-start gap-2.5 pt-1 text-sm text-navy-muted">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-orange"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-orange">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-orange">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange py-3.5 text-sm font-semibold text-white transition hover:bg-orange-hover disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-orange">
              Sign in to portal
            </Link>
          </p>
        </div>
      </section>

      <aside className="dark-canvas relative hidden overflow-hidden px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(0,135,81,0.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_40%)]" />

        <div className="relative">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest/30 text-white">
            <Wrench className="h-5 w-5" />
          </span>
          <h2 className="mt-8 max-w-lg font-serif text-4xl leading-[1.08] tracking-[-0.03em] xl:text-5xl">
            Building transparency, one bid at a time.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
            Join thousands of certified contractors and government officials on
            NaijaPass. Access real-time procurement data, track project
            execution, and participate in a fair, open portal designed for
            modern Nigerian governance.
          </p>
        </div>

        <div className="relative mt-12 grid grid-cols-2 gap-4">
          <article className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange text-white">
              <Settings className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-display font-bold">Localized Alerts</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Get instant notifications for new tenders specifically in your
              registered state of operation.
            </p>
          </article>
          <article className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange text-white">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-display font-bold">Verified Ecosystem</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Engage with thoroughly vetted contractors and legitimate
              institutional bodies.
            </p>
          </article>
        </div>
      </aside>

    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <span className="relative block">{children}</span>
    </label>
  );
}
