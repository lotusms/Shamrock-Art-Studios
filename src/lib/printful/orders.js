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

function isPrivateOrLocalHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "127.0.0.1" || host === "::1") return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  if (host.startsWith("169.254.")) return true;
  if (host.startsWith("172.")) {
    const second = Number(host.split(".")[1] || "");
    if (Number.isFinite(second) && second >= 16 && second <= 31) return true;
  }
  return false;
}

function normalizePrintFileUrl(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return null;

  // Printful needs a fully-qualified, publicly fetchable URL.
  if (raw.startsWith("//")) return `https:${raw}`;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      return null;
    }
    if (isPrivateOrLocalHost(parsed.hostname)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function printFileUrlForLine(line) {
  return normalizePrintFileUrl(line.originalImage || line.image || "");
}

function lineToPrintfulItem(line) {
  const catalogVariantId = line.catalogVariantId ?? line.variantId;
  if (!catalogVariantId) {
    throw new Error(
      `Line item "${line.title}" is missing catalogVariantId from the fulfillment catalog.`,
    );
  }
  const rawFileValue = String(line.originalImage || line.image || "").trim();
  const fileUrl = printFileUrlForLine(line);
  if (!fileUrl) {
    throw new Error(
      rawFileValue
        ? `Line item "${line.title}" has an invalid print file URL for Printful: "${rawFileValue}". Use a public https URL.`
        : `Line item "${line.title}" has no image URL for Printful print files.`,
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

function isExternalIdAlreadyExistsError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();
  return (
    normalized.includes("external id") &&
    normalized.includes("already exists")
  );
}

async function findPrintfulOrderByExternalId(externalId) {
  if (!externalId) return null;
  try {
    const encoded = encodeURIComponent(String(externalId));
    const data = await printfulRequest(`/orders?external_id=${encoded}`);
    const list = Array.isArray(data?.result) ? data.result : [];
    return list[0] ?? null;
  } catch {
    return null;
  }
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

  try {
    const result = await printfulRequest("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return result?.result ?? result;
  } catch (error) {
    if (isExternalIdAlreadyExistsError(error)) {
      const existing = await findPrintfulOrderByExternalId(order.id);
      if (existing) return existing;
    }
    const details = items
      .map((item, index) => {
        const fileUrl = item?.files?.[0]?.url ?? "<missing>";
        return `item ${index} (variant ${item.variant_id}): ${fileUrl}`;
      })
      .join("; ");
    const base =
      error instanceof Error ? error.message : "Printful order creation failed.";
    throw new Error(`${base}. Sent print file URLs: ${details}`);
  }
}
