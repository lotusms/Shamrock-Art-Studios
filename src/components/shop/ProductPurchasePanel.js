"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import Card from "@/components/ui/Card";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as overlayChrome from "@/lib/overlayChrome";
import { formatUsd } from "@/lib/money";
import { isLightThemeId } from "@/theme";

function variantKey(variant, index) {
  return String(variant?.id ?? variant?.catalogVariantId ?? `${variant?.name ?? "v"}-${index}`);
}

function displayPrice(product, selectedVariant) {
  if (selectedVariant?.priceUsd > 0) return formatUsd(selectedVariant.priceUsd);
  const min = Number(product?.minPriceUsd);
  const max = Number(product?.maxPriceUsd);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > min) {
    return `${formatUsd(min)}–${formatUsd(max)}`;
  }
  return formatUsd(product.priceUsd);
}

export default function ProductPurchasePanel({ product }) {
  const themeId = useDocumentThemeId();
  const lightCardSurface = isLightThemeId(themeId);
  /** Theme accent `text-site-secondary` is pastel on light pages — too low-contrast on paper cards. */
  const labelClass = lightCardSurface ? "text-stone-600" : "text-site-secondary";
  const valueClass = lightCardSurface ? "text-stone-900" : "text-site-fg";
  const sectionBorder = lightCardSurface
    ? "border-t border-stone-300/55"
    : "border-t border-site-fg/10";
  const variants = useMemo(() => {
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      return product.variants;
    }
    if (product?.variantId) {
      return [
        {
          id: product.variantId,
          catalogVariantId: product.catalogVariantId ?? null,
          name: product.dimensions || "Default",
          sku: product.sku ?? null,
          priceUsd: Number(product.priceUsd),
        },
      ];
    }
    return [];
  }, [product]);

  const [selectedVariantKey, setSelectedVariantKey] = useState(
    variants.length ? variantKey(variants[0], 0) : null,
  );

  const selectedVariant = useMemo(() => {
    if (!variants.length || !selectedVariantKey) return null;
    const idx = variants.findIndex((v, i) => variantKey(v, i) === selectedVariantKey);
    return idx >= 0 ? variants[idx] : variants[0];
  }, [selectedVariantKey, variants]);

  const productForCart = useMemo(() => {
    if (!selectedVariant) return product;
    return {
      ...product,
      variantId: selectedVariant.id ?? product.variantId ?? null,
      catalogVariantId:
        selectedVariant.catalogVariantId ?? product.catalogVariantId ?? null,
      sku: selectedVariant.sku ?? product.sku ?? null,
      priceUsd:
        Number.isFinite(Number(selectedVariant.priceUsd)) && Number(selectedVariant.priceUsd) > 0
          ? Number(selectedVariant.priceUsd)
          : product.priceUsd,
      dimensions: selectedVariant.name || product.dimensions,
    };
  }, [product, selectedVariant]);

  return (
    <Card variant="inset" className="w-full" title="Price" titleTag="h4">
      <p
        className={`mt-3 font-serif text-4xl font-medium tabular-nums tracking-[-0.03em] sm:text-5xl ${valueClass}`}
      >
        {displayPrice(product, selectedVariant)}
      </p>

      <dl className={`mt-8 space-y-4 pt-8 text-sm ${sectionBorder}`}>
        <div className="flex justify-between gap-4">
          <dt className={labelClass}>Medium</dt>
          <dd className={`text-right ${valueClass}`}>{product.medium}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className={labelClass}>Dimensions</dt>
          <dd className={`text-right ${valueClass}`}>
            {selectedVariant?.name || product.dimensions}
          </dd>
        </div>
      </dl>

      {variants.length > 1 ? (
        <div className={`mt-6 pt-6 ${sectionBorder}`}>
          <p className={`text-xs uppercase tracking-[0.24em] ${labelClass}`}>
            Choose a variant
          </p>
          <ul className="mt-3 space-y-2">
            {variants.map((variant, index) => {
              const key = variantKey(variant, index);
              const active = key === selectedVariantKey;
              const inactiveSurface = lightCardSurface
                ? "border-stone-200/90 bg-white/60 hover:border-stone-300/90"
                : "border-white/5 bg-white/[0.02] hover:border-white/15";
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setSelectedVariantKey(key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      active
                        ? "border-amber-400/45 bg-amber-400/12"
                        : inactiveSurface
                    }`}
                  >
                    <span className={`min-w-0 truncate text-sm ${valueClass}`}>
                      {variant.name}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-site-primary">
                      {formatUsd(variant.priceUsd)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <AddToCartButton product={productForCart} className="sm:min-w-[200px]" />
        <SecondaryButton
          href="/shop"
          icon={<span>←</span>}
          className={overlayChrome.secondaryButtonLightOutline(lightCardSurface)}
        >
          Back to shop
        </SecondaryButton>
      </div>
    </Card>
  );
}
