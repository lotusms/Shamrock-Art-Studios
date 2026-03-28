import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { assertFirebaseConfig, FIRESTORE_DATABASE_ID } from "./config.js";

let appInstance = null;
let dbInstance = null;

/** Browser-only Firebase App (Next.js client components / event handlers). */
export function getFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client is only available in the browser.");
  }
  if (appInstance) return appInstance;
  const config = assertFirebaseConfig();
  appInstance =
    getApps().length > 0 ? getApps()[0] : initializeApp(config);
  return appInstance;
}

/** Firestore instance for the configured database (see `FIRESTORE_DATABASE_ID`). */
export function getFirebaseDb() {
  if (typeof window === "undefined") {
    throw new Error("Firestore client is only available in the browser.");
  }
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp(), FIRESTORE_DATABASE_ID);
  return dbInstance;
}
