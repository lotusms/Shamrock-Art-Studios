import { NextResponse } from "next/server";
import { createPrintfulOrder } from "@/lib/printful/orders";
import { isPrintfulEnabled } from "@/lib/printful/client";
import {
  emailResultForClient,
  sendOrderConfirmationEmails,
} from "@/lib/email/order-emails.mjs";

export async function POST(request) {
  try {
    const payload = await request.json();
    if (!payload?.order || !Array.isArray(payload.order?.lines)) {
      return NextResponse.json(
        { error: "Invalid checkout payload." },
        { status: 400 },
      );
    }

    const order = payload.order;

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
        console.error("[checkout] Printful create failed:", e);
        fulfillment = {
          provider: "printful",
          printfulOrderId: null,
          printfulStatus: "failed",
        };
      }
    }

    const emailResult = await sendOrderConfirmationEmails({
      order,
      payment: null,
      fulfillment,
    });

    return NextResponse.json({
      ok: true,
      mode: isPrintfulEnabled() ? "printful" : "demo",
      printfulOrderId: fulfillment.printfulOrderId,
      printfulStatus: fulfillment.printfulStatus,
      email: emailResultForClient(emailResult),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
