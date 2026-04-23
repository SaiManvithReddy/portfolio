"use client";

import { Projects } from "@/components/Projects";
import { ScrollyStage } from "@/components/ScrollyStage";
import { PROFILE } from "@/lib/profile";

export function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-[#121212] text-zinc-100">
      <ScrollyStage />
      <Projects />

      <footer className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {PROFILE.name}. {PROFILE.location}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="text-zinc-300/90 underline-offset-4 hover:text-white hover:underline"
              href={`mailto:${PROFILE.email}`}
            >
              {PROFILE.email}
            </a>
            <a
              className="text-zinc-300/90 underline-offset-4 hover:text-white hover:underline"
              href={PROFILE.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
