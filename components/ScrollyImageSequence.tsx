"use client";

import { useAnimationFrame, useSpring, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { FRAME_COUNT, getFrameSrc, getFrameUrlForClient } from "@/lib/sequence";

type Props = {
  scrollYProgress: MotionValue<number>;
  onPreloadState?: (state: { done: boolean; loaded: number; total: number }) => void;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function indexForProgress(v: number) {
  const p = Number.isFinite(v) ? clamp(v, 0, 1) : 0;
  return Math.round(p * (FRAME_COUNT - 1));
}

/**
 * Scroll-scrubbed sequence using &lt;img object-fit:cover&gt; + **non-React** `img.src` updates
 * (no setState in the hot path) so it stays smooth in production, same as a canvas + drawImage
 * but without 2D context quirks on some hosts.
 */
export function ScrollyImageSequence({ scrollYProgress, onPreloadState, className }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastIndexRef = useRef(-1);
  const progressRef = useRef<MotionValue<number>>(scrollYProgress);

  // Slightly smears scroll to reduce micro-jitter; increase stiffness to track scroll more 1:1
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 34,
    mass: 0.18,
  });
  progressRef.current = smoothProgress;

  // Preload: warm the HTTP cache; display path never re-renders
  useEffect(() => {
    let cancelled = false;
    onPreloadState?.({ done: false, loaded: 0, total: FRAME_COUNT });
    const ok = new Array(FRAME_COUNT).fill(false);

    const loadOne = (i: number) =>
      new Promise<void>((resolve, reject) => {
        const im = new Image();
        im.src = getFrameUrlForClient(i);
        im.onload = () => {
          if (cancelled) return;
          ok[i] = true;
          resolve();
        };
        im.onerror = () => reject(new Error("frame"));
      });

    (async () => {
      const concurrency = 8;
      let next = 0;
      const workers = Array.from({ length: Math.min(concurrency, FRAME_COUNT) }, async () => {
        while (next < FRAME_COUNT) {
          const i = next++;
          try {
            await loadOne(i);
          } catch {
            // eslint-disable-next-line no-console
            console.warn(`ScrollyImageSequence: failed to load frame ${i}`);
          }
        }
      });
      await Promise.all(workers);
      if (cancelled) return;
      onPreloadState?.({ done: true, loaded: ok.filter(Boolean).length, total: FRAME_COUNT });
    })();

    return () => {
      cancelled = true;
    };
  }, [onPreloadState]);

  // Stable: never rebind Framer’s frame loop; read latest progress from a ref
  const tick = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const p = progressRef.current.get();
    if (!Number.isFinite(p)) return;
    const idx = indexForProgress(p);
    if (idx === lastIndexRef.current) return;
    lastIndexRef.current = idx;
    el.src = getFrameUrlForClient(idx);
  }, []);

  useAnimationFrame(tick);

  // First paint + after layout
  useEffect(() => {
    const run = () => {
      if (!imgRef.current) return;
      lastIndexRef.current = -1;
      tick();
    };
    run();
    const t = requestAnimationFrame(run);
    const t2 = window.setTimeout(run, 50);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(t2);
    };
  }, [scrollYProgress, tick]);

  return (
    <div className={className} style={{ background: "#121212" }}>
      {/* Scroll-scrubbed frames are not a fit for next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={getFrameSrc(0)}
        alt=""
        decoding="sync"
        fetchPriority="high"
        className="pointer-events-none h-full w-full select-none object-cover"
        style={{ minHeight: "100%", minWidth: "100%" }}
        draggable={false}
      />
    </div>
  );
}
