/**
 * Secondary “mat” frame around catalog mockups: thick inset pad, subtle bezel.
 * Uses semantic `bg-site-bg` so mats follow the active theme (light + dark).
 */
export const ARTWORK_MAT_OUTER =
  "rounded-2xl bg-site-bg p-3 sm:p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.12)] ring-1 ring-stone-500/25";

/** Inner lip against the art — slightly stronger ring for aperture edge. */
export const ARTWORK_MAT_INNER =
  "relative overflow-hidden rounded-xl bg-site-bg ring-[3px] ring-stone-500/35";
