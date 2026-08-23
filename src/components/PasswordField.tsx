"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
};

export default function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  className = "",
  inputClassName = "auth-input",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <span className={`relative block ${className}`}>
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClassName} pr-11`}
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
  );
}
