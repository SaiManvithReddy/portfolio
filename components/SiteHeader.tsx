"use client";

import Link from "next/link";

import { PROFILE } from "@/lib/profile";

const nav = [
  { href: "#work", label: "Work", external: false as const },
  { href: "#scrolly", label: "Intro", external: false as const },
  { href: PROFILE.linkedin, label: "LinkedIn", external: true as const, newTab: true as const },
  { href: `mailto:${PROFILE.email}`, label: "Email", external: true as const, newTab: false as const },
] as const;

export function SiteHeader() {
  return (
    <header className="pointer-events-auto w-full p-5 sm:p-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="#top"
          className="group inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-100 shadow-glass backdrop-blur transition hover:border-white/20"
        >
          <span className="font-semibold tracking-[-0.02em]">{PROFILE.monogram}</span>
          <span className="text-xs tracking-[0.18em] text-zinc-400/90">ENGINEER</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                {...(item.newTab ? { target: "_blank", rel: "noreferrer" } : {})}
                className="rounded-full px-3 py-2 text-sm text-zinc-300/90 transition hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm text-zinc-300/90 transition hover:text-white"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#work"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/0 px-4 py-2 text-sm font-medium text-zinc-100 shadow-glass transition hover:shadow-glow"
          >
            <span className="relative z-10">View work</span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-fuchsia-500/10 to-emerald-400/0 opacity-0 transition group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </header>
  );
}
