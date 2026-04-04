"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

function GateEscapeBar() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  return (
    <div className={dash.authGateBar(light)}>
      <Link href="/" className={dash.authGateLink(light)}>
        Home
      </Link>
      <Link href="/login" className={dash.authGateMutedLink(light)}>
        Sign in
      </Link>
    </div>
  );
}

export default function DashboardAuthGate({ children }) {
  const { user, loading, accountLoading, isAdmin, signingOut } = useAuth();
  const router = useRouter();
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const muted = overlayChrome.pageMutedText(light);

  useEffect(() => {
    if (loading || accountLoading) return;
    if (!user && !signingOut) {
      router.replace("/login");
      return;
    }
    if (user && !isAdmin) {
      router.replace("/account");
    }
  }, [user, loading, accountLoading, isAdmin, signingOut, router]);

  if (loading || accountLoading) {
    return (
      <>
        <GateEscapeBar />
        <div className={`flex min-h-dvh items-center justify-center ${muted}`}>
          <p className="text-sm tracking-wide">Loading…</p>
        </div>
      </>
    );
  }

  if (!user && signingOut) {
    return (
      <>
        <GateEscapeBar />
        <div className={`flex min-h-dvh items-center justify-center ${muted}`}>
          <p className="text-sm tracking-wide">Signing out…</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GateEscapeBar />
        <div className={`flex min-h-dvh items-center justify-center ${muted}`}>
          <p className="text-sm tracking-wide">Redirecting to sign in…</p>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <GateEscapeBar />
        <div className={`flex min-h-dvh items-center justify-center ${muted}`}>
          <p className="text-sm tracking-wide">Opening your account…</p>
        </div>
      </>
    );
  }

  return children;
}
