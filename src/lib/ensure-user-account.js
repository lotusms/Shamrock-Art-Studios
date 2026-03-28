"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@firebase/client";

/**
 * Ensures `useraccounts/{uid}` exists for the signed-in user (Firestore client write).
 * Avoids Cloud Function / CORS issues on localhost when Functions are not deployed.
 */
export async function ensureUserAccountDocIfMissing() {
  try {
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) return;

    const db = getFirebaseDb();
    const ref = doc(db, "useraccounts", u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;

    const parts = (u.displayName || "").trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    await setDoc(ref, {
      uid: u.uid,
      email: u.email || "",
      firstName,
      lastName,
      orderHistory: [],
      orderDetails: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[ensureUserAccountDoc]", e);
  }
}
