"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { pickRecentCatalogProducts } from "@/lib/catalogSort";
import { formatUsd } from "@/lib/money";
import CoverImageFrame from "@/components/ui/CoverImageFrame";

const PREVIEW_LIMIT = 6;

function formatCardPrice(product) {
  const min = Number(product?.minPriceUsd);
  const max = Number(product?.maxPriceUsd);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > min) {
    return `${formatUsd(min)}–${formatUsd(max)}`;
  }
  return formatUsd(product?.priceUsd ?? 0);
}

/** @param {{ imageWidth?: number; imageHeight?: number }} product */
function productImageHeightOverWidth(product) {
  const w = Number(product?.imageWidth);
  const h = Number(product?.imageHeight);
  if (w > 0 && h > 0) return h / w;
  return 1.25;
}

function CollectionSkeletonCard({ delay = 0 }) {
  const h = delay % 2 === 0 ? "min-h-[18rem]" : "min-h-[24rem]";
  return (
    <div
      className="w-full overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-900/40 shadow-lg shadow-slate-950/35 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`border-b border-white/5 bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 ${h}`}
      />
      <div className="space-y-3 px-5 py-4">
        <div className="h-3 w-24 rounded-full bg-slate-700/70" />
        <div className="h-5 w-4/5 rounded-full bg-slate-600/60" />
      </div>
    </div>
  );
}

function CollectionProductCard({ product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block w-full overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-950/45 shadow-lg shadow-slate-950/35 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-950/45"
    >
      <div className="relative">
        <CoverImageFrame
          src={product.image}
          alt={`${product.title} by ${product.artist}`}
          imageWidth={product.imageWidth}
          imageHeight={product.imageHeight}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute right-4 top-4 rounded-full border border-amber-300/35 bg-slate-950/70 px-3 py-1.5 text-sm font-semibold tabular-nums text-amber-200 backdrop-blur-sm">
          {formatCardPrice(product)}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/88 via-slate-950/25 to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            {product.medium}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
                {product.title}
              </h3>
              <p className="mt-1 text-sm text-stone-200/85">{product.artist}</p>
            </div>
            {product.dimensions ? (
              <p className="max-w-[42%] shrink-0 text-right text-xs leading-snug text-amber-300/80 sm:text-sm">
                {product.dimensions}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomeCollectionPreview({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/catalog/products", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        const list = Array.isArray(data?.products) ? data.products : [];
        setProducts(pickRecentCatalogProducts(list, PREVIEW_LIMIT));
      } catch {
        if (!active) return;
        setProducts((prev) => (prev.length > 0 ? prev : []));
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
    function updateColumnCount() {
      const width = window.innerWidth;
      setColumnCount(width >= 640 ? 2 : 1);
    }
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  const workColumns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    const heights = Array.from({ length: columnCount }, () => 0);

    products.forEach((product) => {
      const ratio = productImageHeightOverWidth(product);
      const estimatedHeight = ratio + 0.42;
      let target = 0;
      for (let i = 1; i < heights.length; i += 1) {
        if (heights[i] < heights[target]) target = i;
      }
      cols[target].push(product);
      heights[target] += estimatedHeight;
    });
    return cols;
  }, [products, columnCount]);

  const gridClass = columnCount >= 2 ? "sm:grid-cols-2" : "grid-cols-1";

  const headerBlock = (
    <>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
            Collection preview
          </p>
          <h2 className="font-serif mt-4 max-w-3xl text-3xl font-medium tracking-[-0.02em] text-stone-100 sm:text-5xl">
            A modular gallery grid with{" "}
            <span className="text-gradient-hero-subtle not-italic">
              cinematic
            </span>{" "}
            cropping and editorial spacing.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-stone-200/85">
          The six most recently updated pieces from your Printful sync—the same
          inventory as the shop.
        </p>
      </div>
    </>
  );

  if (loading) {
    const skeletonPlaceholders = Array.from(
      { length: PREVIEW_LIMIT },
      (_, i) => i,
    );
    return (
      <section
        id="collection"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 lg:px-12"
      >
        {headerBlock}
        <div className={`grid gap-6 ${gridClass}`}>
          {Array.from({ length: columnCount }, (_, colIdx) => (
            <div key={`sk-col-${colIdx}`} className="space-y-6">
              {skeletonPlaceholders
                .filter((_, i) => i % columnCount === colIdx)
                .map((slot) => (
                  <CollectionSkeletonCard key={slot} delay={slot * 50} />
                ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        id="collection"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 lg:px-12"
      >
        {headerBlock}
        <div className="rounded-3xl border border-slate-700/45 bg-slate-900/35 px-6 py-12 text-center text-stone-300/90">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Catalog
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7">
            No products returned from the catalog. Connect Printful (API key +
            store sync) or open the shop to confirm your listings.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full border border-slate-500/60 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-amber-300/45 hover:text-amber-100"
          >
            Open shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="collection"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 lg:px-12"
    >
      {headerBlock}
      <div className={`grid gap-6 ${gridClass}`}>
        {workColumns.map((column, colIdx) => (
          <div key={`collection-col-${colIdx}`} className="space-y-6">
            {column.map((product, rowIdx) => (
              <CollectionProductCard
                key={product.id ?? `${product.slug}-${colIdx}-${rowIdx}`}
                product={product}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
