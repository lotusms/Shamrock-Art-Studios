import { printfulRequest } from "@/lib/printful/client";

function normalizeCountry(country) {
  if (!country || country === "OTHER") return "US";
  return country;
}

function lineToPrintfulItem(line) {
  if (!line.variantId) {
    throw new Error(
      `Line item "${line.title}" is missing variantId from Printful catalog.`,
    );
  }
  return {
    variant_id: line.variantId,
    quantity: line.quantity,
    retail_price: String(line.priceUsd),
    name: line.title,
  };
}

export async function createPrintfulOrder(order) {
  const items = order.lines.map(lineToPrintfulItem);
  const payload = {
    recipient: {
      name: order.shippingAddress.fullName,
      address1: order.shippingAddress.address1,
      address2: order.shippingAddress.address2 || "",
      city: order.shippingAddress.city,
      state_code: order.shippingAddress.state,
      country_code: normalizeCountry(order.shippingAddress.country),
      zip: order.shippingAddress.postalCode,
      email: order.email,
      phone: order.phone || "",
    },
    items,
    external_id: order.id,
    retail_costs: {
      subtotal: String(order.subtotalUsd),
      shipping: String(order.shippingUsd),
      total: String(order.totalUsd),
      currency: "USD",
    },
    packing_slip: {
      email: order.email,
      phone: order.phone || "",
      message: order.notes || "",
    },
  };

  const result = await printfulRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result?.result ?? result;
}
