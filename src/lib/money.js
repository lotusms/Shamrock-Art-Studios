const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Round to 2 decimal places (USD) so sums match payment APIs. */
export function roundUsd2(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Formats USD with cents — matches payment processors (e.g. PayPal) and avoids whole-dollar rounding. */
export function formatUsd(amount) {
  return usd.format(Number(amount));
}
