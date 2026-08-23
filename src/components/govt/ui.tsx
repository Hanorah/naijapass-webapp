"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export const fieldClass =
  "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15";

export const selectClass = `${fieldClass} [&>option]:bg-[#0e1628]`;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl tracking-[-0.02em] text-white">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/50">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#0e1628] p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-white/35">{hint}</span> : null}
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#04160e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  tone = "default",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  type?: "button" | "submit";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-400/25 text-red-300 hover:bg-red-400/10"
      : "border-white/12 text-white/70 hover:bg-white/5 hover:text-white";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

const toneStyles: Record<string, string> = {
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  red: "border-red-400/25 bg-red-400/10 text-red-300",
  blue: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  slate: "border-white/12 bg-white/5 text-white/60",
};

export function Pill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1628] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl tracking-[-0.02em] text-white">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-white/40">{sub}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-12 text-center">
      <p className="text-sm font-semibold text-white/80">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-white/40">
        {body}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-sm">
      <div
        className={`w-full rounded-2xl border border-white/12 bg-[#0e1628] shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Shown when the portal is running without a Supabase connection. */
export function OfflineNotice() {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
      <p className="text-sm font-semibold text-amber-200">
        Not connected to a database
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-200/70">
        You are previewing the portal with bundled sample data. Anything you
        publish here will not be saved. Add your Supabase keys to{" "}
        <code className="rounded bg-black/25 px-1">.env.local</code> and run the
        SQL in <code className="rounded bg-black/25 px-1">supabase/</code> — see
        .env.example.
      </p>
    </div>
  );
}
