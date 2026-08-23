import type { Metadata } from "next";
import GovtShell from "@/components/govt/GovtShell";

export const metadata: Metadata = {
  title: "State Portal — NaijaPass",
  robots: { index: false, follow: false },
};

export default function GovtPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GovtShell>{children}</GovtShell>;
}
