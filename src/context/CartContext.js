"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { roundUsd2 } from "@/lib/money";

const STORAGE_KEY = "shamrock-cart-v1";

const CartContext = createContext(null);

function loadStored() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toLineKey(product) {
  if (product?.catalogVariantId) return `cv-${product.catalogVariantId}`;
  if (product?.variantId) return `v-${product.variantId}`;
  return `p-${product?.id ?? "unknown"}`;
}

function normalizeLine(line) {
  if (line?.lineKey) return line;
  if (line?.variantId) return { ...line, lineKey: `v-${line.variantId}` };
  if (line?.productId) return { ...line, lineKey: `p-${line.productId}` };
  return { ...line, lineKey: `legacy-${Math.random().toString(36).slice(2, 8)}` };
}

function sameLineData(a, b) {
  return (
    a.lineKey === b.lineKey &&
    a.productId === b.productId &&
    a.printfulProductId === b.printfulProductId &&
    a.variantId === b.variantId &&
    a.catalogVariantId === b.catalogVariantId &&
    a.externalId === b.externalId &&
    a.slug === b.slug &&
    a.title === b.title &&
    a.artist === b.artist &&
    a.priceUsd === b.priceUsd &&
    a.image === b.image &&
    a.originalImage === b.originalImage &&
    Boolean(a.shippingIncluded) === Boolean(b.shippingIncluded) &&
    a.sku === b.sku &&
    a.quantity === b.quantity
  );
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(loadStored().map(normalizeLine));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!ready || lines.length === 0) return;
    let active = true;

    async function syncFromCatalog() {
      try {
        const response = await fetch("/api/catalog/products", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!active || !Array.isArray(data?.products)) return;

        const byVariant = new Map(
          data.products
            .filter((p) => p?.variantId)
            .map((p) => [String(p.variantId), p]),
        );

        setLines((prev) => {
          const next = prev
            .map((line) => {
              if (!line.variantId) return line;
              const latest = byVariant.get(String(line.variantId));
              // Keep cart lines that are not part of the "primary variant" projection
              // from /api/catalog/products (e.g., user selected a different variant).
              if (!latest) return line;
              return {
                ...line,
                productId: latest.id,
                printfulProductId: latest.printfulProductId ?? line.printfulProductId ?? null,
                catalogVariantId: latest.catalogVariantId ?? line.catalogVariantId ?? null,
                externalId: latest.externalId ?? line.externalId ?? null,
                slug: latest.slug ?? line.slug,
                title: latest.title ?? line.title,
                artist: latest.artist ?? line.artist,
                priceUsd: roundUsd2(
                  Number(latest.priceUsd ?? line.priceUsd),
                ),
                image: latest.image ?? line.image,
                originalImage:
                  latest.originalImage ??
                  line.originalImage ??
                  latest.image ??
                  line.image,
                shippingIncluded:
                  typeof latest.shippingIncluded === "boolean"
                    ? latest.shippingIncluded
                    : Boolean(line.shippingIncluded),
                sku: latest.sku ?? line.sku ?? null,
              };
            })
            .filter(Boolean);

          if (
            next.length === prev.length &&
            next.every((line, i) => sameLineData(line, prev[i]))
          ) {
            return prev;
          }
          return next;
        });
      } catch {
        // Keep cart usable if catalog sync fails.
      }
    }

    syncFromCatalog();
    return () => {
      active = false;
    };
  }, [ready, lines.length]);

  const addItem = useCallback((product, qty = 1) => {
    setLines((prev) => {
      const lineKey = toLineKey(product);
      const i = prev.findIndex((l) => l.lineKey === lineKey);
      if (i === -1) {
        return [
          ...prev,
          {
            lineKey,
            productId: product.id,
            printfulProductId: product.printfulProductId ?? null,
            variantId: product.variantId ?? null,
            catalogVariantId: product.catalogVariantId ?? null,
            externalId: product.externalId ?? null,
            slug: product.slug,
            title: product.title,
            artist: product.artist,
            priceUsd: roundUsd2(product.priceUsd),
            image: product.image,
            originalImage:
              product.originalImage ?? product.image ?? null,
            shippingIncluded: Boolean(product.shippingIncluded),
            sku: product.sku ?? null,
            quantity: qty,
          },
        ];
      }
      const next = [...prev];
      next[i] = {
        ...next[i],
        quantity: next[i].quantity + qty,
      };
      return next;
    });
  }, []);

  const setQuantity = useCallback((lineKey, quantity) => {
    const q = Math.max(0, Math.floor(Number(quantity)));
    setLines((prev) => {
      if (q === 0) return prev.filter((l) => l.lineKey !== lineKey);
      return prev.map((l) => (l.lineKey === lineKey ? { ...l, quantity: q } : l));
    });
  }, []);

  const removeLine = useCallback((lineKey) => {
    setLines((prev) => prev.filter((l) => l.lineKey !== lineKey));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const subtotalUsd = useMemo(
    () =>
      roundUsd2(
        lines.reduce((sum, l) => sum + l.priceUsd * l.quantity, 0),
      ),
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      ready,
      addItem,
      setQuantity,
      removeLine,
      clearCart,
      subtotalUsd,
      itemCount,
    }),
    [
      lines,
      ready,
      addItem,
      setQuantity,
      removeLine,
      clearCart,
      subtotalUsd,
      itemCount,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
