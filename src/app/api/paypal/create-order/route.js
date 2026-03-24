import { NextResponse } from "next/server";
import {
  isPayPalConfigured,
  paypalCreateCheckoutOrder,
} from "@/lib/paypal/server";

export async function POST(request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured on the server." },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const amountUsd = Number(body?.amountUsd);
    const currency = typeof body?.currency === "string" ? body.currency : "USD";

    const created = await paypalCreateCheckoutOrder(amountUsd, currency);
    const id = created?.id;
    if (!id) {
      return NextResponse.json(
        { error: "PayPal did not return an order id." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create PayPal order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
