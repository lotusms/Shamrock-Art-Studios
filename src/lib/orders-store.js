"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@firebase/client";
import { sanitizeOrder } from "@/lib/order-sanitize.mjs";

export async function saveOrderToFirestore(order) {
  if (!order?.id) {
    throw new Error("Cannot save order: missing order id.");
  }

  const db = getFirebaseDb();
  const payload = sanitizeOrder(order);
  const orderId = String(order.id);
  const ref = doc(db, "orders", orderId);

  await setDoc(
    ref,
    {
      ...payload,
      id: orderId,
      email: payload.email,
      totalUsd: payload.totalUsd,
      lines: payload.lines,
      savedFrom: "checkout-client",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
