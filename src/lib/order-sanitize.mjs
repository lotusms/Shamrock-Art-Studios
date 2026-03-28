/**
 * Normalizes order objects for Firestore (shared by client save + migration scripts).
 */
export function sanitizeOrder(order) {
  return {
    id: String(order.id || ""),
    createdAt: order.createdAt || new Date().toISOString(),
    email: String(order.email || ""),
    phone: String(order.phone || ""),
    shippingAddress: {
      fullName: String(order.shippingAddress?.fullName || ""),
      address1: String(order.shippingAddress?.address1 || ""),
      address2: String(order.shippingAddress?.address2 || ""),
      city: String(order.shippingAddress?.city || ""),
      state: String(order.shippingAddress?.state || ""),
      postalCode: String(order.shippingAddress?.postalCode || ""),
      country: String(order.shippingAddress?.country || ""),
    },
    lines: Array.isArray(order.lines)
      ? order.lines.map((l) => ({
          productId: l.productId ?? null,
          printfulProductId: l.printfulProductId ?? null,
          variantId: l.variantId ?? null,
          catalogVariantId: l.catalogVariantId ?? null,
          externalId: l.externalId ?? null,
          slug: l.slug ?? null,
          title: l.title ?? null,
          artist: l.artist ?? null,
          priceUsd: Number(l.priceUsd ?? 0),
          sku: l.sku ?? null,
          quantity: Number(l.quantity ?? 0),
          image: l.image ?? null,
          originalImage: l.originalImage ?? null,
        }))
      : [],
    subtotalUsd: Number(order.subtotalUsd ?? 0),
    shippingUsd: Number(order.shippingUsd ?? 0),
    totalUsd: Number(order.totalUsd ?? 0),
    notes: String(order.notes || ""),
    fulfillment: order.fulfillment ?? null,
    payment: order.payment ?? null,
  };
}
