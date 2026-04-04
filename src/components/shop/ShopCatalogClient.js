"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUsd } from "@/lib/money";
import CoverImageFrame from "@/components/ui/CoverImageFrame";

function formatProductPrice(product) {
  const min = Number(product?.minPriceUsd);
  const max = Number(product?.maxPriceUsd);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > min) {
    return `${formatUsd(min)}–${formatUsd(max)}`;
  }
  return formatUsd(product.priceUsd);
}

function ProductCard({ product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block w-full">
      <div className="relative rounded-4xl shadow-lg shadow-slate-950/35 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/45">
        <CoverImageFrame
          src={product.image}
          alt={`${product.title} by ${product.artist}`}
          imageWidth={product.imageWidth}
          imageHeight={product.imageHeight}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          scrim="card"
        />
        <div className="absolute right-4 top-4 z-20 rounded-full border border-amber-300/35 bg-slate-950/70 px-3 py-1.5 text-sm font-semibold tabular-nums text-stone-200! backdrop-blur-sm">
          {formatProductPrice(product)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {product.medium}
          </p>
          <p className="mt-2 font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
            {product.title}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton({ delay = 0 }) {
  const heightClass = delay % 2 === 0 ? "h-[22rem]" : "h-[30rem]";
  return (
    <div
      className="w-full overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-900/40 shadow-lg shadow-slate-950/35 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`relative overflow-hidden border-b border-white/5 bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 ${heightClass}`}
      />
      <div className="space-y-3 px-5 py-4">
        <div className="h-3 w-24 rounded-full bg-slate-700/70" />
        <div className="h-5 w-4/5 rounded-full bg-slate-600/60" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-4xl border-2 border-slate-700/40 bg-linear-to-br from-slate-900/60 via-slate-950/60 to-slate-900/45 p-10 text-center shadow-2xl shadow-slate-950/40">
      <div className="pointer-events-none absolute -left-10 -top-20 h-44 w-44 rounded-full bg-amber-300/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-20 h-52 w-52 rounded-full bg-sky-300/10 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Coming Soon</p>
      <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-stone-100 sm:text-4xl">
        New drops are on the way
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-300/90">
        There are no products available right now. Check back shortly for fresh
        wall art, posters, and studio accessories.
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-flex rounded-full border border-slate-500/60 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:text-amber-100"
      >
        Ask about custom orders
      </Link>
    </div>
  );
}

export default function ShopCatalogClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeCollection, setActiveCollection] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/catalog/products", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!active) return;
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch {
        if (!active) return;
        setProducts([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(t);
  }, [loading]);

  const collections = useMemo(() => {
    const names = Array.from(
      new Set(
        products
          .map((p) => String(p.medium || "").trim())
          .filter(Boolean),
      ),
    );
    return names.sort((a, b) => {
      if (a === "Canvas") return -1;
      if (b === "Canvas") return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeCollection) return products;
    return products.filter((p) => p.medium === activeCollection);
  }, [products, activeCollection]);

  useEffect(() => {
    if (!collections.length) {
      setActiveCollection("");
      return;
    }
    if (!activeCollection || !collections.includes(activeCollection)) {
      setActiveCollection(collections[0]);
    }
  }, [collections, activeCollection]);

  const skeletons = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    function updateColumnCount() {
      const width = window.innerWidth;
      if (width >= 1024) {
        setColumnCount(3);
      } else if (width >= 640) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    }

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  const productColumns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    const heights = Array.from({ length: columnCount }, () => 0);

    filteredProducts.forEach((product) => {
      const ratio =
        Number(product.imageHeight) > 0 && Number(product.imageWidth) > 0
          ? Number(product.imageHeight) / Number(product.imageWidth)
          : 1.25;
      // Estimate card height: image ratio + metadata sections.
      const estimatedHeight = ratio + 0.42;
      let target = 0;
      for (let i = 1; i < heights.length; i += 1) {
        if (heights[i] < heights[target]) target = i;
      }
      cols[target].push(product);
      heights[target] += estimatedHeight;
    });
    return cols;
  }, [filteredProducts, columnCount]);

  const skeletonColumns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    skeletons.forEach((i, idx) => {
      cols[idx % columnCount].push(i);
    });
    return cols;
  }, [skeletons, columnCount]);

  if (loading) {
    return (
      <div
        className={`grid gap-6 ${
          columnCount === 3
            ? "lg:grid-cols-3"
            : columnCount === 2
              ? "sm:grid-cols-2"
              : "grid-cols-1"
        }`}
      >
        {skeletonColumns.map((column, colIdx) => (
          <div key={`skeleton-col-${colIdx}`} className="space-y-6">
            {column.map((i) => (
              <ProductSkeleton key={i} delay={i * 50} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {collections.map((name) => {
              const active = activeCollection === name;
              const count = products.filter((p) => p.medium === name).length;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveCollection(name)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                    active
                      ? "border-amber-300/50 bg-amber-300/10 text-amber-100"
                      : "border-slate-600/50 bg-slate-900/45 text-slate-400 hover:border-slate-400/60 hover:text-stone-200"
                  }`}
                >
                  {name}{" "}
                  <span className="ml-1 text-[0.65rem] tracking-[0.18em] opacity-80">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-slate-700/45 bg-slate-900/35 px-6 py-10 text-center text-stone-300/85">
              No products available in this collection yet.
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                columnCount === 3
                  ? "lg:grid-cols-3"
                  : columnCount === 2
                    ? "sm:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {productColumns.map((column, colIdx) => (
                <div key={`product-col-${colIdx}`} className="space-y-6">
                  {column.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
