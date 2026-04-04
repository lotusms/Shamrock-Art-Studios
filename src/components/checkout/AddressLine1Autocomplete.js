"use client";

import { useEffect, useState } from "react";
import { useOverlayChrome } from "@/hooks/useOverlayChrome";
import * as overlayChrome from "@/lib/overlayChrome";

/**
 * Address line 1 with debounced `/api/address/autocomplete` suggestions (checkout parity).
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(next: string) => void} props.onChange
 * @param {string} props.country
 * @param {(suggestion: { id: string, label: string, address1?: string, city?: string, state?: string, postalCode?: string, country?: string }) => void} props.onSelectSuggestion
 */
export default function AddressLine1Autocomplete({
  className,
  label = "Address line 1",
  value,
  onChange,
  country,
  onSelectSuggestion,
  inputClassName,
  required,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  errorMessage,
  errorId,
  ...divProps
}) {
  const { light } = useOverlayChrome();
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSuggestLoading, setAddressSuggestLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  useEffect(() => {
    const query = String(value || "").trim();
    if (query.length < 4) {
      setAddressSuggestions([]);
      setAddressSuggestLoading(false);
      return;
    }

    let active = true;
    setAddressSuggestLoading(true);
    const timerId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          country,
        });
        const response = await fetch(
          `/api/address/autocomplete?${params.toString()}`,
          { cache: "no-store" },
        );
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        const next = Array.isArray(data?.suggestions) ? data.suggestions : [];
        setAddressSuggestions(next);
      } catch {
        if (!active) return;
        setAddressSuggestions([]);
      } finally {
        if (!active) return;
        setAddressSuggestLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [value, country]);

  function handlePick(item) {
    onSelectSuggestion(item);
    setShowAddressSuggestions(false);
  }

  return (
    <div className={className} {...divProps}>
      <label className={overlayChrome.formFieldLabel(light)}>
        {label}
        <input
          required={required}
          type="text"
          autoComplete="address-line1"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowAddressSuggestions(true);
          }}
          onBlur={onBlur}
          onFocus={() => setShowAddressSuggestions(true)}
          className={inputClassName}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
      </label>
      {showAddressSuggestions && String(value || "").trim().length >= 4 ? (
        <div className={overlayChrome.addressSuggestPanel(light)}>
          {addressSuggestLoading ? (
            <p className={overlayChrome.addressSuggestMuted(light)}>
              Searching addresses...
            </p>
          ) : addressSuggestions.length === 0 ? (
            <p className={overlayChrome.addressSuggestEmpty(light)}>
              No address suggestions.
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {addressSuggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={overlayChrome.addressSuggestItem(light)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePick(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {errorMessage ? (
        <p
          id={errorId}
          className={`mt-1.5 text-xs ${light ? "text-rose-700" : "text-rose-300"}`}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
