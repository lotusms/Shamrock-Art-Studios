"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import PasswordField from "@/components/ui/PasswordField";
import AddressLine1Autocomplete from "@/components/checkout/AddressLine1Autocomplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import SelectListbox from "@/components/ui/SelectListbox";
import {
  digitsFromTelInput,
  formatUsPhoneMask,
  registerUserWithProfile,
  toCheckoutCountry,
} from "@/lib/checkout-auth";
import { CHECKOUT_COUNTRY_OPTIONS } from "@/lib/checkout-countries";
import {
  CA_PROVINCE_SELECT_OPTIONS,
  normalizeStateCodeForPrintful,
  US_STATE_SELECT_OPTIONS,
} from "@/lib/printful/address";

const INPUT_BASE =
  "mt-1.5 w-full rounded-xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm text-stone-100 placeholder:text-slate-600 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/25";

/**
 * @param {{ open: boolean, onClose: () => void, onSuccess: (patch: Record<string, string>) => void }} props
 */
export default function CheckoutCreateAccountDrawer({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setError("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  function handlePhoneChange(e) {
    const digits = digitsFromTelInput(e.target.value);
    setPhone(formatUsPhoneMask(digits));
  }

  function updateCountry(value) {
    setCountry(value);
    setState("");
  }

  function applyAddressSuggestion(suggestion) {
    const nextCountry = suggestion.country
      ? toCheckoutCountry(suggestion.country)
      : country;
    const rawState = String(suggestion.state ?? "").trim() || state;
    const nextState =
      nextCountry === "US" || nextCountry === "CA"
        ? normalizeStateCodeForPrintful(nextCountry, rawState)
        : rawState;

    setAddress1(String(suggestion.address1 ?? "").trim() || address1);
    setCity(String(suggestion.city ?? "").trim() || city);
    setState(nextState || state);
    setPostalCode(String(suggestion.postalCode ?? "").trim() || postalCode);
    setCountry(nextCountry);
  }

  function validateForm() {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!address1.trim()) return "Address line 1 is required.";
    if (!city.trim()) return "City is required.";
    if (!state.trim()) {
      return country === "US"
        ? "Select a state."
        : country === "CA"
          ? "Select a province."
          : "State or region is required.";
    }
    if (!postalCode.trim()) return "Postal code is required.";
    const phoneDigits = digitsFromTelInput(phone);
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      return "Enter all 10 digits for phone, or leave it blank.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await registerUserWithProfile({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        shippingAddress: {
          fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
          address1: address1.trim(),
          address2: address2.trim(),
          city: city.trim(),
          state:
            country === "US" || country === "CA"
              ? normalizeStateCodeForPrintful(country, state)
              : state.trim(),
          postalCode: postalCode.trim(),
          country,
        },
      });

      const auth = getFirebaseAuth();
      await auth.authStateReady();
      if (!auth.currentUser) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      const phoneDigits = digitsFromTelInput(phone);
      onSuccess({
        email: email.trim(),
        phone: phoneDigits ? formatUsPhoneMask(phoneDigits) : "",
        fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
        address1: address1.trim(),
        address2: address2.trim(),
        city: city.trim(),
        state:
          country === "US" || country === "CA"
            ? normalizeStateCodeForPrintful(country, state)
            : state.trim(),
        postalCode: postalCode.trim(),
        country,
      });
      onClose();
    } catch (err) {
      const code = err?.code;
      const msg =
        code === "auth/email-already-in-use"
          ? "That email is already registered. Try signing in instead."
          : code === "auth/weak-password"
            ? "Password is too weak. Use at least 6 characters."
            : err instanceof Error
              ? err.message
              : "Could not create account.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function fieldClass(invalid) {
    return `${INPUT_BASE} ${invalid ? "!border-rose-600 focus:!border-rose-600 focus:!ring-rose-600/35" : ""}`;
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-full flex-col border-l border-slate-700/50 bg-slate-950 shadow-2xl transition data-closed:translate-x-8 data-closed:opacity-0 min-[400px]:max-w-[min(100vw,28rem)] sm:max-w-[min(100vw,36rem)] lg:max-w-[min(100vw-1rem,56rem)] xl:max-w-[min(100vw-2rem,72rem)]"
        >
          <div className="shrink-0 border-b border-slate-700/40 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <DialogTitle className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100 sm:text-2xl">
              Create an account
            </DialogTitle>
            <p className="mt-2 max-w-3xl text-sm text-stone-400">
              Save your details for faster checkout next time. You can review
              everything below before paying.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0 xl:gap-x-14">
                <section className="min-w-0">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Account
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400 sm:col-span-2">
                      Email
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass(false)}
                      />
                    </label>
                    <div className="min-w-0 sm:col-span-1">
                      <PasswordField
                        label="Password"
                        name="new-password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        inputClassName="rounded-xl border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm"
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-1">
                      <PasswordField
                        label="Confirm password"
                        name="confirm-password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        inputClassName="rounded-xl border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm"
                      />
                    </div>
                    <label className="block text-sm text-slate-400">
                      First name
                      <input
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={fieldClass(false)}
                      />
                    </label>
                    <label className="block text-sm text-slate-400">
                      Last name
                      <input
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={fieldClass(false)}
                      />
                    </label>
                    <label className="block text-sm text-slate-400 sm:col-span-2">
                      Phone (optional)
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        value={phone}
                        onChange={handlePhoneChange}
                        className={fieldClass(false)}
                      />
                    </label>
                  </div>
                </section>

                <section className="min-w-0 lg:border-l lg:border-slate-800/80 lg:pl-8 xl:pl-10">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Shipping address
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <AddressLine1Autocomplete
                      value={address1}
                      onChange={setAddress1}
                      country={country}
                      onSelectSuggestion={applyAddressSuggestion}
                      inputClassName={fieldClass(false)}
                      required
                    />
                    <label className="block text-sm text-slate-400">
                      Address line 2
                      <input
                        type="text"
                        autoComplete="address-line2"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                        className={fieldClass(false)}
                      />
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <label className="block text-sm text-slate-400">
                        City
                        <input
                          type="text"
                          autoComplete="address-level2"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={fieldClass(false)}
                        />
                      </label>
                      <div className="min-w-0 xl:col-span-1">
                        {country === "US" ? (
                          <SelectListbox
                            label="State"
                            placeholder="Select state"
                            options={US_STATE_SELECT_OPTIONS}
                            valueKey="code"
                            labelKey="label"
                            by="code"
                            value={state}
                            onChange={(code) => setState(code)}
                            buttonClassName={fieldClass(false)}
                          />
                        ) : country === "CA" ? (
                          <SelectListbox
                            label="Province"
                            placeholder="Select province"
                            options={CA_PROVINCE_SELECT_OPTIONS}
                            valueKey="code"
                            labelKey="label"
                            by="code"
                            value={state}
                            onChange={(code) => setState(code)}
                            buttonClassName={fieldClass(false)}
                          />
                        ) : (
                          <label className="block text-sm text-slate-400">
                            State / region
                            <input
                              type="text"
                              autoComplete="address-level1"
                              required
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className={fieldClass(false)}
                            />
                          </label>
                        )}
                      </div>
                      <label className="block text-sm text-slate-400 sm:col-span-2 xl:col-span-1">
                        {country === "US" ? "ZIP code" : "Postal code"}
                        <input
                          type="text"
                          autoComplete="postal-code"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className={fieldClass(false)}
                        />
                      </label>
                    </div>
                    <div className="sm:max-w-md lg:max-w-none">
                      <SelectListbox
                        label="Country"
                        placeholder="Select country"
                        options={CHECKOUT_COUNTRY_OPTIONS}
                        value={country}
                        onChange={(v) => updateCountry(toCheckoutCountry(v))}
                        buttonClassName={INPUT_BASE}
                      />
                    </div>
                  </div>
                </section>

                {error ? (
                  <p
                    className="text-sm text-rose-300 lg:col-span-2"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-700/40 bg-slate-950/95 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
                <SecondaryButton
                  type="button"
                  onClick={onClose}
                  className="w-full justify-center py-3 sm:w-auto sm:px-6 sm:py-2.5"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={busy}
                  className="w-full min-w-[12rem] justify-center px-8 py-3.5 sm:w-auto"
                >
                  {busy ? "Creating account…" : "Create account & continue"}
                </PrimaryButton>
              </div>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
