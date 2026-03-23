import { NextResponse } from "next/server";
import { isPrintfulEnabled, printfulRequest } from "@/lib/printful/client";

function normalizeRecipient(input = {}) {
  return {
    country_code: input.countryCode || input.country || "US",
    state_code: input.state || "",
    city: input.city || "",
    zip: input.postalCode || input.zip || "",
    address1: input.address1 || "Address pending",
  };
}

function toRateNumber(rate) {
  const n = Number.parseFloat(String(rate ?? ""));
  return Number.isFinite(n) ? n : null;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const lines = Array.isArray(payload?.lines) ? payload.lines : [];
    const items = lines
      .map((line) => ({
        variant_id: line.catalogVariantId,
        quantity: Math.max(1, Number(line.quantity || 1)),
      }))
      .filter((item) => Number.isFinite(Number(item.variant_id)));

    if (items.length === 0) {
      return NextResponse.json({
        ok: true,
        shippingUsd: 0,
        source: "none",
      });
    }

    if (!isPrintfulEnabled()) {
      return NextResponse.json({
        ok: true,
        shippingUsd: 0,
        source: "demo",
      });
    }

    const recipient = normalizeRecipient(payload?.recipient);
    const rates = await printfulRequest("/shipping/rates", {
      method: "POST",
      body: JSON.stringify({ recipient, items }),
    });
    const options = Array.isArray(rates?.result) ? rates.result : [];
    const priced = options
      .map((opt) => ({
        ...opt,
        rateNumber: toRateNumber(opt?.rate),
      }))
      .filter((opt) => opt.rateNumber !== null)
      .sort((a, b) => a.rateNumber - b.rateNumber);

    const chosen = priced[0];
    return NextResponse.json({
      ok: true,
      shippingUsd: chosen?.rateNumber ?? 0,
      shippingService: chosen?.name ?? null,
      currency: chosen?.currency ?? "USD",
      source: "provider",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to quote shipping.",
      },
      { status: 500 },
    );
  }
}
