"use client";

import Link from "next/link";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddressLine1Autocomplete from "@/components/checkout/AddressLine1Autocomplete";
import CheckoutAuthSection from "@/components/checkout/CheckoutAuthSection";
import PayPalCheckoutButtons from "@/components/checkout/PayPalCheckoutButtons";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SelectListbox from "@/components/ui/SelectListbox";
import PageLayout from "@/components/PageLayout";
import { useCart } from "@/context/CartContext";
import { formatUsd, roundUsd2 } from "@/lib/money";
import {
  orderTotal,
  shippingIncludedForLines,
  ORDER_EMAIL_STATUS_KEY,
  ORDER_STORAGE_KEY,
} from "@/lib/checkout";
import {
  CA_PROVINCE_SELECT_OPTIONS,
  normalizeStateCodeForPrintful,
  US_STATE_SELECT_OPTIONS,
} from "@/lib/printful/address";
import { saveOrderToFirestore } from "@/lib/orders-store";
import { makeOrderId } from "@/lib/make-order-id";
import Card from "@/components/ui/Card";
import {
  fetchUserAccountDoc,
  profileToCheckoutFormPatch,
} from "@/lib/checkout-auth";
import { CHECKOUT_COUNTRY_OPTIONS } from "@/lib/checkout-countries";
import { useAuth } from "@/context/AuthContext";

function digitsFromTelInput(value) {
  let d = String(value).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

function formatUsPhoneMask(digits) {
  if (digits.length === 0) return "";
  if (digits.length < 3) return `(${digits}`;
  if (digits.length === 3) return `(${digits})`;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidCheckoutEmail(value) {
  const v = String(value).trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
}

function computeCheckoutFieldErrors(form, ctx) {
  const { shippingIncluded, shippingLoading, shippingQuoteUsd, hasTouchedPostalCode } = ctx;
  const errors = {};

  const email = form.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!isValidCheckoutEmail(form.email)) {
    errors.email =
      "Use a complete address like name@example.com (include the part after @).";
  }

  const phoneDigits = digitsFromTelInput(form.phone);
  if (phoneDigits.length > 0 && phoneDigits.length < 10) {
    errors.phone = "Enter all 10 digits, or leave phone blank.";
  }

  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.address1.trim()) errors.address1 = "Address line 1 is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) {
    errors.state =
      form.country === "US"
        ? "Select a state."
        : form.country === "CA"
          ? "Select a province."
          : "State or region is required.";
  }
  if (!form.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  }

  if (
    hasTouchedPostalCode &&
    !shippingIncluded &&
    (shippingLoading || shippingQuoteUsd === null)
  ) {
    errors.shipping =
      "Enter your full address and wait until shipping is calculated.";
  }

  return errors;
}

function firstCheckoutErrorMessage(errors) {
  const order = [
    "email",
    "phone",
    "fullName",
    "address1",
    "city",
    "state",
    "postalCode",
    "shipping",
  ];
  for (const key of order) {
    if (errors[key]) return errors[key];
  }
  return Object.values(errors)[0] ?? "Check your details and try again.";
}

function scrollToFirstCheckoutFieldError(errors) {
  if (typeof document === "undefined") return;
  const order = [
    "email",
    "phone",
    "fullName",
    "address1",
    "city",
    "state",
    "postalCode",
    "shipping",
  ];
  queueMicrotask(() => {
    for (const key of order) {
      if (!errors[key]) continue;
      const el = document.querySelector(`[data-checkout-field="${key}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector(
          "input, select, textarea, button",
        );
        focusable?.focus();
        break;
      }
    }
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lines, ready, subtotalUsd, clearCart } = useCart();
  const prefillUidRef = useRef(null);
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
    notes: "",
  });

  const checkoutOrderIdRef = useRef(null);

  useEffect(() => {
    checkoutOrderIdRef.current = null;
  }, [lines]);

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

    const canQuoteShipping =
      String(recipient.address1 || "").trim() &&
      String(recipient.city || "").trim() &&
      String(recipient.state || "").trim() &&
      String(recipient.postalCode || "").trim();

    if (!canQuoteShipping) {
      setShippingQuoteUsd(null);
      setShippingLoading(false);
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
            ? roundUsd2(Number(data.shippingUsd))
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

  const shipping = roundUsd2(
    shippingIncluded ? 0 : (shippingQuoteUsd ?? 0),
  );
  const total = roundUsd2(
    orderTotal(subtotalUsd, lines) + (shippingIncluded ? 0 : shipping),
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  /** Fields the user has left (blur); used to show inline errors before submit. */
  const [blurredFields, setBlurredFields] = useState({});
  const [postalCodeTouched, setPostalCodeTouched] = useState(false);
  /** Avoid showing "empty cart" while navigating to thank-you after a successful order. */
  const [redirectingToThankYou, setRedirectingToThankYou] = useState(false);
  const applyCheckoutPrefill = useCallback((patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setPostalCodeTouched(true);
    setBlurredFields((prev) => ({
      ...prev,
      email: true,
      phone: true,
      fullName: true,
      address1: true,
      city: true,
      state: true,
      postalCode: true,
      shippingSection: true,
    }));
  }, []);

  useEffect(() => {
    if (!ready || authLoading) return;
    if (!user?.uid) {
      prefillUidRef.current = null;
      return;
    }
    if (prefillUidRef.current === user.uid) return;
    prefillUidRef.current = user.uid;

    let cancelled = false;
    (async () => {
      const d = await fetchUserAccountDoc(user.uid);
      if (cancelled) return;
      const patch = profileToCheckoutFormPatch(d, user.email);
      applyCheckoutPrefill(patch);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, authLoading, user?.uid, user?.email, applyCheckoutPrefill]);

  const validationCtx = useMemo(
    () => ({
      shippingIncluded,
      shippingLoading,
      shippingQuoteUsd,
      hasTouchedPostalCode: postalCodeTouched,
    }),
    [shippingIncluded, shippingLoading, shippingQuoteUsd, postalCodeTouched],
  );

  const fieldErrors = useMemo(() => {
    const all = computeCheckoutFieldErrors(form, validationCtx);
    if (showFieldErrors) return all;

    const out = {};
    const blurKeys = [
      "email",
      "phone",
      "fullName",
      "address1",
      "city",
      "state",
      "postalCode",
    ];
    for (const key of blurKeys) {
      if (blurredFields[key] && all[key]) out[key] = all[key];
    }
    if (blurredFields.shippingSection && all.shipping) {
      out.shipping = all.shipping;
    }
    return out;
  }, [showFieldErrors, blurredFields, form, validationCtx]);

  const checkoutValid = useMemo(
    () =>
      Object.keys(computeCheckoutFieldErrors(form, validationCtx)).length === 0,
    [form, validationCtx],
  );

  const paypalClientId =
    typeof process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === "string"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.trim()
      : "";

  if (!ready) {
    return (
      <PageLayout eyebrow="Checkout" title="Checkout" width="wide">
        <p className="text-stone-400">Loading…</p>
      </PageLayout>
    );
  }

  if (lines.length === 0) {
    if (redirectingToThankYou) {
      return (
        <PageLayout
          eyebrow="Checkout"
          title="Order placed"
          subtitle="Taking you to your confirmation…"
          width="wide"
        >
          <p className="text-sm text-stone-400">One moment.</p>
        </PageLayout>
      );
    }
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

  function toCheckoutCountry(value) {
    const code = String(value || "").toUpperCase();
    if (code === "US" || code === "CA" || code === "GB") return code;
    return "OTHER";
  }

  function applyAddressSuggestion(suggestion) {
    setForm((prev) => {
      const nextCountry = suggestion.country
        ? toCheckoutCountry(suggestion.country)
        : prev.country;
      const rawState = String(suggestion.state ?? "").trim() || prev.state;
      const state =
        nextCountry === "US" || nextCountry === "CA"
          ? normalizeStateCodeForPrintful(nextCountry, rawState)
          : rawState;

      return {
        ...prev,
        address1: String(suggestion.address1 ?? "").trim() || prev.address1,
        city: String(suggestion.city ?? "").trim() || prev.city,
        state: state || prev.state,
        postalCode: String(suggestion.postalCode ?? "").trim() || prev.postalCode,
        country: nextCountry,
      };
    });
    setPostalCodeTouched(true);
    setBlurredFields((prev) => ({
      ...prev,
      shippingSection: true,
      address1: true,
      city: true,
      state: true,
      postalCode: true,
    }));
  }

  function updateCountry(value) {
    setForm((f) => ({
      ...f,
      country: value,
      state: "",
    }));
  }

  function handlePhoneChange(e) {
    const digits = digitsFromTelInput(e.target.value);
    update("phone", formatUsPhoneMask(digits));
  }

  function markFieldBlurred(fieldKey, opts = { shippingSection: false }) {
    setBlurredFields((prev) => ({
      ...prev,
      [fieldKey]: true,
      ...(opts.shippingSection ? { shippingSection: true } : {}),
    }));
  }

  function buildOrder(options) {
    const resetId = options?.resetId === true;
    if (resetId) checkoutOrderIdRef.current = null;

    const errs = computeCheckoutFieldErrors(form, validationCtx);
    if (Object.keys(errs).length > 0) {
      setShowFieldErrors(true);
      const msg = firstCheckoutErrorMessage(errs);
      setSubmitError(msg);
      scrollToFirstCheckoutFieldError(errs);
      throw new Error(msg);
    }

    setSubmitError("");
    const email = form.email.trim();
    const orderId = checkoutOrderIdRef.current ?? makeOrderId();
    checkoutOrderIdRef.current = orderId;

    return {
      id: orderId,
      createdAt: new Date().toISOString(),
      email,
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
        originalImage: l.originalImage ?? l.image ?? null,
      })),
      subtotalUsd,
      shippingUsd: shipping,
      totalUsd: total,
      notes: form.notes.trim(),
    };
  }

  async function persistAndRedirect(order, fulfillmentExtras, emailMeta) {
    const orderWithFulfillment = {
      ...order,
      fulfillment: {
        provider: fulfillmentExtras.provider,
        providerOrderId: fulfillmentExtras.providerOrderId,
        providerStatus: fulfillmentExtras.providerStatus,
      },
      payment: fulfillmentExtras.payment ?? null,
    };

    try {
      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(orderWithFulfillment),
      );
    } catch {
      /* ignore */
    }

    try {
      if (emailMeta != null) {
        sessionStorage.setItem(ORDER_EMAIL_STATUS_KEY, JSON.stringify(emailMeta));
      }
    } catch {
      /* ignore */
    }

    let orderSaved = false;
    try {
      await Promise.race([
        saveOrderToFirestore(orderWithFulfillment),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firestore save timed out")), 15000),
        ),
      ]);
      orderSaved = true;
    } catch (error) {
      console.error(
        "[checkout] Firestore save failed:",
        error instanceof Error ? error.message : error,
      );
    }

    if (orderSaved && !user) {
      try {
        const r = await fetch("/api/useraccounts/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            guestCheckout: true,
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          console.warn(
            "[checkout] guest useraccount:",
            typeof j?.error === "string" ? j.error : r.status,
          );
        }
      } catch (e) {
        console.warn("[checkout] guest useraccount:", e);
      }
    }

    setRedirectingToThankYou(true);
    clearCart();
    router.push(`/checkout/thank-you?ref=${encodeURIComponent(order.id)}`);
  }

  async function handleDemoOrder() {
    setSubmitting(true);
    setSubmitError("");

    let order;
    try {
      order = buildOrder({ resetId: true });
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Check your details and try again.",
      );
      setSubmitting(false);
      return;
    }

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

      await persistAndRedirect(
        order,
        {
          provider: data.mode === "printful" ? "printful" : "demo",
          providerOrderId: data.printfulOrderId ?? null,
          providerStatus: data.printfulStatus ?? null,
          payment: null,
        },
        data.email,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not place order.",
      );
      setSubmitting(false);
    }
  }

  function handlePayPalPaid(result) {
    const { order, payment, mode, printfulOrderId, printfulStatus, email } =
      result;
    return persistAndRedirect(
      order,
      {
        provider: mode === "printful" ? "printful" : "demo",
        providerOrderId: printfulOrderId,
        providerStatus: printfulStatus,
        payment,
      },
      email,
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm text-stone-100 placeholder:text-slate-600 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/25";

  function fieldClass(fieldKey) {
    const invalid = Boolean(fieldErrors[fieldKey]);
    return `${inputClass} ${
      invalid
        ? "!border-rose-600 focus:!border-rose-600 focus:!ring-1 focus:!ring-rose-600/35"
        : ""
    }`;
  }

  const payDisabled = submitting || !checkoutValid;

  const checkoutBody = (
    <PageLayout
      eyebrow="Secure checkout"
      title="Checkout"
      subtitle="Guest checkout is available below. Create an account or sign in to save your details to your profile."
      width="full"
      buttonArea={
        <PrimaryButton href="/cart" className="px-4 py-2" icon={<span>←</span>}>
          Back to cart
        </PrimaryButton>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
        <div className="space-y-8">
          <CheckoutAuthSection onApplyPrefill={applyCheckoutPrefill} />
          <Card variant="inset" className="w-full" title="Contact" titleTag="h4"> 
            <div className="mt-6" data-checkout-field="email">
              <label className="block text-sm text-slate-400">
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={() => markFieldBlurred("email")}
                  className={fieldClass("email")}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "checkout-email-error" : undefined
                  }
                />
              </label>
              {fieldErrors.email ? (
                <p
                  id="checkout-email-error"
                  className="mt-1.5 text-xs text-rose-300"
                  role="alert"
                >
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>
            <div className="mt-4" data-checkout-field="phone">
              <label className="block text-sm text-slate-400">
                Phone (for carrier updates, optional)
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => markFieldBlurred("phone")}
                  className={fieldClass("phone")}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone ? "checkout-phone-error" : undefined
                  }
                />
              </label>
              {fieldErrors.phone ? (
                <p
                  id="checkout-phone-error"
                  className="mt-1.5 text-xs text-rose-300"
                  role="alert"
                >
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
          </Card>

          <Card variant="inset" className="w-full" title="Shipping" titleTag="h4" data-checkout-field="shipping">
            {fieldErrors.shipping ? (
              <p className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {fieldErrors.shipping}
              </p>
            ) : null}
            <div className="mt-6" data-checkout-field="fullName">
              <label className="block text-sm text-slate-400">
                Full name
                <input
                  required
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  onBlur={() =>
                    markFieldBlurred("fullName", { shippingSection: true })
                  }
                  className={fieldClass("fullName")}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? "checkout-fullName-error" : undefined
                  }
                />
              </label>
              {fieldErrors.fullName ? (
                <p
                  id="checkout-fullName-error"
                  className="mt-1.5 text-xs text-rose-300"
                  role="alert"
                >
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>
            <AddressLine1Autocomplete
              className="mt-4"
              data-checkout-field="address1"
              label="Address line 1"
              value={form.address1}
              onChange={(v) => update("address1", v)}
              country={form.country}
              onSelectSuggestion={applyAddressSuggestion}
              inputClassName={fieldClass("address1")}
              required
              onBlur={() =>
                markFieldBlurred("address1", { shippingSection: true })
              }
              aria-invalid={Boolean(fieldErrors.address1)}
              aria-describedby={
                fieldErrors.address1 ? "checkout-address1-error" : undefined
              }
              errorMessage={fieldErrors.address1}
              errorId="checkout-address1-error"
            />
            <label className="mt-4 block text-sm text-slate-400">
              Address line 2
              <input
                type="text"
                autoComplete="address-line2"
                value={form.address2}
                onChange={(e) => update("address2", e.target.value)}
                onBlur={() => markFieldBlurred("address2", { shippingSection: true })}
                className={inputClass}
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div data-checkout-field="city">
                <label className="block text-sm text-slate-400">
                  City
                  <input
                    required
                    type="text"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    onBlur={() =>
                      markFieldBlurred("city", { shippingSection: true })
                    }
                    className={fieldClass("city")}
                    aria-invalid={Boolean(fieldErrors.city)}
                    aria-describedby={
                      fieldErrors.city ? "checkout-city-error" : undefined
                    }
                  />
                </label>
                {fieldErrors.city ? (
                  <p
                    id="checkout-city-error"
                    className="mt-1.5 text-xs text-rose-300"
                    role="alert"
                  >
                    {fieldErrors.city}
                  </p>
                ) : null}
              </div>
              <div data-checkout-field="state">
                {form.country === "US" ? (
                  <SelectListbox
                    label="State"
                    placeholder="Select state"
                    options={US_STATE_SELECT_OPTIONS}
                    valueKey="code"
                    labelKey="label"
                    by="code"
                    value={form.state}
                    onChange={(code) => update("state", code)}
                    invalid={Boolean(fieldErrors.state)}
                    ariaDescribedBy={
                      fieldErrors.state ? "checkout-state-error" : undefined
                    }
                    onMenuClosed={() =>
                      markFieldBlurred("state", { shippingSection: true })
                    }
                    buttonClassName={fieldClass("state")}
                  />
                ) : form.country === "CA" ? (
                  <SelectListbox
                    label="Province"
                    placeholder="Select province"
                    options={CA_PROVINCE_SELECT_OPTIONS}
                    valueKey="code"
                    labelKey="label"
                    by="code"
                    value={form.state}
                    onChange={(code) => update("state", code)}
                    invalid={Boolean(fieldErrors.state)}
                    ariaDescribedBy={
                      fieldErrors.state ? "checkout-state-error" : undefined
                    }
                    onMenuClosed={() =>
                      markFieldBlurred("state", { shippingSection: true })
                    }
                    buttonClassName={fieldClass("state")}
                  />
                ) : (
                  <label className="block text-sm text-slate-400">
                    State / region
                    <input
                      required
                      type="text"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      onBlur={() =>
                        markFieldBlurred("state", { shippingSection: true })
                      }
                      className={fieldClass("state")}
                      aria-invalid={Boolean(fieldErrors.state)}
                      aria-describedby={
                        fieldErrors.state ? "checkout-state-error" : undefined
                      }
                    />
                  </label>
                )}
                {fieldErrors.state ? (
                  <p
                    id="checkout-state-error"
                    className="mt-1.5 text-xs text-rose-300"
                    role="alert"
                  >
                    {fieldErrors.state}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div data-checkout-field="postalCode">
                <label className="block text-sm text-slate-400">
                  {form.country === "US" ? "ZIP code" : "Postal code"}
                  <input
                    required
                    type="text"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(e) => {
                      update("postalCode", e.target.value);
                      setPostalCodeTouched(true);
                    }}
                    onBlur={() =>
                      markFieldBlurred("postalCode", { shippingSection: true })
                    }
                    className={fieldClass("postalCode")}
                    aria-invalid={Boolean(fieldErrors.postalCode)}
                    aria-describedby={
                      fieldErrors.postalCode
                        ? "checkout-postalCode-error"
                        : undefined
                    }
                  />
                </label>
                {fieldErrors.postalCode ? (
                  <p
                    id="checkout-postalCode-error"
                    className="mt-1.5 text-xs text-rose-300"
                    role="alert"
                  >
                    {fieldErrors.postalCode}
                  </p>
                ) : null}
              </div>
              <div data-checkout-field="country">
                <SelectListbox
                  label="Country"
                  placeholder="Select country"
                  options={CHECKOUT_COUNTRY_OPTIONS}
                  value={form.country}
                  onChange={updateCountry}
                  onMenuClosed={() =>
                    markFieldBlurred("country", { shippingSection: true })
                  }
                  buttonClassName={inputClass}
                />
              </div>
            </div>
          </Card>

          <Card variant="inset" className="w-full" title="Order notes" titleTag="h4">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={`${inputClass} mt-3 resize-none`}
              placeholder="Installation deadline, VAT ID, shipping window…"
            />
          </Card>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-28">
          <Card variant="inset" className="w-full" title="Order summary" titleTag="h4">
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
            {payDisabled && !submitting && !checkoutValid ? (
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
                Complete the form with a valid email and full shipping address.
                {!shippingIncluded &&
                (shippingLoading || shippingQuoteUsd === null)
                  ? " Wait for the shipping quote before paying."
                  : null}
              </p>
            ) : null}
            {paypalClientId ? (
              <PayPalCheckoutButtons
                disabled={payDisabled}
                buildOrder={() => buildOrder()}
                onBusy={setSubmitting}
                onError={setSubmitError}
                onPaid={handlePayPalPaid}
              />
            ) : null}
            {!paypalClientId ? (
              <PrimaryButton
                onClick={handleDemoOrder}
                disabled={payDisabled}
                className="mt-8 w-full py-4 shadow-slate-900/40"
              >
                {submitting ? "Placing order…" : "Place order (demo)"}
              </PrimaryButton>
            ) : null}
            {submitError ? (
              <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
                {submitError}
              </p>
            ) : null}
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
              By completing checkout you agree to inspection, crating, and final
              shipping terms where applicable.
            </p>
          </Card>
        </aside>
      </div>
    </PageLayout>
  );

  if (paypalClientId) {
    return (
      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          currency: "USD",
          intent: "capture",
          components: "buttons,card-fields",
          // Do not set disableFunding=card — it makes CardFields.isEligible() false
          // so Advanced Checkout fields never render. Use standalone buttons for PayPal / Pay Later only.
        }}
      >
        {checkoutBody}
      </PayPalScriptProvider>
    );
  }

  return checkoutBody;
}
