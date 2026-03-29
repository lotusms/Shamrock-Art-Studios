"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@firebase/client";

/**
 * Lists orders for the signed-in user (Firestore `orders` where `email` matches Auth).
 * Sorted newest-first by `createdAt` (ISO string from checkout).
 */
export async function fetchOrdersForCurrentUser() {
  const auth = getFirebaseAuth();
  const u = auth.currentUser;
  if (!u?.email) return [];

  const db = getFirebaseDb();
  const q = query(collection(db, "orders"), where("email", "==", u.email));
  const snap = await getDocs(q);
  const orders = [];
  snap.forEach((d) => {
    orders.push({ id: d.id, ...d.data() });
  });
  orders.sort((a, b) => {
    const ta = String(a.createdAt || "");
    const tb = String(b.createdAt || "");
    return tb.localeCompare(ta);
  });
  return orders;
}

/**
 * Loads a single order if it exists and belongs to the current user (rules enforce email match).
 */
export async function fetchOrderByIdForCurrentUser(orderId) {
  const auth = getFirebaseAuth();
  const u = auth.currentUser;
  if (!u?.email || !orderId) return null;

  const db = getFirebaseDb();
  const ref = doc(db, "orders", String(orderId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { id: snap.id, ...data };
}
