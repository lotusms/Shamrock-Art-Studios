import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import PageLayout from "@/components/PageLayout";
import { getAllSlugs, getProductBySlug } from "@/data/products";
import { formatUsd } from "@/lib/money";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Work not found" };
  return {
    title: `${product.title} | Shop | Shamrock Art Studio`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <PageLayout eyebrow="For sale" title={product.title} width="full">
      <p className="max-w-2xl text-lg text-stone-300/95 sm:text-xl">
        {product.artist} · {product.year}
      </p>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="relative overflow-hidden rounded-4xl border-2 border-slate-600/40 bg-slate-900/50 shadow-2xl shadow-slate-950/40">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={product.image}
              alt={`${product.title} by ${product.artist}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/50 p-8 shadow-inner shadow-slate-950/40 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Price
            </p>
            <p className="mt-3 font-serif text-4xl font-medium tabular-nums tracking-[-0.03em] text-stone-100 sm:text-5xl">
              {formatUsd(product.priceUsd)}
            </p>
            <p className="mt-2 text-sm text-stone-500">{product.edition}</p>

            <dl className="mt-8 space-y-4 border-t border-white/5 pt-8 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Medium</dt>
                <dd className="text-right text-stone-200">{product.medium}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Dimensions</dt>
                <dd className="text-right text-stone-200">
                  {product.dimensions}
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <AddToCartButton product={product} className="sm:min-w-[200px]" />
              <Link
                href="/shop"
                className="text-center text-sm font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 transition hover:text-stone-200"
              >
                ← Back to shop
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-base leading-8 text-stone-200/90">
            <p>{product.description}</p>
            <p className="text-sm leading-7 text-stone-500">
              Taxes may apply based on your location. Crating, insurance, and
              shipping are calculated at checkout. Wire the payment step to
              Stripe or your processor when you&apos;re ready to take live
              payments.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
