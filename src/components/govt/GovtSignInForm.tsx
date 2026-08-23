"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  Landmark,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { nigerianStates } from "@/data/states";
import { safeReturnPath } from "@/lib/returnUrl";

/** "Cross River" → crossriver@govt.naijapass.ng */
export function govtEmailForState(state: string) {
  return `${state.toLowerCase().replace(/[\s-]/g, "")}@govt.naijapass.ng`;
}

export default function GovtSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { signIn, signOut, user, ready, live } = useSession();

  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // Already signed in as a state? Skip straight through.
  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "govt") router.replace(safeReturnPath(next, "/govt"));
  }, [ready, user, next, router]);

  // Picking a state fills in its official address, but it stays editable for
  // states that have been moved onto their own domain.
  const onPickState = (value: string) => {
    setState(value);
    if (value) setEmail(govtEmailForState(value));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your official email and password.");
      return;
    }

    setBusy(true);
    try {
      const result = await signIn(email, password);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (!result.user) {
        toast.error("No state account found for that email.");
        return;
      }
      if (result.user.role !== "govt" && result.user.role !== "admin") {
        await signOut();
        toast.error(
          "That is a citizen or business account. Use the main sign-in page.",
        );
        return;
      }

      toast.success(
        result.user.govtState
          ? `Signed in for ${result.user.govtState}.`
          : "Signed in.",
      );
      router.push(safeReturnPath(next, "/govt"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-full flex-1 bg-[#0b1220] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <section className="flex flex-col px-6 py-8 text-white sm:px-10 lg:px-14">
        <NaijaPassMark />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <Landmark className="h-3.5 w-3.5" />
            Restricted · State government
          </span>

          <h1 className="mt-5 font-serif text-[2.4rem] leading-[1.08] tracking-[-0.03em]">
            State Government Portal
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            For the 36 state governments and the FCT Administration. Publish
            projects, tenders and public notices for your state.
          </p>

          <form onSubmit={onSubmit} className="mt-8">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-white/90">
                Your state
              </span>
              <select
                value={state}
                onChange={(e) => onPickState(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-white/5 px-3.5 py-3.5 text-sm text-white outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
              >
                <option value="" className="bg-[#0e1628]">
                  Select your state…
                </option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s} className="bg-[#0e1628]">
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-semibold text-white/90">
                Official email
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="lagos@govt.naijapass.ng"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
                />
              </span>
            </label>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-semibold text-white/90">
                Password
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 py-3.5 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
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

            <button
              type="submit"
              disabled={busy}
              className="mt-7 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-[#04160e] transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Enter state portal"}
            </button>
          </form>

          <p className="mt-7 text-xs leading-relaxed text-white/40">
            State accounts are issued by the portal administrator — there is no
            self-registration here. Lost your credentials? Contact{" "}
            <a
              href="mailto:admin@naijapass.ng"
              className="font-semibold text-emerald-300"
            >
              admin@naijapass.ng
            </a>
            .
          </p>

          {!live ? (
            <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-200">
              Offline demo mode — no Supabase keys detected. Pick any state and
              use any password to preview the portal.
            </p>
          ) : null}

          <Link
            href="/signin"
            className="mt-8 text-sm font-semibold text-white/50 hover:text-white"
          >
            ← Citizen and business sign-in
          </Link>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-white/8 bg-[#0e1628] px-14 py-16 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute right-[-15%] top-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative max-w-md">
          <h2 className="font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-white">
            One portal. Thirty-seven governments.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/50">
            What you publish here appears immediately to citizens and
            businesses browsing your state — on the public project map, in the
            State Hub, and in procurement search.
          </p>

          <ul className="mt-10 space-y-5">
            <Capability
              icon={Building2}
              title="Publish your projects"
              body="Budget, contractor, LGA, status and completion — visible to every citizen the moment you publish."
            />
            <Capability
              icon={BadgeCheck}
              title="Post tenders and notices"
              body="Open procurement, executive orders, ministry contacts and emergency numbers for your state."
            />
            <Capability
              icon={ShieldCheck}
              title="Scoped to your state only"
              body="The database itself enforces that you can only read and write records for your own state."
            />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Capability({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Building2;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/45">{body}</p>
      </div>
    </li>
  );
}
