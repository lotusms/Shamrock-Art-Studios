/**
 * Secondary “mat” frame around catalog mockups: thick inset pad, subtle top-left
 * highlight, inner aperture — matches hero / masonry treatment.
 */
export const ARTWORK_MAT_OUTER =
  "rounded-2xl bg-slate-900/95 p-3 sm:p-3.5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.08),inset_-1px_-1px_0_rgba(0,0,0,0.4)] ring-1 ring-slate-950/70";

/** Inner lip against the art — intentionally thicker than the outer mat edge. */
export const ARTWORK_MAT_INNER =
  "relative overflow-hidden rounded-xl bg-slate-950 ring-[3px] ring-slate-600/55";
