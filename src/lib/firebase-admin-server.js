import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { FIRESTORE_DATABASE_ID } from "@firebase/config";

let dbInstance = null;

/**
 * Server-only Firebase Admin. Requires one of:
 * - `FIREBASE_SERVICE_ACCOUNT_JSON` — full JSON object string (Vercel / .env.local)
 * - Google Application Default Credentials (e.g. Cloud environment)
 */
export function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    const cred = JSON.parse(raw);
    return initializeApp({ credential: cert(cred) });
  }

  return initializeApp({ credential: applicationDefault() });
}

export function getFirebaseAdminDb() {
  if (dbInstance) return dbInstance;
  const app = getFirebaseAdminApp();
  dbInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  return dbInstance;
}

export async function verifyFirebaseIdToken(idToken) {
  const auth = getAuth(getFirebaseAdminApp());
  return auth.verifyIdToken(idToken);
}
