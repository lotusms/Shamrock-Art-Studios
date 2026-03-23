"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  if (product?.variantId) return `v-${product.variantId}`;
  return `p-${product?.id ?? "unknown"}`;
}

function normalizeLine(line) {
  if (line?.lineKey) return line;
  if (line?.variantId) return { ...line, lineKey: `v-${line.variantId}` };
  if (line?.productId) return { ...line, lineKey: `p-${line.productId}` };
  return { ...line, lineKey: `legacy-${Math.random().toString(36).slice(2, 8)}` };
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
            externalId: product.externalId ?? null,
            slug: product.slug,
            title: product.title,
            artist: product.artist,
            priceUsd: product.priceUsd,
            image: product.image,
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
      lines.reduce((sum, l) => sum + l.priceUsd * l.quantity, 0),
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
