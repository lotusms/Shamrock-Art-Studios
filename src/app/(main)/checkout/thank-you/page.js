"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { formatUsd } from "@/lib/money";
import { ORDER_EMAIL_STATUS_KEY, ORDER_STORAGE_KEY } from "@/lib/checkout";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [emailNotice, setEmailNotice] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_EMAIL_STATUS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      sessionStorage.removeItem(ORDER_EMAIL_STATUS_KEY);
      if (parsed && typeof parsed === "object" && parsed.ok === false) {
        setEmailNotice(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

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
        <PrimaryButton href="/shop" className="w-fit px-8">
          Back to shop
        </PrimaryButton>
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
      {emailNotice ? (
        <div
          className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-950/40 px-4 py-3 text-sm text-amber-100/95"
          role="status"
        >
          <p className="font-medium text-amber-200">
            Confirmation email could not be sent automatically.
          </p>
          <p className="mt-1 text-amber-100/85">
            {emailNotice.skipped && emailNotice.reason === "smtp_not_configured"
              ? "The shop’s mail settings are not configured on this server (for example on Vercel, add the same SMTP variables you use locally)."
              : "You can still use the order number on this page for your records. If you need a receipt, contact us with your order number."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row gap-4">

        <Card variant="inset" className="w-full" title="Order reference" titleTag="h4">
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
        </Card>

        <Card variant="inset" className="w-full" title="Ship to" titleTag="h4">
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
        </Card>
      </div>

      <Card variant="inset" className="w-full" title="Items" titleTag="h4">
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
      </Card>

      <div className="flex flex-row justify-end gap-4">
        <SecondaryButton href="/contact" className="px-2 py-3.5">
          Questions? Contact
        </SecondaryButton>
        <PrimaryButton href="/shop" className="px-8">
          Continue shopping
        </PrimaryButton>
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
