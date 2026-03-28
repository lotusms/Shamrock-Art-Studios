/**
 * Order document id for Firestore `orders/{id}`.
 * Format: ORD-{8 lowercase alnum}-{6 uppercase alnum}
 * Example: ORD-mn4j07ha-UEGCAS
 */
const LOWER_ALNUM = "abcdefghijklmnopqrstuvwxyz0123456789";
const UPPER_ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomFromAlphabet(alphabet, len) {
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  const n = alphabet.length;
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % n];
  }
  return out;
}

export function makeOrderId() {
  return `ORD-${randomFromAlphabet(LOWER_ALNUM, 8)}-${randomFromAlphabet(UPPER_ALNUM, 6)}`;
}
