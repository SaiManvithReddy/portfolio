"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
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
 * 1:1 with `scrollYProgress` (no spring = no "stuck" lag). `img.src` is updated on the
 * rAF *after* scroll changes so the browser doesn't thrash, but we read the *latest* value.
 */
export function ScrollyImageSequence({ scrollYProgress, onPreloadState, className }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const progressMvRef = useRef(scrollYProgress);
  progressMvRef.current = scrollYProgress;

  const applyLatest = useCallback(() => {
    rafRef.current = null;
    const el = imgRef.current;
    if (!el) return;
    const p = progressMvRef.current.get();
    if (!Number.isFinite(p)) return;
    const idx = indexForProgress(p);
    if (idx === lastIndexRef.current) return;
    lastIndexRef.current = idx;
    el.src = getFrameUrlForClient(idx);
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(applyLatest);
  }, [applyLatest]);

  useMotionValueEvent(scrollYProgress, "change", () => {
    schedule();
  });

  useEffect(() => {
    lastIndexRef.current = -1;
    const id = requestAnimationFrame(() => applyLatest());
    return () => cancelAnimationFrame(id);
  }, [scrollYProgress, applyLatest]);

  // Preload: warm the HTTP cache
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

  return (
    <div className={className} style={{ background: "#121212" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={getFrameSrc(0)}
        alt=""
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none h-full w-full select-none object-cover"
        style={{ minHeight: "100%", minWidth: "100%" }}
        draggable={false}
      />
    </div>
  );
}
