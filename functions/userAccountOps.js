/**
 * Helpers for `useraccounts/{uid}` — call from HTTPS/callable functions when linking a completed order (Admin SDK).
 * Expects `useraccounts/{uid}` to exist (from syncUserAccountOnAuthCreate).
 */
import { FieldValue } from "firebase-admin/firestore";

/**
 * @param {import("firebase-admin/firestore").Firestore} db
 * @param {string} uid
 * @param {string} orderId
 * @param {Record<string, unknown>} detail — merged into orderDetails[orderId] (e.g. totalUsd, createdAt, status, lineCount)
 */
export async function appendOrderToUserAccount(db, uid, orderId, detail) {
  const ref = db.collection("useraccounts").doc(uid);
  await ref.update({
    [`orderDetails.${orderId}`]: { orderId, ...detail },
    orderHistory: FieldValue.arrayUnion(orderId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
