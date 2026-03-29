/**
 * Firestore `useraccounts` collection (database `main`).
 * Document id === Firebase Auth uid.
 *
 * Passwords are never stored — Auth holds credentials only.
 */

export const USER_ACCOUNTS_COLLECTION = "useraccounts";

/**
 * @typedef {Object} OrderDetailEntry
 * @property {string} orderId
 * @property {string} [createdAt] ISO timestamp
 * @property {number} [totalUsd]
 * @property {number} [lineCount]
 * @property {string} [status] e.g. completed | pending
 * @property {Record<string, unknown>} [snapshot] optional denormalized slice for quick display
 */

/**
 * @typedef {Object} UserAccountDoc
 * @property {string} uid — same as Auth uid / document id
 * @property {string} email
 * @property {boolean} [admin] — when true, user may access the shop dashboard; defaults false for customers
 * @property {boolean} [guest] — when true, profile has no Firebase Auth user (guest checkout only); false for registered customers and admins
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [phone] — digits-only or formatted; optional
 * @property {Record<string, unknown>} [shippingAddress] — optional saved checkout address (e.g. fullName, address1, city, state, postalCode, country)
 * @property {string[]} orderHistory — order ids (e.g. ORD-…), newest-first recommended by app logic
 * @property {Object<string, OrderDetailEntry>} orderDetails — keyed by order id for lookup
 * @property {import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue} [createdAt]
 * @property {import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue} [updatedAt]
 */
