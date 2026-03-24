import { printfulRequest } from "@/lib/printful/client";
import {
  normalizeStateCodeForPrintful,
  phoneDigitsForPrintful,
} from "@/lib/printful/address";
import { roundUsd2 } from "@/lib/money";

function normalizeCountry(country) {
  if (!country || country === "OTHER") return "US";
  return country;
}

function moneyString(n) {
  return roundUsd2(Number(n)).toFixed(2);
}

function printFileUrlForLine(line) {
  const url = String(line.originalImage || line.image || "").trim();
  return url || null;
}

function lineToPrintfulItem(line) {
  const catalogVariantId = line.catalogVariantId ?? line.variantId;
  if (!catalogVariantId) {
    throw new Error(
      `Line item "${line.title}" is missing catalogVariantId from the fulfillment catalog.`,
    );
  }
  const fileUrl = printFileUrlForLine(line);
  if (!fileUrl) {
    throw new Error(
      `Line item "${line.title}" has no image URL for Printful print files.`,
    );
  }
  return {
    variant_id: Number(catalogVariantId),
    quantity: line.quantity,
    retail_price: moneyString(line.priceUsd),
    name: line.title,
    files: [{ url: fileUrl }],
  };
}

export async function createPrintfulOrder(order) {
  const items = order.lines.map(lineToPrintfulItem);
  const country = normalizeCountry(order.shippingAddress.country);
  const stateRaw = order.shippingAddress.state;
  const state_code = normalizeStateCodeForPrintful(country, stateRaw);
  const phoneDigits = phoneDigitsForPrintful(order.phone);

  const payload = {
    recipient: {
      name: order.shippingAddress.fullName,
      address1: order.shippingAddress.address1,
      address2: order.shippingAddress.address2 || "",
      city: order.shippingAddress.city,
      state_code,
      country_code: country,
      zip: order.shippingAddress.postalCode,
      email: order.email,
      phone: phoneDigits,
    },
    items,
    external_id: order.id,
    retail_costs: {
      subtotal: moneyString(order.subtotalUsd),
      shipping: moneyString(order.shippingUsd),
      total: moneyString(order.totalUsd),
      currency: "USD",
    },
    packing_slip: {
      email: order.email,
      phone: phoneDigits || order.phone || "",
      message: order.notes || "",
    },
  };

  const result = await printfulRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result?.result ?? result;
}
