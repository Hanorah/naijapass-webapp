"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export const fieldClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-slate/50 outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/15";

export const selectClass = `${fieldClass} [&>option]:bg-white [&>option]:text-navy`;

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
        <h1 className="font-serif text-3xl tracking-[-0.02em] text-navy">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate">
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
      className={`rounded-2xl border border-navy/8 bg-white p-5 shadow-sm ${className}`}
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate/70">{hint}</span> : null}
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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-50"
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
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : "border-navy/12 text-navy/70 hover:bg-navy/[0.04] hover:text-navy";
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
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  slate: "border-navy/10 bg-navy/[0.04] text-navy/65",
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
    <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl tracking-[-0.02em] text-navy">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-slate">{sub}</p> : null}
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
    <div className="rounded-2xl border border-dashed border-navy/15 bg-navy/[0.02] px-6 py-12 text-center">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate">
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4 py-10 backdrop-blur-sm">
      <div
        className={`w-full rounded-2xl border border-navy/10 bg-white shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy/8 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate hover:bg-navy/[0.04] hover:text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Kept for import compatibility — never shown to officers. */
export function OfflineNotice() {
  return null;
}
