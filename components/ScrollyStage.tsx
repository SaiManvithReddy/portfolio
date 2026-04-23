"use client";

import { useScroll } from "framer-motion";
import { useRef, useState } from "react";

import { Overlay } from "@/components/Overlay";
import { ScrollyImageSequence } from "@/components/ScrollyImageSequence";
import { SiteHeader } from "@/components/SiteHeader";
import { FIRST_FRAME_PATH, FRAME_COUNT } from "@/lib/sequence";

export function ScrollyStage() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: scrollerRef,
    offset: ["start start", "end end"],
    trackContentSize: true,
  });

  const [preload, setPreload] = useState<{ done: boolean; loaded: number; total: number }>({
    done: false,
    loaded: 0,
    total: FRAME_COUNT,
  });

  return (
    <section
      id="scrolly"
      ref={scrollerRef}
      className="relative h-[500vh] overflow-x-clip bg-[#121212] text-zinc-100"
    >
      <div className="sticky top-0 h-screen w-full">
        <ScrollyImageSequence
          className="absolute inset-0 z-0 overflow-hidden"
          scrollYProgress={scrollYProgress}
          onPreloadState={setPreload}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55"
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40 mix-blend-screen" aria-hidden="true" />

        <div className="absolute inset-0 z-20">
          <SiteHeader />
        </div>

        <div className="absolute inset-0 z-10">
          <Overlay scrollYProgress={scrollYProgress} />
        </div>

        {preload.done && preload.loaded === 0 && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
            <div className="max-w-md rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-4 text-left text-sm text-zinc-200 shadow-2xl backdrop-blur">
              <p className="font-medium text-amber-200/95">Scrolly frames not loading in the page (0 / {FRAME_COUNT} in cache)</p>
              <p className="mt-2 text-zinc-400">
                Browsers need static files at{" "}
                <code className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-amber-100/90">{FIRST_FRAME_PATH}</code>{" "}
                (and the rest in <code className="text-xs">public/sequence</code>).
              </p>
              <p className="mt-3 text-zinc-400">
                <span className="text-zinc-200">On Vercel, this is almost always:</span> the repo GitHub used for deploy
                does not include <code className="text-xs">public/sequence</code> (or the project{" "}
                <strong>Root Directory</strong> in Vercel is not the folder that contains <code className="text-xs">public/</code>).
              </p>
              <p className="mt-2 text-zinc-500">
                Fix: in your project run{" "}
                <code className="rounded bg-black/50 px-1.5 py-0.5 text-xs">{`git add public/sequence && git commit -m "Add frames" && git push`}</code>{" "}
                on <code className="text-xs">main</code>, then redeploy. Or open the URL above in a new tab — if you get
                404, the build never shipped those files.
              </p>
            </div>
          </div>
        )}

        {!preload.done && (
          <div className="pointer-events-none absolute bottom-6 left-6 z-30 text-xs text-zinc-400/90">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-200" />
              Warming the frames
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-6 right-6 z-30 text-xs text-zinc-400/90">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur">
            Scroll
            <span className="text-zinc-200">to scrub</span>
          </div>
        </div>
      </div>
    </section>
  );
}
