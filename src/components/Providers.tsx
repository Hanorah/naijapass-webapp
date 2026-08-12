"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0a192f",
            color: "#fff",
            borderRadius: "12px",
            fontFamily: "var(--font-manrope)",
          },
          success: {
            iconTheme: { primary: "#ff6b35", secondary: "#fff" },
          },
        }}
      />
    </>
  );
}
