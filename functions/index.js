/**
 * Firebase Cloud Functions — Firebase Admin SDK.
 * Deploy: from repo root, `firebase deploy --only functions`
 *
 * Auth → Firestore: `syncUserAccountOnAuthCreate` only runs after deploy (Blaze).
 * Users created before deploy are not backfilled. Use `pnpm backfill:useraccounts` or sign in once
 * (callable `ensureUserAccountDoc`).
 */
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";

/** Must match `NEXT_PUBLIC_FIRESTORE_DATABASE_ID` / Firebase Console database id. */
const FIRESTORE_DATABASE_ID = "main";

setGlobalOptions({ region: "us-central1", maxInstances: 10 });

if (!getApps().length) {
  initializeApp();
}

/** Shared Firestore for the `main` database. */
export const adminDb = getFirestore(getApp(), FIRESTORE_DATABASE_ID);

function splitDisplayName(displayName) {
  const s = String(displayName || "").trim();
  if (!s) return { firstName: "", lastName: "" };
  const parts = s.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
  };
}

/**
 * When a Firebase Auth user is created (console or client), create `useraccounts/{uid}`.
 * Passwords are never written to Firestore — only Auth stores credentials.
 */
export const syncUserAccountOnAuthCreate = functions
  .region("us-central1")
  .auth.user()
  .onCreate(async (user) => {
    const uid = user.uid;
    const { firstName, lastName } = splitDisplayName(user.displayName);
    const email = user.email || "";

    await adminDb.collection("useraccounts").doc(uid).set(
      {
        uid,
        email,
        firstName,
        lastName,
        orderHistory: [],
        orderDetails: {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

/**
 * Callable: create `useraccounts/{uid}` if missing (e.g. user added in Console before Functions
 * deployed, or onCreate failed). Client calls this after sign-in with the user’s ID token.
 */
export const ensureUserAccountDoc = onCall(
  { region: "us-central1", cors: true },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;
    const ref = adminDb.collection("useraccounts").doc(uid);
    const snap = await ref.get();
    if (snap.exists) {
      return { ok: true, created: false };
    }
    const userRecord = await getAuth().getUser(uid);
    const { firstName, lastName } = splitDisplayName(userRecord.displayName);
    await ref.set(
      {
        uid,
        email: userRecord.email || "",
        firstName,
        lastName,
        orderHistory: [],
        orderDetails: {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: true, created: true };
  },
);

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
