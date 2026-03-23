import { NextResponse } from "next/server";
import { isPrintfulEnabled, printfulRequest } from "@/lib/printful/client";

export async function GET() {
  if (!isPrintfulEnabled()) {
    return NextResponse.json({
      ok: false,
      connected: false,
      reason: "PRINTFUL_API_KEY is not configured.",
    });
  }

  try {
    // `/store` may be restricted for some store-scoped tokens.
    // Probe a commonly allowed store-level endpoint instead.
    const data = await printfulRequest("/store/products?limit=1");
    return NextResponse.json({
      ok: true,
      connected: true,
      productProbe: Array.isArray(data?.result)
        ? data.result.length
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        reason: error instanceof Error ? error.message : "Failed to connect.",
      },
      { status: 500 },
    );
  }
}
