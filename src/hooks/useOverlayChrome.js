"use client";

import { useMemo } from "react";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

/** Theme-aware class fragments for overlays, dialogs, and dropdown panels. */
export function useOverlayChrome() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  return useMemo(() => ({ light, themeId }), [light, themeId]);
}
