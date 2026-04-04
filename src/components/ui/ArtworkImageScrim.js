/**
 * Bottom fade over artwork only — lives inside the image aperture (same stacking
 * context as `next/image`), not over mat rings. Use with `CoverImageFrame` or
 * any `relative` image well that matches the hero layout.
 */

const VARIANT_CLASS = {
  none: null,
  inner: "product-image-scrim-inner",
  card: "product-image-scrim-card",
  hero: "product-image-scrim-hero",
};

/** @param {{ variant?: keyof typeof VARIANT_CLASS }} props */
export default function ArtworkImageScrim({ variant = "card" }) {
  const className = VARIANT_CLASS[variant];
  if (!className) return null;
  return <div className={className} aria-hidden />;
}
