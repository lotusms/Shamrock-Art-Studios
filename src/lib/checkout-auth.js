/**
 * Checkout sign-up / profile helpers (Firebase Auth + Firestore `useraccounts`).
 */

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@firebase/client";
import { USER_ACCOUNTS_COLLECTION } from "@/lib/user-accounts";

export function digitsFromTelInput(value) {
  let d = String(value).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

export function formatUsPhoneMask(digits) {
  const d = String(digits).replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 3) return `(${d}`;
  if (d.length === 3) return `(${d})`;
  if (d.length <= 6) {
    return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  }
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function toCheckoutCountry(value) {
  const code = String(value || "").toUpperCase();
  if (code === "US" || code === "CA" || code === "GB") return code;
  return "OTHER";
}

/**
 * @param {Record<string, unknown> | undefined} d
 * @param {string | null | undefined} authEmail
 */
export function profileToCheckoutFormPatch(d, authEmail) {
  if (!d || typeof d !== "object") return {};
  const sa =
    d.shippingAddress && typeof d.shippingAddress === "object"
      ? /** @type {Record<string, unknown>} */ (d.shippingAddress)
      : {};
  const first = typeof d.firstName === "string" ? d.firstName.trim() : "";
  const last = typeof d.lastName === "string" ? d.lastName.trim() : "";
  const fullFromName = [first, last].filter(Boolean).join(" ").trim();
  const fullName =
    typeof sa.fullName === "string" && sa.fullName.trim()
      ? sa.fullName.trim()
      : fullFromName;
  const phoneDigits =
    typeof d.phone === "string" ? digitsFromTelInput(d.phone) : "";
  return {
    email: String(authEmail || d.email || "").trim(),
    phone: phoneDigits ? formatUsPhoneMask(phoneDigits) : "",
    fullName,
    address1: typeof sa.address1 === "string" ? sa.address1 : "",
    address2: typeof sa.address2 === "string" ? sa.address2 : "",
    city: typeof sa.city === "string" ? sa.city : "",
    state: typeof sa.state === "string" ? sa.state : "",
    postalCode: typeof sa.postalCode === "string" ? sa.postalCode : "",
    country: toCheckoutCountry(
      typeof sa.country === "string" ? sa.country : "US",
    ),
  };
}

/**
 * @param {string} uid
 */
export async function fetchUserAccountDoc(uid) {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, USER_ACCOUNTS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Create Firebase Auth user + `useraccounts/{uid}` (merge allowed after ensure-user race).
 */
export async function registerUserWithProfile({
  email,
  password,
  firstName,
  lastName,
  phone,
  shippingAddress,
}) {
  const auth = getFirebaseAuth();
  const trimmedEmail = email.trim();
  const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
  if (methods.length > 0) {
    const err = new Error(
      "An account with this email already exists. Try signing in instead.",
    );
    err.code = "auth/email-already-in-use";
    throw err;
  }

  const cred = await createUserWithEmailAndPassword(
    auth,
    trimmedEmail,
    password,
  );
  const display = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (display) {
    await updateProfile(cred.user, { displayName: display });
  }

  const db = getFirebaseDb();
  const uid = cred.user.uid;
  const phoneDigits = phone ? digitsFromTelInput(phone) : "";
  const fullShippingName =
    shippingAddress.fullName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  await setDoc(
    doc(db, USER_ACCOUNTS_COLLECTION, uid),
    {
      uid,
      email: cred.user.email || trimmedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phoneDigits,
      admin: false,
      guest: false,
      orderHistory: [],
      orderDetails: {},
      shippingAddress: {
        fullName: fullShippingName,
        address1: shippingAddress.address1.trim(),
        address2: (shippingAddress.address2 || "").trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return cred.user;
}
