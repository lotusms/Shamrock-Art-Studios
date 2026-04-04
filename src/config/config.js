/**
 * Site-wide values that may change (brand, navigation).
 */

export const orgName = "Shamrock Art Studio";

/** Primary site navigation — add routes alongside `src/app/.../page.js` */
export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop", prefix: true },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * @param {string} segment Page title segment (e.g. "Shop", "Contact")
 * @returns {string} e.g. "Shop | Shamrock Art Studio"
 */
export function sitePageTitle(segment) {
  const s = String(segment ?? "").trim();
  if (!s) return orgName;
  return `${s} | ${orgName}`;
}
