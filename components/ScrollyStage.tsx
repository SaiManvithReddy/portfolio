"use client";

import { useScroll } from "framer-motion";
import { useRef, useState } from "react";

import { Overlay } from "@/components/Overlay";
import { ScrollyCanvas } from "@/components/ScrollyCanvas";
import { SiteHeader } from "@/components/SiteHeader";

export function ScrollyStage() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: scrollerRef,
    offset: ["start start", "end end"],
  });

  const [sequenceReady, setSequenceReady] = useState(false);

  return (
    <section
      id="scrolly"
      ref={scrollerRef}
      className="relative h-[500vh] bg-[#121212] text-zinc-100"
    >
      <div ref={stageRef} className="sticky top-0 h-screen w-full">
        <ScrollyCanvas
          className="absolute inset-0"
          sizeRef={stageRef}
          scrollYProgress={scrollYProgress}
          onSequenceReadyChange={setSequenceReady}
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

        {!sequenceReady && (
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
