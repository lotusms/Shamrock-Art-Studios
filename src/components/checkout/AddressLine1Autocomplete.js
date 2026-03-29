"use client";

import { useEffect, useState } from "react";

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
      <label className="block text-sm text-slate-400">
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
        <div className="mt-2 rounded-xl border border-slate-700/70 bg-slate-950/95 p-2">
          {addressSuggestLoading ? (
            <p className="px-3 py-2 text-xs text-slate-400">
              Searching addresses...
            </p>
          ) : addressSuggestions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">
              No address suggestions.
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {addressSuggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-200 transition hover:bg-slate-800/80"
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
          className="mt-1.5 text-xs text-rose-300"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
