import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
