"use client";

import { useSyncExternalStore } from "react";
import { ACTIVE_THEME_ID } from "@/theme";

function subscribe(onChange) {
  const el = document.documentElement;
  const mo = new MutationObserver(onChange);
  mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function getSnapshot() {
  return document.documentElement.dataset.theme || ACTIVE_THEME_ID;
}

function getServerSnapshot() {
  return ACTIVE_THEME_ID;
}

/** Tracks `html[data-theme]` so client components match the active visual theme. */
export function useDocumentThemeId() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
