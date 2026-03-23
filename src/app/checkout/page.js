"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useCart } from "@/context/CartContext";
import { formatUsd } from "@/lib/money";
import {
  orderTotal,
  shippingIncludedForLines,
  ORDER_STORAGE_KEY,
} from "@/lib/checkout";

function makeOrderId() {
  return `ORD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, ready, subtotalUsd, clearCart } = useCart();
  const shippingIncluded = shippingIncludedForLines(lines);
  const [shippingQuoteUsd, setShippingQuoteUsd] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    cardName: "",
    notes: "",
  });

  const recipient = useMemo(
    () => ({
      address1: form.address1,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      countryCode: form.country,
    }),
    [form.address1, form.city, form.state, form.postalCode, form.country],
  );

  useEffect(() => {
    if (!ready || lines.length === 0 || shippingIncluded) {
      setShippingQuoteUsd(shippingIncluded ? 0 : null);
      return;
    }

    if (!recipient.countryCode) {
      setShippingQuoteUsd(null);
      return;
    }

    let active = true;
    setShippingLoading(true);
    const id = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient,
            lines: lines.map((l) => ({
              catalogVariantId: l.catalogVariantId,
              quantity: l.quantity,
            })),
          }),
        });
        const data = await response.json();
        if (!active) return;
        setShippingQuoteUsd(
          response.ok && data?.ok && Number.isFinite(Number(data.shippingUsd))
            ? Number(data.shippingUsd)
            : null,
        );
      } catch {
        if (!active) return;
        setShippingQuoteUsd(null);
      } finally {
        if (!active) return;
        setShippingLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(id);
    };
  }, [ready, lines, recipient, shippingIncluded]);

  const shipping = shippingIncluded ? 0 : (shippingQuoteUsd ?? 0);
  const total = orderTotal(subtotalUsd, lines) + (shippingIncluded ? 0 : shipping);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!ready) {
    return (
      <PageLayout eyebrow="Checkout" title="Checkout" width="wide">
        <p className="text-stone-400">Loading…</p>
      </PageLayout>
    );
  }

  if (lines.length === 0) {
    return (
      <PageLayout
        eyebrow="Checkout"
        title="Nothing to checkout"
        subtitle="Your cart is empty."
        width="wide"
      >
        <Link
          href="/shop"
          className="inline-flex w-fit rounded-full border-2 border-slate-500/50 bg-slate-900/55 px-8 py-3.5 text-sm font-semibold text-stone-100 transition hover:border-amber-400/45"
        >
          Browse shop
        </Link>
      </PageLayout>
    );
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const orderId = makeOrderId();
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shippingAddress: {
        fullName: form.fullName.trim(),
        address1: form.address1.trim(),
        address2: form.address2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country,
      },
      lines: lines.map((l) => ({
        productId: l.productId,
        printfulProductId: l.printfulProductId ?? null,
        variantId: l.variantId ?? null,
        catalogVariantId: l.catalogVariantId ?? null,
        externalId: l.externalId ?? null,
        slug: l.slug,
        title: l.title,
        artist: l.artist,
        priceUsd: l.priceUsd,
        sku: l.sku ?? null,
        quantity: l.quantity,
        image: l.image,
      })),
      subtotalUsd,
      shippingUsd: shipping,
      totalUsd: total,
      notes: form.notes.trim(),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Could not place order.");
      }

      const orderWithFulfillment = {
        ...order,
        fulfillment: {
          provider: data.mode === "printful" ? "printful" : "demo",
          providerOrderId: data.printfulOrderId ?? null,
          providerStatus: data.printfulStatus ?? null,
        },
      };

      try {
        sessionStorage.setItem(
          ORDER_STORAGE_KEY,
          JSON.stringify(orderWithFulfillment),
        );
      } catch {
        /* ignore */
      }

      clearCart();
      router.push(`/checkout/thank-you?ref=${encodeURIComponent(orderId)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not place order.",
      );
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm text-stone-100 placeholder:text-slate-600 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/25";

  return (
    <PageLayout
      eyebrow="Secure checkout"
      title="Checkout"
      subtitle="Orders route through connected fulfillment when API credentials are set; otherwise checkout runs in local demo mode."
      width="full"
    >
      <form
        onSubmit={handleSubmit}
        className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16"
      >
        <div className="space-y-8">
          <section className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 sm:p-8">
            <h2 className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
              Contact
            </h2>
            <label className="mt-6 block text-sm text-slate-400">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block text-sm text-slate-400">
              Phone (for carrier updates)
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
              />
            </label>
          </section>

          <section className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 sm:p-8">
            <h2 className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
              Shipping
            </h2>
            <label className="mt-6 block text-sm text-slate-400">
              Full name
              <input
                required
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block text-sm text-slate-400">
              Address line 1
              <input
                required
                type="text"
                autoComplete="address-line1"
                value={form.address1}
                onChange={(e) => update("address1", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block text-sm text-slate-400">
              Address line 2
              <input
                type="text"
                autoComplete="address-line2"
                value={form.address2}
                onChange={(e) => update("address2", e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                City
                <input
                  required
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-slate-400">
                State / region
                <input
                  required
                  type="text"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                Postal code
                <input
                  required
                  type="text"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-slate-400">
                Country
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className={inputClass}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 sm:p-8">
            <h2 className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
              Payment
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              This template creates a fulfillment order through the connected
              provider. Add Stripe to capture payment before creating shipment.
            </p>
            <label className="mt-6 block text-sm text-slate-400">
              Name on card
              <input
                type="text"
                autoComplete="cc-name"
                placeholder="As shown on card"
                value={form.cardName}
                onChange={(e) => update("cardName", e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                Card number
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className={inputClass}
                  disabled
                />
              </label>
              <label className="block text-sm text-slate-400">
                Exp / CVC
                <input
                  type="text"
                  disabled
                  placeholder="Disabled in demo"
                  className={`${inputClass} opacity-60`}
                />
              </label>
            </div>
          </section>

          <label className="block rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 sm:p-8">
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Order notes
            </span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={`${inputClass} mt-3 resize-none`}
              placeholder="Installation deadline, VAT ID, shipping window…"
            />
          </label>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-28">
          <div className="rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/50 to-slate-950/50 p-8 shadow-xl ring-2 ring-slate-500/15 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.32em] text-amber-300">
              Order summary
            </p>
            <ul className="mt-6 max-h-48 space-y-3 overflow-y-auto text-sm">
              {lines.map((l) => (
                <li
                  key={l.lineKey}
                  className="flex justify-between gap-3 text-stone-300"
                >
                  <span className="min-w-0 truncate">
                    {l.title}{" "}
                    <span className="text-slate-500">×{l.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-stone-200">
                    {formatUsd(l.priceUsd * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-white/5 pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="tabular-nums">{formatUsd(subtotalUsd)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Shipping</dt>
                <dd className="tabular-nums">
                  {shippingIncluded ? (
                    <span className="text-emerald-400/90">Complimentary</span>
                  ) : shippingLoading ? (
                    <span className="text-slate-400">Calculating…</span>
                  ) : shippingQuoteUsd === null ? (
                    <span className="text-slate-400">Enter address to calculate</span>
                  ) : (
                    formatUsd(shipping)
                  )}
                </dd>
              </div>
              {shippingIncluded && (
                <p className="text-xs text-slate-500">
                  Shipping is included in product pricing.
                </p>
              )}
              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-semibold">
                <dt className="text-stone-100">Total</dt>
                <dd className="tabular-nums text-amber-200">
                  {formatUsd(total)}
                </dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full rounded-full bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 py-4 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/40 ring-2 ring-white/30 transition hover:scale-[1.01] hover:shadow-xl disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
            {submitError ? (
              <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
                {submitError}
              </p>
            ) : null}
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
              By placing this demo order you agree to inspection, crating, and
              final shipping quotes where applicable.
            </p>
          </div>
          <Link
            href="/cart"
            className="block text-center text-sm text-slate-500 underline decoration-slate-600 underline-offset-4 transition hover:text-stone-300"
          >
            ← Back to cart
          </Link>
        </aside>
      </form>
    </PageLayout>
  );
}
