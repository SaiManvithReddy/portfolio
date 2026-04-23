"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import { FRAME_COUNT, getFrameSrc, getFrameUrlForClient } from "@/lib/sequence";

type Props = {
  /** Scroll progress (0..1) for the scrollytelling track */
  scrollYProgress: MotionValue<number>;
  /** The element that defines the render box (usually the sticky stage) */
  sizeRef: RefObject<HTMLElement | null>;
  /**
   * Preload pass finished (all requests settled).
   * `loaded` is how many images actually decoded; if 0, the canvas will stay empty (usually missing `public/sequence` on deploy).
   */
  onPreloadState?: (state: { done: boolean; loaded: number; total: number }) => void;
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

function isImageDrawable(img: HTMLImageElement | undefined): img is HTMLImageElement {
  return Boolean(img && img.complete && img.naturalWidth > 0);
}

/**
 * Use decoded Image elements, not a parallel `loaded[]` array — in React 18 dev / edge cases
 * the booleans can get out of sync with `imagesRef` while the images are still valid.
 */
function findNearestDrawableIndex(ideal: number, images: (HTMLImageElement | undefined)[]) {
  const safeIdeal = Math.max(0, Math.min(images.length - 1, Math.floor(ideal)));
  if (isImageDrawable(images[safeIdeal])) return safeIdeal;

  for (let d = 1; d < images.length; d += 1) {
    const a = safeIdeal - d;
    if (a >= 0 && isImageDrawable(images[a])) return a;
    const b = safeIdeal + d;
    if (b < images.length && isImageDrawable(images[b])) return b;
  }

  return -1;
}

export function ScrollyCanvas({ scrollYProgress, sizeRef, onPreloadState, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
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

      if (cssW < 2 || cssH < 2) return;

      // Background color matches page background for seamless letterboxing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Framer can briefly yield NaN for scrollYProgress before layout; that used to break frame index.
      const p = Number.isFinite(progress01) ? clamp(progress01, 0, 1) : 0;
      const idealIndex = Math.round(p * (FRAME_COUNT - 1));
      const frameIndex = findNearestDrawableIndex(idealIndex, imagesRef.current);
      if (frameIndex < 0) return;

      const img = imagesRef.current[frameIndex];
      if (!isImageDrawable(img)) return;

      ctx.imageSmoothingEnabled = true;
      // "high" is not in TS lib in all setups, cast for safety
      (ctx as CanvasRenderingContext2D).imageSmoothingQuality = "high";

      // Draw in CSS pixel space, then scale by DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rect = computeCoverRect(img.naturalWidth, img.naturalHeight, cssW, cssH);
      try {
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
      } catch (e) {
        // e.g. canvas taint / CORS; same-origin static files should not hit this
        // eslint-disable-next-line no-console
        console.error("ScrollyCanvas drawImage failed:", e);
      }
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
    imagesRef.current = imgs;
    onPreloadState?.({ done: false, loaded: 0, total: FRAME_COUNT });

    const loadOne = (index: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.src = getFrameUrlForClient(index);
        img.onload = () => {
          if (cancelled) return;
          // Register pixels immediately. Waiting only on `decode()` has caused blank
          // canvas on some production builds while local dev still worked.
          imgs[index] = img;
          schedulePaint(latestProgressRef.current);
          // Optional: decode in background (don’t block marking the image drawable)
          const anyImg = img as HTMLImageElement & { decode?: () => Promise<void> };
          if (typeof anyImg.decode === "function") {
            anyImg.decode().then(() => schedulePaint(latestProgressRef.current)).catch(() => undefined);
          }
          resolve();
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

      const ok = imgs.filter((el) => isImageDrawable(el)).length;
      onPreloadState?.({ done: true, loaded: ok, total: FRAME_COUNT });
      schedulePaint(latestProgressRef.current);
    })();

    return () => {
      cancelled = true;
    };
  }, [onPreloadState, schedulePaint]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (Number.isFinite(v)) schedulePaint(v);
  });

  // Initial + delayed repaints: production can measure layout a tick later than local dev
  useEffect(() => {
    const v = scrollYProgress.get();
    schedulePaint(Number.isFinite(v) ? v : 0);
    const t0 = window.setTimeout(() => schedulePaint(latestProgressRef.current), 0);
    const t1 = window.setTimeout(() => schedulePaint(latestProgressRef.current), 100);
    let raf0 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf0 = requestAnimationFrame(() => schedulePaint(latestProgressRef.current));
    });
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      cancelAnimationFrame(raf1);
      if (raf0) cancelAnimationFrame(raf0);
    };
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
