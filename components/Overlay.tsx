"use client";

import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useMemo } from "react";

import { PROFILE } from "@/lib/profile";

type Props = {
  scrollYProgress: MotionValue<number>;
  className?: string;
};

function useSoftenedProgress(mv: MotionValue<number>) {
  // Slightly eases the scroll mapping without lagging too far behind fast scrolls
  return useSpring(mv, { stiffness: 120, damping: 28, mass: 0.25 });
}

export function Overlay({ scrollYProgress, className }: Props) {
  const p = useSoftenedProgress(scrollYProgress);

  // Section 1: centered hero (0% scroll zone)
  const s1Opacity = useTransform(p, [0, 0.12, 0.2], [1, 1, 0]);
  const s1Y = useTransform(p, [0, 0.22], [0, -18]);

  // Section 2: left statement (~30%)
  const s2Opacity = useTransform(p, [0.22, 0.3, 0.42, 0.5], [0, 1, 1, 0]);
  const s2Y = useTransform(p, [0.22, 0.4], [26, 0]);
  const s2X = useTransform(p, [0.22, 0.45], [-10, 0]);

  // Section 3: right statement (~60%)
  const s3Opacity = useTransform(p, [0.52, 0.6, 0.72, 0.8], [0, 1, 1, 0]);
  const s3Y = useTransform(p, [0.55, 0.75], [28, 0]);
  const s3X = useTransform(p, [0.55, 0.75], [12, 0]);

  // Ambient "film" vignette tied to global progress
  const glowOpacity = useTransform(p, [0, 0.5, 1], [0.35, 0.6, 0.35]);

  const grainStyle = useMemo(
    () => ({
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E\")",
    }),
    []
  );

  return (
    <div className={className ? `${className} relative` : "relative h-full w-full"}>
      <motion.div
        className="pointer-events-none absolute -inset-24 opacity-[0.18] mix-blend-screen"
        style={{ opacity: glowOpacity, ...grainStyle }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-6xl">
          <div className="grid min-h-[70vh] place-items-center sm:min-h-[72vh]">
            <motion.div
              className="max-w-3xl text-center"
              style={{ opacity: s1Opacity, y: s1Y }}
            >
              <p className="text-xs font-medium tracking-[0.32em] text-zinc-400/90 sm:text-sm">
                {PROFILE.pronouns} · {PROFILE.location}
              </p>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl sm:leading-[1.08]">
                <span className="block text-zinc-100">{PROFILE.name}</span>
                <span className="mt-3 block bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-500 bg-clip-text text-2xl text-transparent sm:mt-4 sm:text-4xl">
                  {PROFILE.roleLine}
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-balance text-xs text-zinc-500 sm:text-sm">
                {PROFILE.stack}
              </p>
              <p className="mx-auto mt-5 max-w-xl text-balance text-sm leading-relaxed text-zinc-400/90 sm:text-base">
                {PROFILE.oneLiner}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 p-6 sm:p-10">
        <div className="mx-auto h-full w-full max-w-6xl">
          <div className="relative h-full w-full">
            <motion.div
              className="absolute left-0 top-[32%] max-w-md text-left"
              style={{ opacity: s2Opacity, y: s2Y, x: s2X }}
            >
              <p className="text-xs font-medium tracking-[0.28em] text-zinc-500">FOCUS</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:leading-tight">
                APIs, cloud, and systems that stay fast under load.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400/90 sm:text-base">
                Python, FastAPI, Node, PostgreSQL, AWS, Kafka—shipping microservices, ETL, and production REST with clear
                ownership end to end.
              </p>
            </motion.div>

            <motion.div
              className="absolute right-0 top-[58%] max-w-md text-right"
              style={{ opacity: s3Opacity, y: s3Y, x: s3X }}
            >
              <p className="text-xs font-medium tracking-[0.28em] text-zinc-500">ALSO</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:leading-tight">
                AI/ML that ships—not notebook demos.
              </h2>
              <p className="mt-3 max-w-sm text-right text-sm leading-relaxed text-zinc-400/90 sm:ml-auto sm:text-base">
                LLM integration, PyTorch, and full-stack product work—from SnapMatePhoto to healthcare pipelines at
                Evernorth. Code that works in production.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
