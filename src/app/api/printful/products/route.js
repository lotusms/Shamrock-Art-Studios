import { NextResponse } from "next/server";
import { isPrintfulEnabled, printfulRequest } from "@/lib/printful/client";
import { getCatalogProducts } from "@/lib/printful/catalog";

export async function GET() {
  if (!isPrintfulEnabled()) {
    return NextResponse.json(
      { ok: false, error: "PRINTFUL_API_KEY is not configured." },
      { status: 400 },
    );
  }

  try {
    const productsRes = await printfulRequest("/store/products?limit=50");
    const products = Array.isArray(productsRes?.result) ? productsRes.result : [];

    const normalized = [];
    for (const p of products) {
      const syncRes = await printfulRequest(`/store/products/${p.id}`);
      const sync = syncRes?.result?.sync_product;
      const variants = Array.isArray(syncRes?.result?.sync_variants)
        ? syncRes.result.sync_variants
        : [];
      normalized.push({
        id: p.id,
        externalId: sync?.external_id ?? null,
        name: sync?.name ?? p.name ?? null,
        variants: variants.map((v) => ({
          syncVariantId: v.id,
          retailPrice: v.retail_price,
          sku: v.sku,
          name: v.name,
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      count: normalized.length,
      products: normalized,
      storefront: await getCatalogProducts(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch products.",
      },
      { status: 500 },
    );
  }
}
