import { NextResponse } from "next/server";
import { createPrintfulOrder } from "@/lib/printful/orders";
import { isPrintfulEnabled } from "@/lib/printful/client";
import {
  isPayPalConfigured,
  paypalCaptureCheckoutOrder,
  paypalCapturedAmountUsd,
  paypalCaptureId,
} from "@/lib/paypal/server";
import {
  emailResultForClient,
  sendOrderConfirmationEmails,
} from "@/lib/email/order-emails.mjs";

function sameMoney(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.005;
}

function validateOrder(order) {
  if (!order || typeof order !== "object") return "Invalid order.";
  if (!order.id || typeof order.id !== "string") return "Order id required.";
  if (!order.email || typeof order.email !== "string") return "Email required.";
  if (!order.shippingAddress || typeof order.shippingAddress !== "object") {
    return "Shipping address required.";
  }
  const a = order.shippingAddress;
  if (!a.fullName || !a.address1 || !a.city || !a.state || !a.postalCode) {
    return "Complete shipping address required.";
  }
  if (!Array.isArray(order.lines) || order.lines.length === 0) {
    return "Cart lines required.";
  }
  const sub = Number(order.subtotalUsd);
  const ship = Number(order.shippingUsd);
  const tot = Number(order.totalUsd);
  if (!Number.isFinite(sub) || !Number.isFinite(ship) || !Number.isFinite(tot)) {
    return "Invalid order totals.";
  }
  if (!sameMoney(tot, sub + ship)) {
    return "Order total does not match subtotal and shipping.";
  }
  return null;
}

export async function POST(request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured on the server." },
        { status: 503 },
      );
    }

    const payload = await request.json().catch(() => ({}));
    const paypalOrderID = payload?.paypalOrderID;
    const order = payload?.order;

    if (!paypalOrderID || typeof paypalOrderID !== "string") {
      return NextResponse.json(
        { error: "Missing PayPal order id." },
        { status: 400 },
      );
    }

    const orderErr = validateOrder(order);
    if (orderErr) {
      return NextResponse.json({ error: orderErr }, { status: 400 });
    }

    const captured = await paypalCaptureCheckoutOrder(paypalOrderID);
    const status = captured?.status;
    if (status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal order not completed (status: ${status ?? "unknown"}).` },
        { status: 400 },
      );
    }

    const paidUsd = paypalCapturedAmountUsd(captured);
    if (paidUsd === null) {
      return NextResponse.json(
        { error: "Could not read captured amount from PayPal." },
        { status: 502 },
      );
    }

    if (!sameMoney(paidUsd, order.totalUsd)) {
      return NextResponse.json(
        {
          error: "Captured PayPal amount does not match order total.",
        },
        { status: 400 },
      );
    }

    const captureId = paypalCaptureId(captured);
    const payment = {
      provider: "paypal",
      paypalOrderId: paypalOrderID,
      paypalCaptureId: captureId,
    };

    let fulfillment = {
      provider: "demo",
      printfulOrderId: null,
      printfulStatus: null,
    };

    if (isPrintfulEnabled()) {
      try {
        const created = await createPrintfulOrder(order);
        fulfillment = {
          provider: "printful",
          printfulOrderId: created?.id ?? null,
          printfulStatus: created?.status ?? null,
        };
      } catch (e) {
        console.error("[capture-order] Printful create failed after PayPal capture:", e);
        fulfillment = {
          provider: "printful",
          printfulOrderId: null,
          printfulStatus: "failed",
        };
      }
    }

    const emailResult = await sendOrderConfirmationEmails({
      order,
      payment,
      fulfillment,
    });

    return NextResponse.json({
      ok: true,
      mode: isPrintfulEnabled() ? "printful" : "demo",
      printfulOrderId: fulfillment.printfulOrderId,
      printfulStatus: fulfillment.printfulStatus,
      payment,
      email: emailResultForClient(emailResult),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PayPal capture failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
