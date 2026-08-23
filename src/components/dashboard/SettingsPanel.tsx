"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, SlidersHorizontal, UserRound } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { nigerianStates } from "@/data/states";
import { readJson, writeJson } from "@/lib/session";

const SETTINGS_KEY = "naijapass.settings";

type Prefs = {
  tenderAlerts: boolean;
  weeklyBriefing: boolean;
  emergencyAlerts: boolean;
  marketplaceUpdates: boolean;
};

const defaultPrefs: Prefs = {
  tenderAlerts: true,
  weeklyBriefing: true,
  emergencyAlerts: true,
  marketplaceUpdates: false,
};

export default function SettingsPanel() {
  const router = useRouter();
  const { user, updateUser, signOut } = useSession();
  const [tab, setTab] = useState<"account" | "alerts" | "security">("account");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [state, setState] = useState(user?.state ?? "Lagos");
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setState(user?.state ?? "Lagos");
  }, [user]);

  useEffect(() => {
    const stored = readJson<Prefs>(SETTINGS_KEY);
    if (stored) setPrefs({ ...defaultPrefs, ...stored });
  }, []);

  const saveAccount = (e: FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim() || user?.name, phone, state });
    toast.success("Account settings saved.");
  };

  const savePrefs = () => {
    writeJson(SETTINGS_KEY, prefs);
    toast.success("Notification preferences saved.");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate md:text-[15px]">
          Control your identity, alerts, and how the portal talks to you.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["account", "Account", UserRound],
            ["alerts", "Notifications", Bell],
            ["security", "Security", Lock],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === id
                ? "bg-navy text-white"
                : "bg-white text-navy ring-1 ring-navy/8 hover:ring-forest/25"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <form
          onSubmit={saveAccount}
          className="max-w-xl space-y-4 rounded-[24px] bg-white p-6 ring-1 ring-navy/6 md:p-8"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Email</span>
            <input
              value={user?.email ?? ""}
              readOnly
              className="w-full rounded-2xl bg-mist/70 px-3 py-2.5 text-slate outline-none ring-1 ring-navy/8"
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
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
            >
              {nigerianStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">
            Save account
          </button>
        </form>
      )}

      {tab === "alerts" && (
        <div className="max-w-xl space-y-3 rounded-[24px] bg-white p-6 ring-1 ring-navy/6 md:p-8">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            <SlidersHorizontal className="h-4 w-4 text-forest" />
            Briefing preferences
          </p>
          {(
            [
              ["tenderAlerts", "Tender closing alerts"],
              ["weeklyBriefing", "Weekly market briefing"],
              ["emergencyAlerts", "Emergency and safety alerts"],
              ["marketplaceUpdates", "Marketplace listing updates"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-2xl bg-mist/80 px-4 py-3 text-sm"
            >
              <span className="font-medium">{label}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) =>
                  setPrefs((curr) => ({ ...curr, [key]: e.target.checked }))
                }
                className="h-4 w-4 accent-[#0f9d6c]"
              />
            </label>
          ))}
          <button type="button" onClick={savePrefs} className="btn btn-primary mt-2">
            Save notifications
          </button>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-xl space-y-4 rounded-[24px] bg-white p-6 ring-1 ring-navy/6 md:p-8">
          <p className="text-sm leading-relaxed text-slate">
            Manage verification and access on this device. Password reset is
            simulated for the demo portal.
          </p>
          {!user?.verified && (
            <button
              type="button"
              onClick={() => router.push("/kyc")}
              className="btn btn-primary"
            >
              Complete KYC verification
            </button>
          )}
          {user?.verified && (
            <p className="rounded-2xl bg-[#f4f6f8] px-4 py-3 text-sm text-slate">
              Your account is verified. You can bid, list, and access Tier 1
              portal features.
            </p>
          )}
          <button
            type="button"
            onClick={() => toast.success("Password reset link sent if the account exists.")}
            className="btn btn-ghost"
          >
            Send password reset
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/signin");
            }}
            className="flex items-center gap-2 text-sm font-semibold text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out of NaijaPass
          </button>
        </div>
      )}
    </div>
  );
}
