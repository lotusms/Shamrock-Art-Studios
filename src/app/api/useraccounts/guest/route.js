import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin-server";

/**
 * Upserts a guest-only `useraccounts` record (no Firebase Auth uid).
 * Called after guest checkout once the order exists in `orders/{orderId}`.
 *
 * Skips when a registered profile already exists for the same email (guest: false, uid set).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    const guestCheckout = Boolean(body.guestCheckout);

    if (!orderId || !guestCheckout) {
      return NextResponse.json(
        { ok: false, error: "orderId and guestCheckout are required." },
        { status: 400 },
      );
    }

    const db = getFirebaseAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { ok: false, error: "Order not found." },
        { status: 404 },
      );
    }

    const order = orderSnap.data();
    const email = String(order.email || "").trim();
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Order has no email." },
        { status: 400 },
      );
    }

    const shipping = order.shippingAddress && typeof order.shippingAddress === "object"
      ? order.shippingAddress
      : {};
    const fullName = String(shipping.fullName || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const phoneRaw = String(order.phone || "").replace(/\D/g, "").slice(0, 10);

    const lineCount = Array.isArray(order.lines) ? order.lines.length : 0;
    const detail = {
      orderId,
      createdAt:
        typeof order.createdAt === "string" ? order.createdAt : String(order.createdAt ?? ""),
      totalUsd: typeof order.totalUsd === "number" ? order.totalUsd : null,
      lineCount,
      status: "completed",
    };

    const emailSnap = await db
      .collection("useraccounts")
      .where("email", "==", email)
      .get();

    const docs = emailSnap.docs.map((d) => ({ ref: d.ref, data: d.data() }));

    // Registered customers: guest !== true (false or missing) and Firebase uid present.
    const hasRegistered = docs.some((x) => {
      if (x.data.guest === true) return false;
      return typeof x.data.uid === "string" && x.data.uid.length > 0;
    });
    if (hasRegistered) {
      return NextResponse.json({
        ok: true,
        skipped: "registered_account_exists",
      });
    }

    const guestExisting = docs.find((x) => x.data.guest === true);

    if (guestExisting) {
      await guestExisting.ref.update({
        firstName,
        lastName,
        phone: phoneRaw,
        shippingAddress: shipping,
        orderHistory: FieldValue.arrayUnion(orderId),
        [`orderDetails.${orderId}`]: detail,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, mode: "updated" });
    }

    await db.collection("useraccounts").doc().set({
      uid: "",
      guest: true,
      admin: false,
      email,
      firstName,
      lastName,
      phone: phoneRaw,
      shippingAddress: shipping,
      orderHistory: [orderId],
      orderDetails: { [orderId]: detail },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, mode: "created" });
  } catch (e) {
    console.error("[api/useraccounts/guest]", e);
    const message = e instanceof Error ? e.message : "Server error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
