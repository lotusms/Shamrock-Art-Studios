"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import Card from "@/components/ui/Card";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { formatUsd } from "@/lib/money";

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
      <p className="mt-3 font-serif text-4xl font-medium tabular-nums tracking-[-0.03em] text-stone-100 sm:text-5xl">
        {displayPrice(product, selectedVariant)}
      </p>

      <dl className="mt-8 space-y-4 border-t border-white/5 pt-8 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Medium</dt>
          <dd className="text-right text-stone-200">{product.medium}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Dimensions</dt>
          <dd className="text-right text-stone-200">
            {selectedVariant?.name || product.dimensions}
          </dd>
        </div>
      </dl>

      {variants.length > 1 ? (
        <div className="mt-6 border-t border-white/5 pt-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Choose a variant
          </p>
          <ul className="mt-3 space-y-2">
            {variants.map((variant, index) => {
              const key = variantKey(variant, index);
              const active = key === selectedVariantKey;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setSelectedVariantKey(key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      active
                        ? "border-amber-300/40 bg-amber-300/10"
                        : "border-white/5 bg-white/2 hover:border-white/15"
                    }`}
                  >
                    <span className="min-w-0 truncate text-sm text-stone-200">
                      {variant.name}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-amber-200/90">
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
        <SecondaryButton href="/shop" icon={<span>←</span>}>
          Back to shop
        </SecondaryButton>
      </div>
    </Card>
  );
}
