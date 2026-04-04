"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { orgName } from "@/config";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

export default function LoginPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const { user, loading, accountLoading, isAdmin, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || accountLoading) return;
    router.replace(isAdmin ? "/dashboard" : "/account");
  }, [user, loading, accountLoading, isAdmin, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Sign-in failed. Check Email/Password in Firebase Console.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

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
        <p className="max-w-sm text-xs text-stone-500">
          Stuck here? Continue manually:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href={isAdmin ? "/dashboard" : "/account"}
            className={overlayChrome.authLinkAccent(light)}
          >
            {isAdmin ? "Go to portal" : "Go to My Account"}
          </Link>
          <Link
            href="/"
            className={
              light
                ? "text-stone-600 transition hover:text-stone-900"
                : "text-stone-500 transition hover:text-stone-300"
            }
          >
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className={overlayChrome.authCardPanel(light)}>
        <p className={overlayChrome.authTitle(light)}>Sign in</p>
        <p className={overlayChrome.authSubtitle(light)}>
          Use the email and password for your {orgName} account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label
              htmlFor="login-email"
              className={overlayChrome.authLabelUppercase(light)}
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={overlayChrome.authEmailInput(light)}
              placeholder="you@example.com"
            />
          </div>
          <PasswordField
            id="login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            labelClassName={overlayChrome.authLabelUppercase(light)}
            inputClassName={overlayChrome.authPasswordInputOverride(light)}
          />

          {error ? (
            <p className={overlayChrome.authInlineError(light)} role="alert">
              {error}
            </p>
          ) : null}

          <PrimaryButton
            type="submit"
            disabled={submitting}
            className="mt-2 w-full justify-center"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </PrimaryButton>
        </form>

        <div
          className={`mt-6 flex flex-col gap-3 text-center text-sm ${overlayChrome.authFooterMuted(light)}`}
        >
          <Link href="/forgot-password" className={overlayChrome.authLinkAccent(light)}>
            Forgot password?
          </Link>
          <p>
            New here?{" "}
            <Link href="/register" className={overlayChrome.authLinkAccent(light)}>
              Create an account
            </Link>
          </p>
        </div>

        <p
          className={`mt-8 text-center text-sm ${overlayChrome.authFooterMuted(light)}`}
        >
          <Link href="/" className={overlayChrome.authLinkAccent(light)}>
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
