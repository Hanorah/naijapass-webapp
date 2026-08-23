"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AUTH_ROUTES = ["/signin", "/signup", "/register", "/kyc"];
const PORTAL_ROUTES = ["/dashboard", "/admin", "/govt"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.includes(pathname);
  const isPortal = PORTAL_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuth || isPortal) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
