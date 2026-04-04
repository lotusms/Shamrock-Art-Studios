"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterAccountForm from "@/components/auth/RegisterAccountForm";
import { useAuth } from "@/context/AuthContext";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

export default function RegisterPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const router = useRouter();
  const { user, loading, accountLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || accountLoading) return;
    router.replace(isAdmin ? "/dashboard" : "/account");
  }, [user, loading, accountLoading, isAdmin, router]);

  const muted = overlayChrome.pageMutedText(light);

  if (loading) {
    return (
      <div className={`flex min-h-dvh items-center justify-center ${muted}`}>
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (user && accountLoading) {
    return (
      <div
        className={`flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center ${muted}`}
      >
        <p className="text-sm tracking-wide">Loading your account…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div
        className={`flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center ${muted}`}
      >
        <p className="text-sm tracking-wide">
          Opening {isAdmin ? "the portal" : "your account"}…
        </p>
        <Link
          href={isAdmin ? "/dashboard" : "/account"}
          className={overlayChrome.authLinkAccent(light)}
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-8">
        <div className="shrink-0 text-center sm:text-left">
          <p className={overlayChrome.registerHeroTitle(light)}>Create account</p>
          <p className={overlayChrome.registerHeroBody(light)}>
            Set up your collector profile with contact details and a default
            shipping address. You can update these anytime in My Account.
          </p>
          <p className={overlayChrome.registerHeroMeta(light)}>
            Already registered?{" "}
            <Link href="/login" className={overlayChrome.authLinkAccent(light)}>
              Sign in
            </Link>
          </p>
        </div>

        <div className={overlayChrome.registerFormShell(light)}>
          <RegisterAccountForm
            variant="page"
            onRegistered={() => router.replace("/account")}
          />
        </div>
      </div>
    </div>
  );
}
