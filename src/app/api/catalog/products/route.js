import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/printful/catalog";

export async function GET() {
  try {
    const products = await getCatalogProducts();
    return NextResponse.json({
      ok: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to load catalog.",
      },
      { status: 500 },
    );
  }
}
