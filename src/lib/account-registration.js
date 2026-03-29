import { digitsFromTelInput } from "@/lib/checkout-auth";

/**
 * Validates registration fields aligned with `registerUserWithProfile` / useraccounts doc.
 * @param {{
 *   email: string;
 *   password: string;
 *   confirmPassword: string;
 *   firstName: string;
 *   lastName: string;
 *   phone: string;
 *   address1: string;
 *   city: string;
 *   state: string;
 *   postalCode: string;
 *   country: string;
 * }} fields
 * @returns {string} Error message or "" if valid.
 */
export function validateAccountRegistration(fields) {
  const email = String(fields.email || "").trim();
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    return "Enter a valid email address.";
  }
  const password = String(fields.password || "");
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password !== String(fields.confirmPassword || "")) {
    return "Passwords do not match.";
  }
  if (!String(fields.firstName || "").trim()) return "First name is required.";
  if (!String(fields.lastName || "").trim()) return "Last name is required.";
  if (!String(fields.address1 || "").trim()) return "Address line 1 is required.";
  if (!String(fields.city || "").trim()) return "City is required.";
  const country = String(fields.country || "US");
  if (!String(fields.state || "").trim()) {
    return country === "US"
      ? "Select a state."
      : country === "CA"
        ? "Select a province."
        : "State or region is required.";
  }
  if (!String(fields.postalCode || "").trim()) return "Postal code is required.";
  const phoneDigits = digitsFromTelInput(fields.phone || "");
  if (phoneDigits.length > 0 && phoneDigits.length < 10) {
    return "Enter all 10 digits for phone, or leave it blank.";
  }
  return "";
}
