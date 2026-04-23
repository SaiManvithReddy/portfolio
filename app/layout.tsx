import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { PROFILE } from "@/lib/profile";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.siteUrl),
  title: "Sai Manvith Reddy — Backend & Full-Stack Software Engineer",
  description:
    "Backend and full-stack engineer with 2+ years shipping Python, FastAPI, and ML systems at Evernorth Health Services and SnapMatePhoto. MS CS, University of Bridgeport. Open to full-time SWE roles.",
  openGraph: {
    type: "website",
    url: PROFILE.siteUrl,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="overflow-x-clip bg-[#121212]">
      <body
        className={`${inter.className} ${inter.variable} min-h-screen w-full min-w-0 max-w-full overflow-x-clip antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
