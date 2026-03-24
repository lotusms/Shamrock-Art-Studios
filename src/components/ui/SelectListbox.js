"use client";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef } from "react";

const DEFAULT_ANCHOR = {
  to: "bottom start",
  gap: 4,
  padding: 8,
};

const FLOATING_PANEL_CLASS =
  "z-50 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-slate-600/60 bg-slate-900 py-1 text-sm text-stone-100 shadow-lg outline-none data-closed:data-leave:opacity-0 data-leave:transition data-leave:duration-100 data-leave:ease-in";

const IN_FLOW_PANEL_CLASS =
  "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-600/60 bg-slate-900 py-1 text-sm text-stone-100 shadow-lg outline-none data-closed:data-leave:opacity-0 data-leave:transition data-leave:duration-100 data-leave:ease-in";

function optionKey(opt, valueKey) {
  return String(opt[valueKey]);
}

function SelectListboxPanel({
  open,
  onMenuClosed,
  label,
  showLabel,
  placeholder,
  options,
  valueKey,
  labelKey,
  selected,
  buttonClassName,
  optionsClassName,
  invalid,
  ariaDescribedBy,
  disabled,
  showCheck,
  anchor,
}) {
  const prevOpen = useRef(false);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (prevOpen.current && !open) onMenuClosed?.();
    prevOpen.current = open;
  }, [open, onMenuClosed]);

  return (
    <>
      {showLabel && label != null && label !== false ? (
        <Label className="block text-sm text-slate-400">{label}</Label>
      ) : null}
      <div className="relative">
        <ListboxButton
          disabled={disabled}
          className={buttonClassName}
          aria-invalid={invalid}
          aria-describedby={ariaDescribedBy}
          onBlur={() => {
            requestAnimationFrame(() => {
              if (!openRef.current) onMenuClosed?.();
            });
          }}
        >
          <span className="col-start-1 row-start-1 truncate pr-6">
            {selected ? selected[labelKey] : placeholder}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          anchor={anchor}
          className={optionsClassName}
        >
          {options.map((opt) => (
            <ListboxOption
              key={optionKey(opt, valueKey)}
              value={opt}
              disabled={Boolean(opt.disabled)}
              className="group relative cursor-default select-none py-2.5 pl-4 pr-10 text-stone-100 data-focus:bg-amber-400/15 data-focus:text-stone-100 data-focus:outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40"
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">
                {opt[labelKey]}
              </span>
              {showCheck ? (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-400/90 group-[:not([data-selected])]:hidden group-data-focus:text-amber-200">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              ) : null}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </>
  );
}

/**
 * Accessible listbox dropdown (Headless UI + Tailwind UI–style).
 * With default `anchor`, the panel uses Floating UI (including flip) so it opens upward when there is not enough space below.
 *
 * Pass `anchor={false}` for a simple absolutely positioned panel the same width as the trigger (no portal / flip).
 */
export default function SelectListbox({
  label,
  showLabel = true,
  placeholder,
  options,
  valueKey = "value",
  labelKey = "label",
  by,
  value,
  onChange,
  invalid,
  ariaDescribedBy,
  onMenuClosed,
  buttonClassName,
  optionsClassName,
  disabled = false,
  showCheck = true,
  anchor,
}) {
  const compareBy = by ?? valueKey;
  const useFloating = anchor !== false;

  const selected = useMemo(() => {
    const v = String(value ?? "").trim();
    if (!v) return null;
    return options.find((o) => String(o[valueKey]) === v) ?? null;
  }, [value, options, valueKey]);

  const handleChange = (opt) => {
    onChange(opt != null ? String(opt[valueKey]) : "");
  };

  const resolvedAnchor =
    !useFloating
      ? false
      : { ...DEFAULT_ANCHOR, ...(anchor && typeof anchor === "object" ? anchor : {}) };

  const resolvedOptionsClassName =
    optionsClassName ?? (useFloating ? FLOATING_PANEL_CLASS : IN_FLOW_PANEL_CLASS);

  return (
    <Listbox
      value={selected}
      onChange={handleChange}
      invalid={invalid}
      by={compareBy}
      disabled={disabled}
    >
      {({ open }) => (
        <SelectListboxPanel
          open={open}
          onMenuClosed={onMenuClosed}
          label={label}
          showLabel={showLabel}
          placeholder={placeholder}
          options={options}
          valueKey={valueKey}
          labelKey={labelKey}
          selected={selected}
          buttonClassName={`grid w-full cursor-default grid-cols-1 text-left ${buttonClassName}`}
          optionsClassName={resolvedOptionsClassName}
          invalid={invalid}
          ariaDescribedBy={ariaDescribedBy}
          disabled={disabled}
          showCheck={showCheck}
          anchor={resolvedAnchor}
        />
      )}
    </Listbox>
  );
}
