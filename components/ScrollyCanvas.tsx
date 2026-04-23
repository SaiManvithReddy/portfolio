"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import { FRAME_COUNT, getFrameSrc } from "@/lib/sequence";

type Props = {
  /** Scroll progress (0..1) for the scrollytelling track */
  scrollYProgress: MotionValue<number>;
  /** The element that defines the render box (usually the sticky stage) */
  sizeRef: RefObject<HTMLElement | null>;
  /** Fires once the full sequence is decoded into memory (best effort) */
  onSequenceReadyChange?: (ready: boolean) => void;
  className?: string;
};

function computeCoverRect(
  imageW: number,
  imageH: number,
  targetW: number,
  targetH: number
) {
  if (imageW <= 0 || imageH <= 0 || targetW <= 0 || targetH <= 0) {
    return { x: 0, y: 0, w: targetW, h: targetH };
  }

  const imageAspect = imageW / imageH;
  const targetAspect = targetW / targetH;

  // Match CSS `object-fit: cover`
  if (imageAspect > targetAspect) {
    const h = targetH;
    const w = h * imageAspect;
    return { x: (targetW - w) / 2, y: 0, w, h };
  }

  const w = targetW;
  const h = w / imageAspect;
  return { x: 0, y: (targetH - h) / 2, w, h };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function findNearestLoadedIndex(ideal: number, loaded: boolean[]) {
  if (loaded[ideal]) return ideal;

  for (let d = 1; d < loaded.length; d += 1) {
    const a = ideal - d;
    if (a >= 0 && loaded[a]) return a;
    const b = ideal + d;
    if (b < loaded.length && loaded[b]) return b;
  }

  return -1;
}

export function ScrollyCanvas({ scrollYProgress, sizeRef, onSequenceReadyChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const dprRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const latestProgressRef = useRef(0);

  const paint = useCallback(
    (progress01: number) => {
      const canvas = canvasRef.current;
      const stage = sizeRef.current;
      if (!canvas || !stage) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const dpr = dprRef.current;
      const cssW = stage.clientWidth;
      const cssH = stage.clientHeight;

      // If layout isn't ready, skip
      if (cssW < 2 || cssH < 2) return;

      // Background color matches page background for seamless letterboxing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const p = clamp(progress01, 0, 1);
      const idealIndex = Math.round(p * (FRAME_COUNT - 1));
      const frameIndex = findNearestLoadedIndex(idealIndex, loadedRef.current);
      if (frameIndex < 0) return;

      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth <= 0) return;

      ctx.imageSmoothingEnabled = true;
      // "high" is not in TS lib in all setups, cast for safety
      (ctx as CanvasRenderingContext2D).imageSmoothingQuality = "high";

      // Draw in CSS pixel space, then scale by DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rect = computeCoverRect(img.naturalWidth, img.naturalHeight, cssW, cssH);
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    },
    [sizeRef]
  );

  const schedulePaint = useCallback(
    (progress01: number) => {
      latestProgressRef.current = progress01;
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        paint(latestProgressRef.current);
      });
    },
    [paint]
  );

  useLayoutEffect(() => {
    const stage = sizeRef.current;
    if (!stage) return;

    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;

      const w = stage.clientWidth;
      const h = stage.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));

      schedulePaint(latestProgressRef.current);
    });

    ro.observe(stage);
    return () => ro.disconnect();
  }, [sizeRef, schedulePaint]);

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    imagesRef.current = imgs;
    loadedRef.current = loaded;
    onSequenceReadyChange?.(false);

    const loadOne = (index: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.src = getFrameSrc(index);
        img.onload = () => {
          // Prefer async decode to reduce main-thread jank when possible
          const anyImg = img as HTMLImageElement & { decode?: () => Promise<void> };
          if (typeof anyImg.decode === "function") {
            anyImg
              .decode()
              .then(() => {
                if (cancelled) return;
                imgs[index] = img;
                loaded[index] = true;
                resolve();
              })
              .catch(() => {
                if (cancelled) return;
                imgs[index] = img;
                loaded[index] = true;
                resolve();
              });
          } else {
            if (cancelled) return;
            imgs[index] = img;
            loaded[index] = true;
            resolve();
          }
        };
        img.onerror = (e) => reject(e);
      });

    (async () => {
      // Bounded concurrency: fast enough, avoids opening 120 connections at once
      const concurrency = 8;
      let next = 0;
      const workers = new Array(Math.min(concurrency, FRAME_COUNT)).fill(0).map(async () => {
        while (next < FRAME_COUNT) {
          const i = next;
          next += 1;
          try {
            await loadOne(i);
            // Paint as early as possible (first frame makes the experience feel "alive")
            schedulePaint(latestProgressRef.current);
          } catch {
            // If a frame is missing, keep going (prevents the whole scrolly from dying)
            // You should fix filenames/paths, but the site can still run.
            // eslint-disable-next-line no-console
            console.warn(`Failed to load frame ${i} (${getFrameSrc(i)})`);
          }
        }
      });

      await Promise.all(workers);

      if (cancelled) return;

      onSequenceReadyChange?.(true);
      schedulePaint(latestProgressRef.current);
    })();

    return () => {
      cancelled = true;
    };
  }, [onSequenceReadyChange, schedulePaint]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    schedulePaint(v);
  });

  // Initial paint
  useEffect(() => {
    schedulePaint(scrollYProgress.get());
  }, [scrollYProgress, schedulePaint]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        // Helps screen readers: canvas is decorative in this design
        aria-hidden="true"
      />
    </div>
  );
}
