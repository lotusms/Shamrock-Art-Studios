export const SHIPPING_FLAT_USD = 0;
export const FREE_SHIPPING_THRESHOLD_USD = 0;

const PRICES_INCLUDE_SHIPPING_DEFAULT =
  process.env.NEXT_PUBLIC_PRICES_INCLUDE_SHIPPING === "true";

export function shippingIncludedForLines(lines = []) {
  if (PRICES_INCLUDE_SHIPPING_DEFAULT) return true;
  if (!Array.isArray(lines) || lines.length === 0) return false;
  return lines.every((line) => Boolean(line.shippingIncluded));
}

export function shippingForSubtotal(subtotalUsd, lines = []) {
  if (shippingIncludedForLines(lines)) return 0;
  return SHIPPING_FLAT_USD;
}

export function orderTotal(subtotalUsd, lines = []) {
  return subtotalUsd + shippingForSubtotal(subtotalUsd, lines);
}

export const ORDER_STORAGE_KEY = "shamrock-last-order-v1";

/** One-shot status after checkout for thank-you page (email send result). */
export const ORDER_EMAIL_STATUS_KEY = "shamrock-order-email-status-v1";
