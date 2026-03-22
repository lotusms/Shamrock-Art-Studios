/** Flat shipping in USD; free at or above threshold */
export const SHIPPING_FLAT_USD = 85;
export const FREE_SHIPPING_THRESHOLD_USD = 10000;

export function shippingForSubtotal(subtotalUsd) {
  if (subtotalUsd >= FREE_SHIPPING_THRESHOLD_USD) return 0;
  return SHIPPING_FLAT_USD;
}

export function orderTotal(subtotalUsd) {
  return subtotalUsd + shippingForSubtotal(subtotalUsd);
}

export const ORDER_STORAGE_KEY = "shamrock-last-order-v1";
