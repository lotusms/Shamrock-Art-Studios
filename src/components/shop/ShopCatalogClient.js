"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUsd } from "@/lib/money";

function ProductCard({ product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-900/40 shadow-lg shadow-slate-950/35 transition duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-950/45"
    >
      <div className="relative aspect-4/5 overflow-hidden border-b border-white/5">
        <Image
          src={product.image}
          alt={`${product.title} by ${product.artist}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {product.medium}
          </p>
          <p className="mt-2 font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
            {product.title}
          </p>
          <p className="mt-1 text-sm text-stone-400">{product.artist}</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm text-slate-500">{product.edition}</span>
        <span className="font-semibold tabular-nums text-amber-200/95">
          {formatUsd(product.priceUsd)}
        </span>
      </div>
    </Link>
  );
}

function ProductSkeleton({ delay = 0 }) {
  return (
    <div
      className="overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-900/40 shadow-lg shadow-slate-950/35 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-4/5 overflow-hidden border-b border-white/5 bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60" />
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
      <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Soon</p>
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

  const skeletons = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((i) => (
          <ProductSkeleton key={i} delay={i * 50} />
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
