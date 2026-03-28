"use client";

import { useId, useState } from "react";
import { RiLockLine, RiLockUnlockLine } from "react-icons/ri";

const INPUT_BASE =
  "w-full rounded-lg border border-white/[0.08] bg-[#0b0f1a] py-2.5 pl-3 pr-11 text-stone-100 outline-none ring-lime-400/30 placeholder:text-slate-600 focus:border-lime-400/50 focus:ring-2";

/**
 * Password input with lock / unlock (line) icons to toggle visibility.
 * Hidden → unlock icon (reveal); visible → lock icon (mask again).
 */
export default function PasswordField({
  id,
  label,
  name = "password",
  value,
  onChange,
  autoComplete = "current-password",
  required = false,
  placeholder = "••••••••",
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "block text-xs font-medium uppercase tracking-wider text-slate-500",
}) {
  const [visible, setVisible] = useState(false);
  const fallbackId = useId();
  const inputId = id ?? `password-${fallbackId}`;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <div className={`relative ${label ? "mt-1.5" : ""}`}>
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${INPUT_BASE} ${inputClassName}`.trim()}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/[0.06] hover:text-lime-400/90 disabled:opacity-40"
        >
          {visible ? (
            <RiLockLine className="size-5 shrink-0" aria-hidden />
          ) : (
            <RiLockUnlockLine className="size-5 shrink-0" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
