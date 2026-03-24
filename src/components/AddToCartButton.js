"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, className = "" }) {
  const { addItem, lines } = useCart();
  const [added, setAdded] = useState(false);

  const lineKey = useMemo(() => {
    if (product?.variantId) return `v-${product.variantId}`;
    return `p-${product?.id ?? "unknown"}`;
  }, [product?.id, product?.variantId]);

  const existingQuantity = useMemo(() => {
    const existing = lines.find((line) => line.lineKey === lineKey);
    return existing?.quantity ?? 0;
  }, [lineKey, lines]);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(t);
  }, [added]);

  function handleClick() {
    if (!product?.variantId) return;
    addItem(product, 1);
    setAdded(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!product?.variantId}
      className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 text-slate-900 shadow-lg shadow-slate-900/35 ring-2 ring-white/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-400/25 hover:brightness-105 disabled:opacity-60 ${className}`}
    >
      {!product?.variantId
        ? "Unavailable"
        : added
          ? existingQuantity > 1
            ? "Added another"
            : "Added to cart"
          : existingQuantity > 0
            ? "Add another to cart"
            : "Add to cart"}
    </button>
  );
}
