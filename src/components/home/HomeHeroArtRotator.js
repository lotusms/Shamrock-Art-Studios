"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ARTWORK_MAT_INNER, ARTWORK_MAT_OUTER } from "@/components/ui/artworkMatClasses";
import LinkButton from "@/components/ui/LinkButton";
import { formatUsd } from "@/lib/money";

const ROTATE_MS = 8000;
/** Crossfade between slides (opacity on overlapping layers). */
const SLIDE_FADE_MS = 2500;

/** Display price: range when available, else single price. */
function heroPriceLabel(product) {
  const min = Number(product?.minPriceUsd);
  const max = Number(product?.maxPriceUsd);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > min) {
    return `${formatUsd(min)}–${formatUsd(max)}`;
  }
  return formatUsd(product?.priceUsd ?? 0);
}

/** Rich alt for hero mockups: title, category, medium, size, price, artist, brand. */
function heroImageAlt(product) {
  const title = String(product?.title || "Artwork").trim();
  const medium = String(product?.medium || "Print").trim();
  const size = String(product?.dimensions || "").trim() || "See listing for sizes";
  const artist = String(product?.artist || "Jas Perez").trim();
  const price = heroPriceLabel(product);
  return `Wall art product: ${title}. Category wall art. ${medium}. Size ${size}. From ${price}. By ${artist}. Shamrock Art Studio.`;
}

function heroSubtitle(product) {
  const tail = product.year;
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
      className="relative overflow-hidden rounded-3xl border-2 border-slate-600/40 bg-slate-950 shadow-2xl shadow-slate-950/40 transition duration-500 hover:ring-amber-400/35 hover:shadow-slate-950/50"
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
                      alt={heroImageAlt(p)}
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
        <h2 className="font-serif mt-3 text-2xl font-medium tracking-[-0.02em] text-stone-100 sm:text-3xl"> {current.title} </h2>
        
        
        <div className=" flex items-end justify-between gap-6">
          <p className="mt-1 text-sm text-slate-400">{current.medium} • {current.dimensions || "—"}</p>
          <LinkButton href={`/shop/${current.slug}`}>View</LinkButton>
        </div>
      </div>
    </div>
  );
}
