"use client";

import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#05080b",
            color: "#fff",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "var(--font-manrope)",
          },
          success: {
            iconTheme: { primary: "#0f9d6c", secondary: "#fff" },
          },
        }}
      />
    </SessionProvider>
  );
}
