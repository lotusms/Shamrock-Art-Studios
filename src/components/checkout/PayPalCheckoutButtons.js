"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";

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
  return (
    <div className="mt-6">
      <PayPalButtons
        disabled={disabled}
        style={{ layout: "vertical", shape: "pill", label: "pay" }}
        createOrder={async () => {
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
        }}
        onApprove={async (data) => {
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
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paypalOrderID: data.orderID,
                order,
              }),
            });
            const result = await response.json();
            if (!response.ok || !result?.ok) {
              throw new Error(result?.error || "Payment could not be completed.");
            }
            onPaid({
              order,
              payment: result.payment,
              mode: result.mode,
              printfulOrderId: result.printfulOrderId ?? null,
              printfulStatus: result.printfulStatus ?? null,
            });
          } finally {
            onBusy?.(false);
          }
        }}
        onError={(err) => {
          const msg =
            typeof err?.message === "string" && err.message
              ? err.message
              : "PayPal encountered an error.";
          onError?.(msg);
        }}
      />
    </div>
  );
}
