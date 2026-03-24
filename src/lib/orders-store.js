"use client";

import { createClient } from "@supabase/supabase-js";

function sanitizeOrder(order) {
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

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  // Next.js only inlines NEXT_PUBLIC_* when accessed literally (not via process.env[name]).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add both to .env.local (Supabase → Settings → API), then restart the dev server.",
    );
  }
  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return supabaseClient;
}

export async function saveOrderToSupabase(order) {
  if (!order?.id) {
    throw new Error("Cannot save order to Supabase: missing order id.");
  }

  const supabase = getSupabaseClient();
  const payload = sanitizeOrder(order);
  const row = {
    id: String(order.id),
    email: payload.email,
    total_usd: payload.totalUsd,
    payload,
    saved_from: "checkout-client",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("orders").upsert(row, { onConflict: "id" });
  if (error) {
    throw new Error(`Supabase orders upsert failed: ${error.message}`);
  }
}
