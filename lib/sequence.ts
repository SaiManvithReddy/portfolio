// NOTE:
// - Your repo currently uses PNGs named: `public/sequence/frame_000_...png`
// - If you convert to WebP, update `FRAME_EXT` + filenames below to match.
export const FRAME_EXT = "png" as const;
export const FRAME_COUNT = 120; // 000..119

// Delay fragment is part of the exported filename from your source tool.
// Keep in sync with your actual files to avoid 404s.
const DELAY_FRAGMENT = "delay-0.066s";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export function getFrameSrc(index: number) {
  if (!Number.isFinite(index)) {
    return `/sequence/frame_${pad3(0)}_${DELAY_FRAGMENT}.${FRAME_EXT}`;
  }
  const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(index)));
  return `/sequence/frame_${pad3(clamped)}_${DELAY_FRAGMENT}.${FRAME_EXT}`;
}
