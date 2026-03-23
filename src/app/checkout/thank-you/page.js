"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { formatUsd } from "@/lib/money";
import { ORDER_STORAGE_KEY } from "@/lib/checkout";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (ref && parsed.id === ref) setOrder(parsed);
      else if (!ref && parsed.id) setOrder(parsed);
    } catch {
      /* ignore */
    }
  }, [ref]);

  if (!order) {
    return (
      <PageLayout
        eyebrow="Order"
        title="Thanks for visiting"
        subtitle="We couldn’t load your order details—open this page from a completed checkout, or return home."
        width="wide"
      >
        <Link
          href="/shop"
          className="inline-flex w-fit rounded-full border-2 border-slate-500/50 bg-slate-900/55 px-8 py-3.5 text-sm font-semibold text-stone-100 transition hover:border-amber-400/45"
        >
          Back to shop
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      eyebrow="Confirmed"
      title="Thank you"
      subtitle="Your order is recorded and ready for fulfillment."
      width="wide"
    >
      <div className="rounded-4xl border-2 border-emerald-500/25 bg-slate-900/50 p-8 shadow-lg shadow-slate-950/30">
        <p className="text-xs uppercase tracking-[0.32em] text-emerald-400/90">
          Order reference
        </p>
        <p className="mt-2 font-mono text-xl font-medium tracking-wide text-stone-100">
          {order.id}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {new Date(order.createdAt).toLocaleString()}
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.28em] text-slate-500">
          Fulfillment
        </p>
        <p className="mt-2 text-sm text-stone-300">
          {order.fulfillment?.provider === "printful"
            ? "Printful connected"
            : "Demo mode"}
          {order.fulfillment?.providerOrderId
            ? ` · ID ${order.fulfillment.providerOrderId}`
            : ""}
        </p>
      </div>

      <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Ship to
        </p>
        <p className="mt-4 text-stone-200">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.address1}
          {order.shippingAddress.address2 ? (
            <>
              <br />
              {order.shippingAddress.address2}
            </>
          ) : null}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country}
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.28em] text-slate-500">
          Confirmation email
        </p>
        <p className="mt-2 text-amber-200/90">{order.email}</p>
      </div>

      <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
          Items
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {order.lines.map((l) => (
            <li
              key={l.productId}
              className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <span className="text-stone-300">
                {l.title}{" "}
                <span className="text-slate-500">×{l.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums text-stone-200">
                {formatUsd(l.priceUsd * l.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Subtotal</dt>
            <dd className="tabular-nums">{formatUsd(order.subtotalUsd)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Shipping</dt>
            <dd className="tabular-nums">
              {order.shippingUsd === 0 ? (
                <span className="text-emerald-400/90">Complimentary</span>
              ) : (
                formatUsd(order.shippingUsd)
              )}
            </dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-amber-200">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatUsd(order.totalUsd)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-lg ring-2 ring-white/30 transition hover:scale-[1.02]"
        >
          Continue shopping
        </Link>
        <Link
          href="/contact"
          className="inline-flex rounded-full border-2 border-slate-600/50 px-8 py-3.5 text-sm font-semibold text-stone-200 transition hover:border-amber-400/35"
        >
          Questions? Contact
        </Link>
      </div>
    </PageLayout>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <PageLayout eyebrow="Order" title="Loading…" width="wide">
          <p className="text-stone-400">Loading order…</p>
        </PageLayout>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
