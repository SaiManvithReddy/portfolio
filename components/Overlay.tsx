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

  // progress 0 = page load (section top at viewport top)
  // progress 1 = section bottom at viewport bottom (~400vh of scroll)

  // Section 1: hero — full opacity at load, fades as scroll begins
  const s1Opacity = useTransform(p, [0, 0.18, 0.28], [1, 1, 0]);
  const s1Y = useTransform(p, [0, 0.30], [0, -18]);

  // Section 2: FOCUS (~30–60% of scroll)
  const s2Opacity = useTransform(p, [0.30, 0.40, 0.54, 0.62], [0, 1, 1, 0]);
  const s2Y = useTransform(p, [0.30, 0.54], [26, 0]);
  const s2X = useTransform(p, [0.30, 0.54], [-10, 0]);

  // Section 3: ALSO (~65–100% of scroll)
  const s3Opacity = useTransform(p, [0.65, 0.74, 0.88, 1.0], [0, 1, 1, 0]);
  const s3Y = useTransform(p, [0.65, 0.88], [28, 0]);
  const s3X = useTransform(p, [0.65, 0.88], [12, 0]);

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
    <div
      className={
        className ? `${className} relative overflow-hidden` : "relative h-full w-full overflow-hidden"
      }
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
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
                Backend systems built for production — not just demos.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400/90 sm:text-base">
                Python, FastAPI, Node.js, PostgreSQL, AWS, Kafka — microservices, ETL pipelines, and REST APIs shipped
                end-to-end with measurable impact. 30% faster APIs. 20% less downtime.
              </p>
            </motion.div>

            <motion.div
              className="absolute right-0 top-[58%] max-w-md text-right"
              style={{ opacity: s3Opacity, y: s3Y, x: s3X }}
            >
              <p className="text-xs font-medium tracking-[0.28em] text-zinc-500">ALSO</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:leading-tight">
                AI and ML that earns its place in production.
              </h2>
              <p className="mt-3 max-w-sm text-right text-sm leading-relaxed text-zinc-400/90 sm:ml-auto sm:text-base">
                LangChain, OpenAI, PyTorch — automating ticket triage and log analysis at Evernorth, building
                user-facing features at SnapMatePhoto. Validated, monitored, and in prod.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
