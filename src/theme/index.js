/**
 * Active visual theme — edit `CHOSEN_THEME` below (no UI toggle).
 * `./themes.css` — ids must match `THEME_IDS`.
 *
 * Dark: default | midnight | ember | noir-rose | velvet
 * Light: dawn | porcelain | linen
 * Light feminine: blush | petal | ballet
 */

export const THEME_IDS = /** @type {const} */ ([
  /* Dark */
  "default",
  "midnight",
  "ember",
  "noir-rose",
  "velvet",
  /* Light */
  "dawn",
  "porcelain",
  "linen",
  /* Light feminine */
  "blush",
  "petal",
  "ballet",
]);

/**
 * Light page themes — used by `isLightThemeId()` for component styling.
 * Keep in sync with `themes.css` “Light themes — global text” utility remaps.
 */
export const LIGHT_THEME_IDS = /** @type {const} */ ([
  "dawn",
  "porcelain",
  "linen",
  "blush",
  "petal",
  "ballet",
]);

/** @param {string} [id] */
export function isLightThemeId(id) {
  return typeof id === "string" && LIGHT_THEME_IDS.includes(id);
}

/** @type {(typeof THEME_IDS)[number]} */
const CHOSEN_THEME = "blush";

export const ACTIVE_THEME_ID = THEME_IDS.includes(CHOSEN_THEME)
  ? CHOSEN_THEME
  : "default";
