import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { products } from "@/data/products";
import { formatUsd } from "@/lib/money";

export const metadata = {
  title: "Shop | Shamrock Art Studio",
  description:
    "Original works available for acquisition—priced transparently, shipped with care.",
};

export default function ShopPage() {
  return (
    <PageLayout
      eyebrow="Acquire"
      title="Shop"
      subtitle="Each piece is listed with medium, dimensions, and a fixed price—no hidden fees at checkout beyond insured shipping."
      width="full"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/shop/${p.slug}`}
            className="group overflow-hidden rounded-4xl border-2 border-slate-700/35 bg-slate-900/40 shadow-lg shadow-slate-950/35 transition duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-950/45"
          >
            <div className="relative aspect-[4/5] overflow-hidden border-b border-white/5">
              <Image
                src={p.image}
                alt={`${p.title} by ${p.artist}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  {p.medium}
                </p>
                <p className="mt-2 font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
                  {p.title}
                </p>
                <p className="mt-1 text-sm text-stone-400">{p.artist}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-slate-500">{p.edition}</span>
              <span className="font-semibold tabular-nums text-amber-200/95">
                {formatUsd(p.priceUsd)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
