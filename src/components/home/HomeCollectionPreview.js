"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { featuredImageHeightOverWidth } from "@/data/homePage";

const IMAGE_BASE_WIDTH = 1200;

function CollectionWorkCard({ work }) {
  const ratio = featuredImageHeightOverWidth(work);
  const height = Math.max(1, Math.round(IMAGE_BASE_WIDTH * ratio));

  return (
    <article className="group w-full overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-950/45 shadow-lg shadow-slate-950/35 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-950/45">
      <div className="relative">
        <Image
          src={work.image}
          alt={`${work.title} by ${work.artist}`}
          width={IMAGE_BASE_WIDTH}
          height={height}
          sizes="(max-width: 640px) 100vw, 50vw"
          className="block h-auto w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/88 via-slate-950/25 to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            {work.medium}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
                {work.title}
              </h3>
              <p className="mt-1 text-sm text-stone-200/85">{work.artist}</p>
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums text-amber-300/85">
              {work.size ?? work.year ?? ""}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomeCollectionPreview({ works }) {
  const [columnCount, setColumnCount] = useState(1);

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

    works.forEach((work) => {
      const ratio = featuredImageHeightOverWidth(work);
      const estimatedHeight = ratio + 0.42;
      let target = 0;
      for (let i = 1; i < heights.length; i += 1) {
        if (heights[i] < heights[target]) target = i;
      }
      cols[target].push(work);
      heights[target] += estimatedHeight;
    });
    return cols;
  }, [works, columnCount]);

  const gridClass = columnCount >= 2 ? "sm:grid-cols-2" : "grid-cols-1";

  return (
    <section
      id="collection"
      className="relative mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 lg:px-12"
    >
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
          The layout stays asymmetric so each release feels editorial. New
          works are added as Firebase-hosted images in the homepage data.
        </p>
      </div>

      <div className={`grid gap-6 ${gridClass}`}>
        {workColumns.map((column, colIdx) => (
          <div key={`collection-col-${colIdx}`} className="space-y-6">
            {column.map((work, rowIdx) => (
              <CollectionWorkCard
                key={`${work.title}-${work.artist}-${colIdx}-${rowIdx}`}
                work={work}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
