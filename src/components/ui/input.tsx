import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-navy/10 bg-[#f4f6f8] px-3 py-2 text-sm text-navy outline-none transition placeholder:text-slate/70 focus:border-forest/40 focus:bg-white focus:ring-2 focus:ring-forest/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
