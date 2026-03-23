import { NextResponse } from "next/server";
import { verifyPrintfulWebhook } from "@/lib/printful/webhook";

export async function POST(request) {
  const signature = request.headers.get("x-pf-signature");
  const raw = await request.text();

  if (!verifyPrintfulWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(raw);

  // Hook this into your DB/email queue in production.
  return NextResponse.json({
    ok: true,
    type: event?.type ?? "unknown",
  });
}
