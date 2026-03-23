"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, className = "" }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

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
          ? "Added to cart"
          : "Add to cart"}
    </button>
  );
}
