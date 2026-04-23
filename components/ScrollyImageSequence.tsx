"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

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
 * Same scroll→frame mapping as the old canvas, but uses a real &lt;img&gt; (object-fit: cover)
 * so production matches “open PNG in a new tab” — no canvas2d / decode edge cases.
 */
export function ScrollyImageSequence({ scrollYProgress, onPreloadState, className }: Props) {
  const rafRef = useRef<number | null>(null);
  const latestV = useRef(0);
  const [src, setSrc] = useState(() => getFrameSrc(0));

  // Warm the browser cache (same as before) so src swaps stay instant after load
  useEffect(() => {
    let cancelled = false;
    onPreloadState?.({ done: false, loaded: 0, total: FRAME_COUNT });
    const ok = new Array(FRAME_COUNT).fill(false);

    const loadOne = (i: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = getFrameUrlForClient(i);
        img.onload = () => {
          if (cancelled) return;
          ok[i] = true;
          resolve();
        };
        img.onerror = () => reject(new Error("frame"));
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

  const applyProgress = useCallback((v: number) => {
    const idx = indexForProgress(v);
    setSrc(typeof window !== "undefined" ? getFrameUrlForClient(idx) : getFrameSrc(idx));
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!Number.isFinite(v)) return;
    latestV.current = v;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyProgress(latestV.current);
    });
  });

  useEffect(() => {
    const v = scrollYProgress.get();
    applyProgress(Number.isFinite(v) ? v : 0);
  }, [scrollYProgress, applyProgress]);

  // Keep in sync if scroll motion updates without firing "change" (e.g. layout)
  useEffect(() => {
    const t = window.setTimeout(() => applyProgress(scrollYProgress.get()), 0);
    const t2 = window.setTimeout(() => applyProgress(scrollYProgress.get()), 120);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [applyProgress, scrollYProgress]);

  return (
    <div className={className} style={{ background: "#121212" }}>
      {/* 120 scroll-scrubbed frames — next/image is not suited for this pattern */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
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
