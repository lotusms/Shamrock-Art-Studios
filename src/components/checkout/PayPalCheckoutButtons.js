"use client";

import { useCallback, useState } from "react";
import {
  FUNDING,
  PayPalButtons,
  PayPalCardFieldsForm,
  PayPalCardFieldsProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import PrimaryButton from "@/components/ui/PrimaryButton";

/**
 * Dark-theme styles for Advanced Card Fields (hosted inputs).
 * @see https://developer.paypal.com/docs/checkout/advanced/customize/card-field-style/
 */
const CARD_FIELDS_STYLE = {
  input: {
    "font-size": "16px",
    "font-family": "ui-sans-serif, system-ui, sans-serif",
    "font-weight": "400",
    color: "#f5e9c8",
    background: "rgba(11, 14, 20, 0.92)",
    border: "1px solid rgba(197, 160, 89, 0.35)",
    "border-radius": "12px",
    "box-shadow": "none",
    padding: "12px 14px",
    height: "48px",
  },
  ".invalid": {
    color: "#fda4af",
    border: "1px solid rgba(244, 63, 94, 0.65)",
  },
};

/**
 * @param {{
 *   disabled?: boolean;
 *   buildOrder: () => object;
 *   onBusy?: (busy: boolean) => void;
 *   onError?: (message: string) => void;
 *   onPaid: (data: { order: object; payment: object; mode: string; printfulOrderId: string | null; printfulStatus: string | null }) => void;
 * }} props
 */
export default function PayPalCheckoutButtons({
  disabled = false,
  buildOrder,
  onBusy,
  onError,
  onPaid,
}) {
  const createPayPalOrderId = useCallback(async () => {
    onError?.("");
    let order;
    try {
      order = buildOrder();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Check your details and try again.";
      onError?.(msg);
      throw new Error(msg);
    }

    onBusy?.(true);
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: order.totalUsd, currency: "USD" }),
      });
      const data = await response.json();
      if (!response.ok || !data?.id) {
        throw new Error(data?.error || "Could not start PayPal checkout.");
      }
      return data.id;
    } finally {
      onBusy?.(false);
    }
  }, [buildOrder, onBusy, onError]);

  const buttonStyle = { layout: "vertical", shape: "pill", label: "pay" };

  const sharedOnError = (err) => {
    const msg =
      typeof err?.message === "string" && err.message
        ? err.message
        : "PayPal encountered an error.";
    onError?.(msg);
  };

  const handleApprove = useCallback(
    async (data) => {
      const paypalOrderID = data?.orderID;
      if (!paypalOrderID || typeof paypalOrderID !== "string") {
        onError?.("PayPal did not return an order id.");
        return;
      }

      onError?.("");
      let order;
      try {
        order = buildOrder();
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Check your details and try again.";
        onError?.(msg);
        return;
      }

      onBusy?.(true);
      try {
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paypalOrderID,
            order,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result?.ok) {
          throw new Error(result?.error || "Payment could not be completed.");
        }
        await Promise.resolve(
          onPaid({
            order,
            payment: result.payment,
            mode: result.mode,
            printfulOrderId: result.printfulOrderId ?? null,
            printfulStatus: result.printfulStatus ?? null,
          }),
        );
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Payment could not be completed.";
        onError?.(msg);
      } finally {
        onBusy?.(false);
      }
    },
    [buildOrder, onBusy, onError, onPaid],
  );

  return (
    <div className="mt-6 space-y-2">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-amber-300/90">
          Pay with PayPal
        </p>
        <div className="flex flex-col gap-3">
          <PayPalButtons
            fundingSource={FUNDING.PAYPAL}
            disabled={disabled}
            style={buttonStyle}
            createOrder={createPayPalOrderId}
            onApprove={async (data) => {
              await handleApprove({ orderID: data.orderID });
            }}
            onError={sharedOnError}
          />
          <PayPalButtons
            fundingSource={FUNDING.PAYLATER}
            disabled={disabled}
            style={buttonStyle}
            createOrder={createPayPalOrderId}
            onApprove={async (data) => {
              await handleApprove({ orderID: data.orderID });
            }}
            onError={sharedOnError}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-amber-300/25" />
        <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-amber-300/90">
          OR
        </p>
        <div className="h-px flex-1 bg-amber-300/25" />
      </div>

      <div className="pt-2">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-amber-300/90">
          Pay with card
        </p>
        <p className="mb-4 text-xs leading-relaxed text-slate-400">
          No PayPal account? No problem. You can still pay with your card.
        </p>
        <PayPalCardFieldsProvider
          createOrder={createPayPalOrderId}
          onApprove={handleApprove}
          onError={(err) => {
            const msg =
              typeof err?.message === "string" && err.message
                ? err.message
                : "Card payment failed.";
            onError?.(msg);
          }}
          style={CARD_FIELDS_STYLE}
        >
          <div className="rounded-2xl border border-amber-400/20 bg-[#0b0e14]/80 p-4 sm:p-5 ring-1 ring-white/5">
            <PayPalCardFieldsForm className="flex flex-col" />
            <PayPalCardFieldsSubmit disabled={disabled} onError={onError} />
          </div>
        </PayPalCardFieldsProvider>
      </div>
    </div>
  );
}

/**
 * Submits the hosted card form via PayPal CardFields API.
 */
function PayPalCardFieldsSubmit({ disabled, onError }) {
  const { cardFieldsForm } = usePayPalCardFields();
  const [paying, setPaying] = useState(false);

  async function handleClick() {
    if (!cardFieldsForm) {
      onError?.("Card fields are still loading. Try again in a moment.");
      return;
    }
    let state;
    try {
      state = await cardFieldsForm.getState();
    } catch {
      onError?.("Could not read card form state.");
      return;
    }
    if (!state?.isFormValid) {
      onError?.("Check your card details and try again.");
      return;
    }
    onError?.("");
    setPaying(true);
    try {
      await cardFieldsForm.submit();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Card payment could not be started.";
      onError?.(msg);
    } finally {
      setPaying(false);
    }
  }

  return (
    <PrimaryButton
      disabled={disabled || paying}
      onClick={handleClick}
      className="mt-5 w-full ring-white/20"
    >
      {paying ? "Processing card…" : "Pay with card"}
    </PrimaryButton>
  );
}
