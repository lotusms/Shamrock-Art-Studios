"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import AddressLine1Autocomplete from "@/components/checkout/AddressLine1Autocomplete";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import SelectListbox from "@/components/ui/SelectListbox";
import { useOverlayChrome } from "@/hooks/useOverlayChrome";
import * as overlayChrome from "@/lib/overlayChrome";
import { validateAccountRegistration } from "@/lib/account-registration";
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

/**
 * @param {{
 *   variant: "page" | "drawer";
 *   onCancel?: () => void;
 *   onRegistered?: (patch: Record<string, string>) => void;
 * }} props
 */
export default function RegisterAccountForm({
  variant = "page",
  onCancel,
  onRegistered,
}) {
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

  const { light } = useOverlayChrome();
  const INPUT_BASE = overlayChrome.checkoutInputBase(light);

  function fieldClass(invalid) {
    return `${INPUT_BASE} ${invalid ? "!border-rose-600 focus:!border-rose-600 focus:!ring-rose-600/35" : ""}`;
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validateAccountRegistration({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      address1,
      city,
      state,
      postalCode,
      country,
    });
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
      onRegistered?.({
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

  const formBody = (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0 xl:gap-x-14">
        <section className="min-w-0">
          <h3 className={overlayChrome.formSectionHeading(light)}>
            Account
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${overlayChrome.formFieldLabel(light)} sm:col-span-2`}>
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
                labelClassName={overlayChrome.formFieldLabel(light)}
                inputClassName={overlayChrome.checkoutPasswordInputClass(light)}
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
                labelClassName={overlayChrome.formFieldLabel(light)}
                inputClassName={overlayChrome.checkoutPasswordInputClass(light)}
              />
            </div>
            <label className={overlayChrome.formFieldLabel(light)}>
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
            <label className={overlayChrome.formFieldLabel(light)}>
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
            <label className={`${overlayChrome.formFieldLabel(light)} sm:col-span-2`}>
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

        <section className={overlayChrome.formSectionColumnBorder(light)}>
          <h3 className={overlayChrome.formSectionHeading(light)}>
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
            <label className={overlayChrome.formFieldLabel(light)}>
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
              <label className={overlayChrome.formFieldLabel(light)}>
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
                  <label className={overlayChrome.formFieldLabel(light)}>
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
              <label
                className={`${overlayChrome.formFieldLabel(light)} sm:col-span-2 xl:col-span-1`}
              >
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
          <p className={overlayChrome.registerErrorText(light)} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );

  const footer = (
    <div className={overlayChrome.registerFormFooter(light)}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
        {variant === "drawer" && onCancel ? (
          <SecondaryButton
            type="button"
            onClick={onCancel}
            className={`w-full justify-center py-3 sm:w-auto sm:px-6 sm:py-2.5 ${overlayChrome.secondaryButtonLightOutline(light)}`.trim()}
          >
            Cancel
          </SecondaryButton>
        ) : null}
        {variant === "page" ? (
          <SecondaryButton
            type="button"
            href="/login"
            className={`w-full justify-center py-3 sm:w-auto sm:px-6 sm:py-2.5 ${overlayChrome.secondaryButtonLightOutline(light)}`.trim()}
          >
            Back to sign in
          </SecondaryButton>
        ) : null}
        <PrimaryButton
          type="submit"
          disabled={busy}
          className="w-full min-w-[12rem] justify-center px-8 py-3.5 sm:w-auto"
        >
          {busy ? "Creating account…" : "Create account"}
        </PrimaryButton>
      </div>
    </div>
  );

  if (variant === "drawer") {
    return (
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        {formBody}
        {footer}
      </form>
    );
  }

  return (
    <form
      id="register-account-form"
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      {formBody}
      {footer}
    </form>
  );
}
