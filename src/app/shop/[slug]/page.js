import Image from "next/image";
import { notFound } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import ProductPurchasePanel from "@/components/shop/ProductPurchasePanel";
import { getCatalogProductBySlug } from "@/lib/printful/catalog";

export const dynamic = "force-dynamic";

function renderDescription(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim());
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i += 1;
      continue;
    }

    if (/^(•|-|\*)\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^(•|-|\*)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^(•|-|\*)\s+/, "").trim());
        i += 1;
      }
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc pl-6">
          {items.map((item, idx) => (
            <li key={`item-${idx}`}>{item}</li>
          ))}
        </ul>,
      );
      continue;
    }

    blocks.push(<p key={`p-${blocks.length}`}>{line}</p>);
    i += 1;
  }

  return blocks;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Work not found" };
  return {
    title: `${product.title} | Shop | Shamrock Art Studio`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  return (
    <PageLayout eyebrow={product.medium} title={product.title} width="full">
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="overflow-hidden border-2 border-slate-600/40 bg-slate-900/50 shadow-2xl shadow-slate-950/40">
          <Image
            src={product.image}
            alt={`${product.title} by ${product.artist}`}
            width={1200}
            height={1200}
            priority
            className="h-auto w-full object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col">
          <ProductPurchasePanel product={product} />

          <div className="mt-8 space-y-4 text-sm leading-8 text-stone-200/90">
            {renderDescription(product.description)}
            {/* <p className="text-sm leading-7 text-stone-500">
              Taxes may apply based on your location. Crating, insurance, and
              shipping are calculated at checkout. Wire the payment step to
              Stripe or your processor when you&apos;re ready to take live
              payments.
            </p> */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
