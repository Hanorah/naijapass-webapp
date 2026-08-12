import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edo Bid | Unified Gateway to Nigeria's 36 States",
  description:
    "Partner with government projects across Nigeria. Market intelligence, verified directories, and procurement opportunities in one portal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-foreground bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
