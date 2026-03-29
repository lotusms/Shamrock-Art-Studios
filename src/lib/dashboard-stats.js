/** @param {unknown} iso */
export function parseOrderDateMs(iso) {
  if (iso == null) return 0;
  const t = new Date(String(iso)).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** @param {unknown} addr */
export function shipToKey(addr) {
  if (!addr || typeof addr !== "object") return "";
  const fn = String(addr.fullName || "")
    .trim()
    .toLowerCase();
  const pc = String(addr.postalCode || "")
    .trim()
    .toLowerCase();
  if (!fn && !pc) return "";
  return `${fn}|${pc}`;
}

/**
 * @param {unknown[]} orders
 * @param {Date} [now]
 */
export function computeOrderStats(orders, now = new Date()) {
  if (!Array.isArray(orders)) {
    return {
      ordersAll: 0,
      ordersThisMonth: 0,
      revenueAll: 0,
      revenueThisMonth: 0,
      uniqueShipToAll: 0,
      uniqueShipToThisMonth: 0,
    };
  }

  const y = now.getFullYear();
  const m = now.getMonth();
  const startOfMonth = new Date(y, m, 1).getTime();
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();

  let ordersThisMonth = 0;
  let revenueThisMonth = 0;
  let revenueAll = 0;
  const shipToAll = new Set();
  const shipToMonth = new Set();

  for (const o of orders) {
    const t = parseOrderDateMs(o?.createdAt);
    const total = Number(o?.totalUsd ?? 0);
    revenueAll += Number.isFinite(total) ? total : 0;

    if (t >= startOfMonth && t <= endOfMonth) {
      ordersThisMonth += 1;
      revenueThisMonth += Number.isFinite(total) ? total : 0;
    }

    const key = shipToKey(o?.shippingAddress);
    if (key) {
      shipToAll.add(key);
      if (t >= startOfMonth && t <= endOfMonth) {
        shipToMonth.add(key);
      }
    }
  }

  return {
    ordersAll: orders.length,
    ordersThisMonth,
    revenueAll,
    revenueThisMonth,
    uniqueShipToAll: shipToAll.size,
    uniqueShipToThisMonth: shipToMonth.size,
  };
}

/**
 * Last 12 calendar months (inclusive of current), aggregated per month.
 * @param {unknown[]} orders
 * @param {Date} [now]
 */
export function monthlySeriesLast12Months(orders, now = new Date()) {
  const buckets = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      orders: 0,
      revenue: 0,
    });
  }

  if (!Array.isArray(orders)) return buckets;

  for (const o of orders) {
    const t = parseOrderDateMs(o?.createdAt);
    if (!t) continue;
    const d = new Date(t);
    const b = buckets.find(
      (x) => x.year === d.getFullYear() && x.month === d.getMonth(),
    );
    if (b) {
      b.orders += 1;
      const total = Number(o?.totalUsd ?? 0);
      b.revenue += Number.isFinite(total) ? total : 0;
    }
  }

  return buckets;
}
