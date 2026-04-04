"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ARTWORK_MAT_INNER, ARTWORK_MAT_OUTER } from "@/components/ui/artworkMatClasses";

const ROTATE_MS = 8000;
/** Crossfade between slides (opacity on overlapping layers). */
const SLIDE_FADE_MS = 2500;

function heroSubtitle(product) {
  const tail = product.dimensions || product.year;
  return tail ? `${product.artist} • ${tail}` : product.artist;
}

export default function HomeHeroArtRotator({ products }) {
  const [index, setIndex] = useState(0);
  const n = products.length;

  useEffect(() => {
    if (n <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [n]);

  const current = products[index];
  if (!current) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-slate-600/40 bg-slate-950 shadow-2xl shadow-slate-950/40 ring-2 ring-slate-500/25 transition duration-500 hover:ring-amber-400/35 hover:shadow-slate-950/50"
    >
      {/* Mat + inner aperture; fixed portrait; mockup PNG zoom fills aperture. */}
      <div className={ARTWORK_MAT_OUTER}>
        <div className={ARTWORK_MAT_INNER}>
          <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-950">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className={`absolute inset-0 overflow-hidden transition-opacity ease-in-out ${
                  idx === index
                    ? "z-1 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
                aria-hidden={idx !== index}
                style={{ transitionDuration: `${SLIDE_FADE_MS}ms` }}
              >
                {p.image?.trim() ? (
                  <div className="relative h-full w-full origin-center scale-[1.14]">
                    <Image
                      src={p.image}
                      alt={`${p.title} by ${p.artist}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover object-center"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-500">
                    No preview image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-2 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
          Featured work
        </p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-stone-100 sm:text-3xl">
              {current.title}
            </h2>
            <p className="mt-2 text-sm text-stone-200/85">
              {heroSubtitle(current)}
            </p>
          </div>
          <Link
            href={`/shop/${current.slug}`}
            className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90 underline-offset-4 transition hover:text-amber-200 sm:inline"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
