/**
 * Creates missing `useraccounts/{uid}` docs for every Firebase Auth user (database `main`).
 * Uses Admin SDK — run locally with service account env (same as migration scripts).
 *
 *   pnpm backfill:useraccounts
 *
 * Firestore creates the `useraccounts` collection when the first document is written.
 */
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const DB = process.env.FIRESTORE_DATABASE_ID?.trim() || "main";

function splitDisplayName(displayName) {
  const s = String(displayName || "").trim();
  if (!s) return { firstName: "", lastName: "" };
  const parts = s.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
  };
}

function initAdmin() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    initializeApp({ credential: cert(JSON.parse(json)) });
    return;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    initializeApp();
    return;
  }
  throw new Error(
    "Set GOOGLE_APPLICATION_CREDENTIALS (path to JSON) or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local",
  );
}

async function main() {
  initAdmin();
  const db = getFirestore(getApp(), DB);
  const auth = getAuth();

  let nextPageToken;
  let created = 0;
  let skipped = 0;

  console.log(`Firestore database: ${DB}`);

  do {
    const list = await auth.listUsers(1000, nextPageToken);
    for (const userRecord of list.users) {
      const ref = db.collection("useraccounts").doc(userRecord.uid);
      const snap = await ref.get();
      if (snap.exists) {
        skipped++;
        continue;
      }
      const { firstName, lastName } = splitDisplayName(userRecord.displayName);
      await ref.set(
        {
          uid: userRecord.uid,
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
      created++;
      console.log(`Created useraccounts/${userRecord.uid} (${userRecord.email || "no email"})`);
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);

  console.log(`Done. Created ${created} document(s). Skipped ${skipped} (already existed).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
