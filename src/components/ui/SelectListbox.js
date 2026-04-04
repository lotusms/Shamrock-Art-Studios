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
import { useOverlayChrome } from "@/hooks/useOverlayChrome";
import * as overlayChrome from "@/lib/overlayChrome";

const DEFAULT_ANCHOR = {
  to: "bottom start",
  gap: 4,
  padding: 8,
};

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
  optionClassName,
  checkIconClassName,
  labelClassName,
  chevronClassName,
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
        <Label className={labelClassName}>{label}</Label>
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
            className={chevronClassName}
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
              className={optionClassName}
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">
                {opt[labelKey]}
              </span>
              {showCheck ? (
                <span className={checkIconClassName}>
                  <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
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

  const { light } = useOverlayChrome();

  const resolvedOptionsClassName =
    optionsClassName ??
    (useFloating
      ? overlayChrome.listboxFloatingPanel(light)
      : overlayChrome.listboxInFlowPanel(light));

  const resolvedLabelClassName = overlayChrome.formFieldLabel(light);
  const resolvedChevronClassName = overlayChrome.selectChevron(light);
  const resolvedOptionClassName = overlayChrome.listboxOption(light);
  const resolvedCheckClassName = overlayChrome.listboxCheckIcon(light);

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
          labelClassName={resolvedLabelClassName}
          chevronClassName={resolvedChevronClassName}
          optionClassName={resolvedOptionClassName}
          checkIconClassName={resolvedCheckClassName}
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
