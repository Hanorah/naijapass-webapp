"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { initials, roleLabels } from "@/lib/session";

export default function ProfileView() {
  const { user, updateUser } = useSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [state, setState] = useState(user?.state ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setState(user?.state ?? "");
  }, [user]);

  const displayName = user?.name ?? "Guest";
  const role = user?.role ?? "individual";

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim() || displayName, phone, state });
    toast.success("Profile updated.");
    setEditing(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Your profile
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate md:text-[15px]">
          Identity, verification, and how you appear across the portal.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[28px] bg-navy p-7 text-white md:p-8">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest text-lg font-bold">
            {initials(displayName)}
          </span>
          <h2 className="mt-5 font-serif text-3xl tracking-tight">{displayName}</h2>
          <p className="mt-1 text-sm text-white/50">{roleLabels[role]}</p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-white/75">
              <Mail className="h-4 w-4 text-forest" />
              {user?.email ?? "—"}
            </p>
            <p className="flex items-center gap-2 text-white/75">
              <Phone className="h-4 w-4 text-forest" />
              {user?.phone || "No phone on file"}
            </p>
            <p className="flex items-center gap-2 text-white/75">
              <MapPin className="h-4 w-4 text-forest" />
              {user?.state || "State not set"}
            </p>
          </div>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-forest" />
            {user?.verified ? "Tier 1 verified" : "Verification pending"}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl tracking-tight">Details</h3>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="text-sm font-semibold text-forest"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {editing ? (
              <form onSubmit={onSave} className="mt-5 space-y-4">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Display name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Home state</span>
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </form>
            ) : (
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Role" value={roleLabels[role]} />
                <Field label="Email" value={user?.email ?? "—"} />
                <Field label="Phone" value={user?.phone || "—"} />
                <Field label="State" value={user?.state || "—"} />
                {user?.rcNumber && <Field label="RC number" value={user.rcNumber} />}
                {user?.businessType && (
                  <Field label="Business type" value={user.businessType} />
                )}
              </dl>
            )}
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={BadgeCheck} label="Status" value={user?.verified ? "Verified" : "Pending"} />
            <Stat icon={UserRound} label="Access" value={roleLabels[role]} />
            <Stat icon={Building2} label="Workspace" value={user?.state || "National"} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/settings" className="btn btn-primary">
              Open settings
            </Link>
            {!user?.verified ? (
              <Link href="/kyc" className="btn btn-ghost">
                Complete verification
              </Link>
            ) : (
              <Link href="/dashboard/help" className="btn btn-ghost">
                Help Center
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[20px] bg-white p-4 ring-1 ring-navy/6">
      <Icon className="h-4 w-4 text-forest" />
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </article>
  );
}
