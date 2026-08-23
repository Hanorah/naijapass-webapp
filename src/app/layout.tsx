import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NaijaPass | Tenders, state hubs & verified firms",
    template: "%s | NaijaPass",
  },
  description:
    "Browse open government tenders, state MDA contacts, emergency numbers, and a verified business directory across Nigeria’s 36 states.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NaijaPass",
  },
  icons: {
    icon: [{ url: "/naijapass-logoo.png", type: "image/png" }],
    apple: [{ url: "/naijapass-logoo.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f9d6c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <PWARegister />
      </body>
    </html>
  );
}
