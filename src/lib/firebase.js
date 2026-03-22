import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = Object.keys(firebaseConfig);

export function hasFirebaseConfig() {
  return requiredKeys.every((key) => Boolean(firebaseConfig[key]));
}

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    throw new Error(
      "Firebase environment variables are missing. Copy .env.local.example to .env.local and fill in your Firebase config."
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
