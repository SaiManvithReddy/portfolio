"use client";

import { useAnimationFrame, type MotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";

import { FRAME_COUNT, getFrameUrlForClient } from "@/lib/sequence";

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

function getNearestLoaded(
  bitmaps: (ImageBitmap | null)[],
  want: number,
): ImageBitmap | null {
  if (bitmaps[want]) return bitmaps[want];
  for (let d = 1; d < FRAME_COUNT; d++) {
    const a = want - d;
    const b = want + d;
    if (a >= 0 && bitmaps[a]) return bitmaps[a];
    if (b < FRAME_COUNT && bitmaps[b]) return bitmaps[b];
  }
  return null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  cw: number,
  ch: number,
) {
  const iw = img.width;
  const ih = img.height;
  if (iw === 0 || ih === 0) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function ScrollyImageSequence({ scrollYProgress, onPreloadState, className }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // ImageBitmap: pre-decoded off-thread — drawImage is instant, no main-thread stall
  const bitmapsRef = useRef<(ImageBitmap | null)[]>(Array.from({ length: FRAME_COUNT }, () => null));
  const progressMvRef = useRef(scrollYProgress);
  progressMvRef.current = scrollYProgress;

  const lastPaintRef = useRef({ index: -1, w: 0, h: 0, dpr: 0 });

  const drawRef = useRef<() => void>(() => undefined);
  useLayoutEffect(() => {
    drawRef.current = () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const p = progressMvRef.current.get();
      if (!Number.isFinite(p)) return;
      const frameIndex = indexForProgress(p);
      const bmp = getNearestLoaded(bitmapsRef.current, frameIndex);
      if (!bmp) return;

      const w = Math.max(1, Math.floor(wrap.clientWidth));
      const h = Math.max(1, Math.floor(wrap.clientHeight));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const bw = Math.floor(w * dpr);
      const bh = Math.floor(h * dpr);
      const prev = lastPaintRef.current;
      const sizeChanged = bw !== prev.w || bh !== prev.h || dpr !== prev.dpr;
      if (!sizeChanged && frameIndex === prev.index) return;
      if (sizeChanged) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCover(ctx, bmp, canvas.width, canvas.height);
      lastPaintRef.current = { index: frameIndex, w: bw, h: bh, dpr };
    };
  }, []);

  useAnimationFrame(() => {
    drawRef.current();
  });

  useEffect(() => {
    let cancelled = false;
    onPreloadState?.({ done: false, loaded: 0, total: FRAME_COUNT });
    let loadedCount = 0;

    const loadOne = async (i: number) => {
      const im = new Image();
      im.decoding = "async";
      im.src = getFrameUrlForClient(i);
      await new Promise<void>((resolve, reject) => {
        im.onload = () => resolve();
        im.onerror = () => reject(new Error("frame"));
      });
      // createImageBitmap decodes off the main thread — scrubbing never causes a decode stall
      const bmp = await createImageBitmap(im);
      if (cancelled) { bmp.close(); return; }
      bitmapsRef.current[i] = bmp;
      loadedCount++;
      onPreloadState?.({ done: false, loaded: loadedCount, total: FRAME_COUNT });
    };

    (async () => {
      // Load first 20 frames immediately at high concurrency so early scroll is smooth
      const priorityEnd = Math.min(20, FRAME_COUNT);
      const priorityWorkers = Array.from({ length: Math.min(16, priorityEnd) }, async (_, slot) => {
        for (let i = slot; i < priorityEnd; i += 16) {
          try { await loadOne(i); } catch { /* ignore individual failures */ }
        }
      });
      await Promise.all(priorityWorkers);

      // Load remaining frames at full concurrency
      const concurrency = 20;
      let next = priorityEnd;
      const workers = Array.from({ length: Math.min(concurrency, FRAME_COUNT - priorityEnd) }, async () => {
        while (next < FRAME_COUNT) {
          const i = next++;
          try { await loadOne(i); } catch { /* ignore individual failures */ }
        }
      });
      await Promise.all(workers);

      if (cancelled) return;
      onPreloadState?.({ done: true, loaded: loadedCount, total: FRAME_COUNT });
    })();

    return () => {
      cancelled = true;
      // Release GPU memory for all pre-decoded bitmaps
      bitmapsRef.current.forEach(bmp => bmp?.close());
      bitmapsRef.current = Array.from({ length: FRAME_COUNT }, () => null);
    };
  }, [onPreloadState]);

  return (
    <div ref={wrapRef} className={className} style={{ background: "#121212" }}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none h-full w-full select-none"
        style={{ minHeight: "100%", minWidth: "100%" }}
        aria-hidden
      />
    </div>
  );
}
