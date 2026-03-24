import { NextResponse } from "next/server";
import { normalizeStateCodeForPrintful } from "@/lib/printful/address";
import { isPrintfulEnabled, printfulRequest } from "@/lib/printful/client";

function normalizeRecipient(input = {}) {
  const country_code = String(
    input.countryCode || input.country || "US",
  ).toUpperCase();
  const stateRaw = input.state || "";
  return {
    country_code,
    state_code: normalizeStateCodeForPrintful(country_code, stateRaw),
    city: input.city || "",
    zip: input.postalCode || input.zip || "",
    address1: input.address1 || "",
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
        variant_id: Number(line.catalogVariantId ?? line.variantId),
        quantity: Math.max(1, Number(line.quantity || 1)),
      }))
      .filter((item) => Number.isFinite(item.variant_id) && item.variant_id > 0);

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
    const hasAddress =
      String(recipient.address1 || "").trim() &&
      String(recipient.city || "").trim() &&
      String(recipient.state_code || "").trim() &&
      String(recipient.zip || "").trim();
    if (!hasAddress) {
      return NextResponse.json({
        ok: false,
        error: "Complete shipping address required for a quote.",
        shippingUsd: null,
      });
    }

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
    const message =
      error instanceof Error ? error.message : "Failed to quote shipping.";
    return NextResponse.json(
      { ok: false, error: message, shippingUsd: null },
      { status: 200 },
    );
  }
}
