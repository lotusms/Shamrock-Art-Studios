"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { orgName } from "@/config";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

export default function DashboardChangePasswordPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);

  return (
    <div className="relative mx-auto max-w-lg">
      <p
        className={
          light
            ? "text-xs font-medium uppercase tracking-[0.35em] text-amber-800/95"
            : "text-xs font-medium uppercase tracking-[0.35em] text-amber-400/90"
        }
      >
        Security
      </p>
      <h1 className={`mt-4 font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl ${light ? "text-stone-900" : "text-stone-50"}`}>
        Change password
      </h1>
      <p
        className={
          light
            ? "mt-4 text-sm leading-relaxed text-stone-700"
            : "mt-4 text-sm leading-relaxed text-stone-400"
        }
      >
        Enter your current password, then choose a new one. This updates your
        sign-in for {orgName} only.
      </p>

      <ChangePasswordForm backHref="/dashboard" backLabel="Back to Dashboard" />
    </div>
  );
}
