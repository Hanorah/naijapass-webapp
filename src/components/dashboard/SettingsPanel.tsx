"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Bell,
  Camera,
  Lock,
  LogOut,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import InitialsAvatar from "@/components/InitialsAvatar";
import { nigerianStates } from "@/data/states";
import {
  apiChangePassword,
  apiForgotPassword,
  isApiConfigured,
} from "@/lib/api/client";
import { readJson, writeJson } from "@/lib/session";
import { uploadBusinessImage } from "@/lib/storage/businessImage";

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
  const { user, saveProfile, signOut } = useSession();
  const [tab, setTab] = useState<"account" | "alerts" | "security">("account");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [state, setState] = useState(user?.state ?? "Lagos");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setState(user?.state ?? "Lagos");
    setAvatarUrl(user?.avatarUrl ?? "");
  }, [user]);

  useEffect(() => {
    const stored = readJson<Prefs>(SETTINGS_KEY);
    if (stored) setPrefs({ ...defaultPrefs, ...stored });
  }, []);

  const onAvatar = async (file: File | null) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const { url, error } = await uploadBusinessImage(user.id ?? user.email, file);
      if (error || !url) {
        toast.error(error ?? "Could not upload photo.");
        return;
      }
      const result = await saveProfile({ avatarUrl: url });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAvatarUrl(url);
      toast.success("Profile photo updated.");
    } finally {
      setUploading(false);
    }
  };

  const saveAccount = async (e: FormEvent) => {
    e.preventDefault();
    const result = await saveProfile({
      name: name.trim() || user?.name,
      phone,
      state,
      avatarUrl: avatarUrl || undefined,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account settings saved.");
  };

  const savePrefs = () => {
    writeJson(SETTINGS_KEY, prefs);
    toast.success("Notification preferences saved.");
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!isApiConfigured()) {
      toast.error("Connect the API to change your password.");
      return;
    }
    setPwdBusy(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setPwdBusy(false);
    }
  };

  const requestReset = async () => {
    if (!user?.email) return;
    if (!isApiConfigured()) {
      toast.error("Connect the API to send a reset email.");
      return;
    }
    try {
      await apiForgotPassword(user.email);
      toast.success("Password reset link sent if the account exists.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
    }
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
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-navy/10"
              />
            ) : (
              <InitialsAvatar name={name || user?.name || "User"} size={64} rounded="2xl" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy/20 px-4 py-3 text-sm font-semibold text-forest hover:bg-mist">
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

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
        <div className="max-w-xl space-y-6 rounded-[24px] bg-white p-6 ring-1 ring-navy/6 md:p-8">
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

          <form onSubmit={changePassword} className="space-y-3">
            <p className="text-sm font-semibold text-navy">Change password</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-2xl px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8)"
              className="w-full rounded-2xl px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-2xl px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
              required
            />
            <button type="submit" disabled={pwdBusy} className="btn btn-primary disabled:opacity-60">
              {pwdBusy ? "Updating…" : "Update password"}
            </button>
          </form>

          <button type="button" onClick={() => void requestReset()} className="btn btn-ghost">
            Email me a password reset link
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
