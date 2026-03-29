import { NextResponse } from "next/server";
import {
  getFirebaseAdminDb,
  verifyFirebaseIdToken,
} from "@/lib/firebase-admin-server";
import { USER_ACCOUNTS_COLLECTION } from "@/lib/user-accounts";
import {
  emailResultForClient,
  sendOrderDetailsEmailBuyerWithCc,
} from "@/lib/email/order-emails.mjs";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(authHeader.slice(7));
  } catch (e) {
    console.error("[orders/resend-email] verifyIdToken:", e);
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 },
    );
  }

  const uid = decoded.uid;
  if (!uid || typeof uid !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId =
    typeof body?.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  try {
    const db = getFirebaseAdminDb();
    const userSnap = await db
      .collection(USER_ACCOUNTS_COLLECTION)
      .doc(uid)
      .get();
    const ua = userSnap.data();
    const isAdmin =
      Boolean(ua?.admin) && ua?.guest !== true;
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Only shop administrators can resend order emails.",
        },
        { status: 403 },
      );
    }

    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data();
    const order = { id: snap.id, ...data };
    const payment = order.payment ?? null;
    const fulfillment = order.fulfillment ?? null;

    const result = await sendOrderDetailsEmailBuyerWithCc({
      order,
      payment,
      fulfillment,
    });

    if (!result.ok) {
      const status = result.skipped ? 503 : 502;
      return NextResponse.json(
        {
          error:
            result.reason === "smtp_not_configured"
              ? "Mail is not configured on the server"
              : result.error || "Could not send email",
          email: emailResultForClient(result),
        },
        { status },
      );
    }

    return NextResponse.json({ ok: true, email: { ok: true } });
  } catch (e) {
    console.error("[orders/resend-email]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("FIREBASE_SERVICE_ACCOUNT") ||
      msg.includes("Could not load the default credentials")
    ) {
      return NextResponse.json(
        {
          error:
            "Server Firebase Admin is not configured (set FIREBASE_SERVICE_ACCOUNT_JSON)",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg || "Server error" }, { status: 500 });
  }
}
