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
 * @property {string} firstName
 * @property {string} lastName
 * @property {string[]} orderHistory — order ids (e.g. ORD-…), newest-first recommended by app logic
 * @property {Object<string, OrderDetailEntry>} orderDetails — keyed by order id for lookup
 * @property {import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue} [createdAt]
 * @property {import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue} [updatedAt]
 */
