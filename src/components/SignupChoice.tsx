"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, Check, UserRound } from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { SIGNUP_ROLE_KEY, isSignupRole, writeJson, type SignupRole } from "@/lib/session";

export default function SignupChoice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preset = searchParams.get("role");
  const [role, setRole] = useState<SignupRole>(
    isSignupRole(preset) ? preset : "individual",
  );

  useEffect(() => {
    if (isSignupRole(preset)) setRole(preset);
  }, [preset]);

  const continueToRegister = (next = role) => {
    writeJson(SIGNUP_ROLE_KEY, next);
    router.push(`/register?role=${next}`);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white px-5 py-10 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <NaijaPassMark />
        <p className="eyebrow mb-4 mt-10">Create account</p>
        <h1 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Join the civic layer.
        </h1>
        <p className="mt-3 max-w-xl text-slate">
          Choose how you want to join. Complete registration next, then verify
          your identity before entering the portal.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <TypeCard
            selected={role === "individual"}
            icon={UserRound}
            title="Individual"
            body="View businesses, track projects, and engage as a citizen."
            onSelect={() => setRole("individual")}
          />
          <TypeCard
            selected={role === "business"}
            icon={Building2}
            title="Business"
            body="Register your company, join the verified directory, and bid for government contracts."
            onSelect={() => setRole("business")}
          />
        </div>

        <button
          type="button"
          onClick={() => continueToRegister()}
          className="btn btn-primary mt-8 w-full md:w-auto"
        >
          Continue as {role === "business" ? "Business" : "Individual"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-6 text-sm text-slate">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-forest">
            Sign in to portal
          </Link>
        </p>
      </div>
    </div>
  );
}

function TypeCard({
  selected,
  icon: Icon,
  title,
  body,
  onSelect,
}: {
  selected: boolean;
  icon: typeof UserRound;
  title: string;
  body: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-[24px] p-6 text-left transition ${
        selected
          ? "bg-white ring-2 ring-forest"
          : "bg-white/70 ring-1 ring-navy/8 hover:bg-white"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
          selected ? "bg-forest/12 text-forest" : "bg-mist text-navy"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-serif text-2xl tracking-tight text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
    </button>
  );
}
