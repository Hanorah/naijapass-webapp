"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { apiChangePassword } from "@/lib/api/client";
import {
  Field,
  GhostButton,
  OfflineNotice,
  PageHeader,
  Panel,
  Pill,
  PrimaryButton,
  fieldClass,
} from "@/components/govt/ui";


export default function GovtSettings() {
  const { user, live, saveProfile } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const [officeName, setOfficeName] = useState(user?.name ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in first.");
      return;
    }

    setSavingProfile(true);
    try {
      const result = await saveProfile({
        name: officeName.trim(),
        department: department.trim() || undefined,
        phone: phone.trim(),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Office details updated.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Enter your current password.");
      return;
    }
    if (password.length < 10) {
      toast.error("Use at least 10 characters for a government account.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords do not match.");
      return;
    }

    if (!live) {
      toast.error("Connect to the API to change your password.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiChangePassword(currentPassword, password);
      toast.success("Password updated.");
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };
  return (
    <div className="space-y-6">
      {!live ? <OfflineNotice /> : null}

      <PageHeader
        title="Settings"
        description="Your office details and sign-in credentials."
      />

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-navy">
              Account
            </h2>
            <p className="mt-1 text-sm text-slate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="green">
              <ShieldCheck className="h-3 w-3" />
              Government
            </Pill>
            <Pill tone="blue">{state}</Pill>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-navy/8 bg-navy/[0.02] p-3 text-xs leading-relaxed text-slate">
          This account is permanently scoped to {state}. The database rejects
          any attempt to publish for another state, so a mistake here cannot
          affect another government. Only the portal administrator can change
          the scope or issue a replacement account.
        </p>
      </Panel>

      <Panel>
        <h2 className="font-display text-base font-bold text-navy">
          Office details
        </h2>
        <p className="mt-1 text-sm text-slate">
          Shown to citizens next to the projects and notices you publish.
        </p>

        <form onSubmit={onSaveProfile} className="mt-5 space-y-4">
          <Field label="Office name">
            <input
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              placeholder={`${state} State Government`}
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Department">
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Office of the Secretary to the State Government"
                className={fieldClass}
              />
            </Field>
            <Field label="Public phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <PrimaryButton type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save details"}
            </PrimaryButton>
          </div>
        </form>
      </Panel>

      <Panel>
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
          <KeyRound className="h-4 w-4 text-forest" />
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate">
          Change the password you were issued the first time you sign in.
        </p>

        <form onSubmit={onChangePassword} className="mt-5 space-y-4">
          <Field label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" hint="At least 10 characters.">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={fieldClass}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3">
            <GhostButton
              onClick={() => {
                setCurrentPassword("");
                setPassword("");
                setConfirm("");
              }}
            >
              Clear
            </GhostButton>
            <PrimaryButton type="submit" disabled={savingPassword}>
              <Lock className="h-4 w-4" />
              {savingPassword ? "Updating…" : "Update password"}
            </PrimaryButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
