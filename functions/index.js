/**
 * Firebase Cloud Functions — Firebase Admin SDK.
 * Deploy: from repo root, `firebase deploy --only functions`
 * Local: `firebase emulators:start --only functions`
 */
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/** Must match `NEXT_PUBLIC_FIRESTORE_DATABASE_ID` / Firebase Console database id. */
const FIRESTORE_DATABASE_ID = "main";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";

setGlobalOptions({ region: "us-central1", maxInstances: 10 });

if (!getApps().length) {
  initializeApp();
}

/** Shared Firestore for the `main` database. */
export const adminDb = getFirestore(getApp(), FIRESTORE_DATABASE_ID);

/**
 * Health check — verifies Admin + Firestore are reachable.
 * GET /adminHealth
 */
export const adminHealth = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  try {
    await adminDb.collection("_health").limit(1).get();
    res.status(200).json({ ok: true, service: "firebase-admin" });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ ok: false, error: message });
  }
});
