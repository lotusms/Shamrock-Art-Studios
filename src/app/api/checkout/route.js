import { NextResponse } from "next/server";
import { createPrintfulOrder } from "@/lib/printful/orders";
import { isPrintfulEnabled } from "@/lib/printful/client";

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
    if (!isPrintfulEnabled()) {
      return NextResponse.json({
        ok: true,
        mode: "demo",
        printfulOrderId: null,
      });
    }

    const created = await createPrintfulOrder(order);
    return NextResponse.json({
      ok: true,
      mode: "printful",
      printfulOrderId: created?.id ?? null,
      printfulStatus: created?.status ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
