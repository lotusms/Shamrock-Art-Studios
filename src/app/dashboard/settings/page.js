"use client";

import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import { isLightThemeId } from "@/theme";

export default function DashboardSettingsPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className={dash.dashboardPageTitle(light)}>Settings</h1>
      <p className={`mt-3 max-w-2xl ${dash.dashboardPageSubtitle(light)}`}>
        Studio preferences and integrations can live here.
      </p>
    </div>
  );
}
