import { isLightThemeId } from "@/theme";

const TRACK = "text-xs uppercase tracking-[0.32em]";

/** Muted card titles: dark glass cards vs light paper cards (see `Card` surface). */
const TITLE_BY_VARIANT = {
  default: {
    onDarkCard: `${TRACK} text-slate-400`,
    onLightCard: `${TRACK} text-slate-600`,
  },
  emerald: {
    onDarkCard: `${TRACK} text-emerald-400/90`,
    onLightCard: `${TRACK} text-emerald-800/90`,
  },
  amber: {
    onDarkCard: `${TRACK} text-amber-300`,
    onLightCard: `${TRACK} text-amber-900/90`,
  },
  gradient: {
    onDarkCard: `${TRACK} text-slate-400`,
    onLightCard: `${TRACK} text-slate-600`,
  },
  inset: {
    onDarkCard: `${TRACK} text-amber-300/90`,
    onLightCard: `${TRACK} text-amber-900/85`,
  },
};

/**
 * @param {string} [variant]
 * @param {string} [themeId] — from `useDocumentThemeId()` or `ACTIVE_THEME_ID`
 */
export function cardTitleClassForVariant(variant, themeId) {
  const v = variant && TITLE_BY_VARIANT[variant] ? variant : "default";
  const row = TITLE_BY_VARIANT[v];
  const bucket = isLightThemeId(themeId) ? "onLightCard" : "onDarkCard";
  return row[bucket];
}
