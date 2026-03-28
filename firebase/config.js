/**
 * Firebase web app configuration (client SDK).
 * Set these in `.env.local` — values from Firebase Console → Project settings → Your apps.
 *
 * Firestore database id (not "(default)") — must match the database you created in console
 * and the `database` entry in `firebase.json` for rules deploy.
 */
export const FIRESTORE_DATABASE_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID?.trim() || "main";

export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  };
}

export function assertFirebaseConfig() {
  const c = getFirebaseConfig();
  const missing = [];
  if (!c.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!c.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!c.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!c.storageBucket) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!c.messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!c.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (missing.length) {
    throw new Error(
      `Missing Firebase env: ${missing.join(", ")}. Add them to .env.local and restart the dev server.`,
    );
  }
  return c;
}
