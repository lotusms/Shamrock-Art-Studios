"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { formatUsd } from "@/lib/money";
import { ORDER_STORAGE_KEY } from "@/lib/checkout";

const OrderDetailsCard = ({ title, children }) => {
  return (
    <div className="rounded-4xl border-2 border-emerald-500/25 bg-slate-900/50 p-8 shadow-lg shadow-slate-950/30 w-full">
      <h4 className="text-xs uppercase tracking-[0.32em] text-emerald-400/90">
        {title}
      </h4>
      {children}
    </div>
  );
};

function ThankYouContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const order = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (ref && parsed.id === ref) return parsed;
      if (!ref && parsed.id) return parsed;
      return null;
    } catch {
      return null;
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
      <div className="flex flex-col md:flex-row gap-4">

        <OrderDetailsCard title="Order reference">
          <div className="flex flex-col mt-2">
            <p className="font-mono text-stone-100/80">
              Order #: {order.id}
            </p>
            <p className="font-mono text-stone-100/80">
              Order date: {new Date(order.createdAt).toLocaleString()}
            </p>            
            <p className="font-mono text-stone-100/80">
              {order.fulfillment?.provider === "printful"
                ? "Fulfillment provider"
                : "Demo mode"}
              {order.fulfillment?.providerOrderId
                ? `: ${order.fulfillment.providerOrderId}`
                : ""}
            </p>
            {order.payment?.provider === "paypal" ? (
              <p className="font-mono text-stone-100/80">
                
                {order.payment.paypalCaptureId
                  ? `Paid with PayPal: ${order.payment.paypalCaptureId}`
                  : ""}
              </p>
            ) : null}
          </div>
        </OrderDetailsCard>

        <OrderDetailsCard title="Ship to">
          <div className="flex flex-col mt-2">
            <p className="font-mono text-stone-100/80">
              {order.shippingAddress.fullName}
            </p>
            <p className="font-mono text-stone-100/80">
              {order.shippingAddress.address1}
              {order.shippingAddress.address2 ? (
                <>
                  <br />
                  {order.shippingAddress.address2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode} {" "}
              {order.shippingAddress.country}
            </p>
            <p className="font-mono text-stone-100/80">
              Email: <span className="text-amber-200/90">{order.email}</span>
            </p>
          </div>
        </OrderDetailsCard>
      </div>

      <OrderDetailsCard title="Items">
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
      </OrderDetailsCard>

      <div className="flex flex-row justify-end gap-4">
        <Link
          href="/contact"
          className="inline-flex rounded-full border-2 border-slate-600/50 px-8 py-3.5 text-sm font-semibold text-stone-200 transition hover:border-amber-400/35"
        >
          Questions? Contact
        </Link>
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-lg ring-2 ring-white/30 transition hover:scale-[1.02]"
        >
          Continue shopping
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
