"use client";

import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { useCart } from "@/context/CartContext";
import { formatUsd } from "@/lib/money";
import {
  orderTotal,
  shippingForSubtotal,
  SHIPPING_FLAT_USD,
  FREE_SHIPPING_THRESHOLD_USD,
} from "@/lib/checkout";

export default function CartPage() {
  const { lines, ready, setQuantity, removeLine, subtotalUsd } = useCart();
  const shipping = shippingForSubtotal(subtotalUsd);
  const total = orderTotal(subtotalUsd);

  if (!ready) {
    return (
      <PageLayout eyebrow="Cart" title="Your cart" width="wide">
        <p className="text-stone-400">Loading cart…</p>
      </PageLayout>
    );
  }

  if (lines.length === 0) {
    return (
      <PageLayout
        eyebrow="Cart"
        title="Your cart is empty"
        subtitle="Browse the shop and add a piece you love—inventory updates here in real time."
        width="wide"
      >
        <Link
          href="/shop"
          className="inline-flex w-fit rounded-full border-2 border-slate-500/50 bg-slate-900/55 px-8 py-3.5 text-sm font-semibold text-stone-100 shadow-inner shadow-slate-950/40 transition hover:border-amber-400/45 hover:bg-slate-800/65"
        >
          Continue shopping
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout eyebrow="Cart" title="Your cart" width="full">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        <ul className="space-y-6">
          {lines.map((line) => (
            <li
              key={line.lineKey}
              className="flex gap-5 rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-4 shadow-lg shadow-slate-950/25 sm:p-5"
            >
              <Link
                href={`/shop/${line.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-32 sm:w-28"
              >
                <Image
                  src={line.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/shop/${line.slug}`}
                  className="font-serif text-lg font-medium tracking-[-0.02em] text-stone-100 transition hover:text-amber-100 sm:text-xl"
                >
                  {line.title}
                </Link>
                <p className="mt-1 text-sm text-stone-500">{line.artist}</p>
                <p className="mt-3 text-sm tabular-nums text-amber-200/90">
                  {formatUsd(line.priceUsd)} each
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(e) => setQuantity(line.lineKey, e.target.value)}
                      className="w-16 rounded-lg border border-slate-600 bg-slate-950/80 px-2 py-1.5 text-center text-sm text-stone-200 tabular-nums focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLine(line.lineKey)}
                    className="text-xs uppercase tracking-[0.2em] text-slate-500 underline decoration-slate-600 underline-offset-4 transition hover:text-amber-200/90"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="hidden text-right text-sm font-semibold tabular-nums text-stone-100 sm:block">
                {formatUsd(line.priceUsd * line.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300">
            Summary
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Subtotal</dt>
              <dd className="tabular-nums text-stone-200">
                {formatUsd(subtotalUsd)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Shipping</dt>
              <dd className="tabular-nums text-stone-200">
                {shipping === 0 ? (
                  <span className="text-emerald-400/90">Complimentary</span>
                ) : (
                  formatUsd(shipping)
                )}
              </dd>
            </div>
            {subtotalUsd < FREE_SHIPPING_THRESHOLD_USD && (
              <p className="border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-500">
                Free insured shipping on orders {formatUsd(FREE_SHIPPING_THRESHOLD_USD)}+.
                Flat {formatUsd(SHIPPING_FLAT_USD)} below that.
              </p>
            )}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-4 text-base font-semibold">
              <dt className="text-stone-200">Total</dt>
              <dd className="tabular-nums text-amber-200">{formatUsd(total)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-8 flex w-full items-center justify-center rounded-full bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/35 ring-2 ring-white/30 transition hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-400/25"
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-4 block text-center text-sm text-slate-500 underline decoration-slate-600 underline-offset-4 transition hover:text-stone-300"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </PageLayout>
  );
}
