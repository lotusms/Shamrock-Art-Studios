"use client";

import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useCart } from "@/context/CartContext";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as overlayChrome from "@/lib/overlayChrome";
import { formatUsd } from "@/lib/money";
import {
  orderTotal,
  shippingIncludedForLines,
} from "@/lib/checkout";
import { isLightThemeId } from "@/theme";

export default function CartPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const { lines, ready, setQuantity, removeLine, subtotalUsd } = useCart();
  const shippingIncluded = shippingIncludedForLines(lines);
  const shipping = shippingIncluded ? 0 : null;
  const total = orderTotal(subtotalUsd, lines) + (shipping ?? 0);

  if (!ready) {
    return (
      <PageLayout eyebrow="Cart" title="Your cart" width="wide">
        <p className={overlayChrome.pageMutedText(light)}>Loading cart…</p>
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
        <PrimaryButton href="/shop" className="w-fit px-8">
          Continue shopping
        </PrimaryButton>
      </PageLayout>
    );
  }

  return (
    <PageLayout eyebrow="Cart" title="Your cart" width="full">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        <ul className="space-y-6">
          {lines.map((line) => (
            <li key={line.lineKey} className={overlayChrome.cartLineCard(light)}>
              <Link
                href={`/shop/${line.slug}`}
                className={overlayChrome.cartThumbBorder(light)}
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
                  className={overlayChrome.cartTitleLink(light)}
                >
                  {line.title}
                </Link>
                <p className={overlayChrome.cartPriceEach(light)}>
                  {formatUsd(line.priceUsd)} each
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <label className={overlayChrome.cartQtyLabel(light)}>
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(e) => setQuantity(line.lineKey, e.target.value)}
                      className={overlayChrome.cartQtyInput(light)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLine(line.lineKey)}
                    className={overlayChrome.cartRemoveLink(light)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className={overlayChrome.cartLineTotal(light)}>
                {formatUsd(line.priceUsd * line.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <aside className={overlayChrome.cartSummaryAside(light)}>
          <p className={overlayChrome.cartSummaryHeading(light)}>Summary</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className={overlayChrome.cartSummaryDt(light)}>Subtotal</dt>
              <dd className={overlayChrome.cartSummaryDd(light)}>
                {formatUsd(subtotalUsd)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={overlayChrome.cartSummaryDt(light)}>Shipping</dt>
              <dd className={overlayChrome.cartSummaryDd(light)}>
                {shippingIncluded ? (
                  <span className={overlayChrome.cartShippingComplimentary(light)}>
                    Complimentary
                  </span>
                ) : shipping === null ? (
                  <span className={overlayChrome.cartSummaryDt(light)}>
                    Calculated at checkout
                  </span>
                ) : (
                  formatUsd(shipping)
                )}
              </dd>
            </div>
            {shippingIncluded && (
              <p className={overlayChrome.cartSummaryShippingNote(light)}>
                Shipping is included in product pricing.
              </p>
            )}
            <div className={overlayChrome.cartSummaryTotalRow(light)}>
              <dt className={overlayChrome.cartSummaryTotalLabel(light)}>Total</dt>
              <dd className={overlayChrome.cartSummaryTotalValue(light)}>
                {formatUsd(total)}
              </dd>
            </div>
          </dl>
          <PrimaryButton href="/checkout" className="mt-8 w-full">
            Checkout
          </PrimaryButton>
          <SecondaryButton
            href="/shop"
            className={`mt-4 ${overlayChrome.secondaryButtonLightOutline(light)}`.trim()}
          >
            Continue shopping
          </SecondaryButton>
        </aside>
      </div>
    </PageLayout>
  );
}
