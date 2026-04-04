"use client";

import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

export default function ForgotPasswordPage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, trimmed, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setDone(true);
    } catch (err) {
      const code = err?.code;
      const msg =
        code === "auth/user-not-found"
          ? "No account uses that email. Try creating an account or check the spelling."
          : code === "auth/invalid-email"
            ? "That email address is not valid."
            : err instanceof Error
              ? err.message
              : "Could not send reset email.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className={overlayChrome.authCardPanel(light)}>
        <p className={overlayChrome.authTitle(light)}>Forgot password</p>
        <p className={overlayChrome.authSubtitle(light)}>
          Enter the email for your account. We&apos;ll send a link to reset your
          password.
        </p>

        {done ? (
          <div className="mt-8 space-y-4">
            <p className={overlayChrome.forgotSuccessBanner(light)}>
              Check your inbox for a message from us. Follow the link to choose a
              new password, then return here to{" "}
              <Link href="/login" className={overlayChrome.forgotSuccessBannerLink(light)}>
                sign in
              </Link>
              .
            </p>
            <SecondaryButton
              href="/login"
              className={`w-full justify-center py-3 ${overlayChrome.secondaryButtonLightOutline(light)}`.trim()}
            >
              Back to sign in
            </SecondaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label
                htmlFor="forgot-email"
                className={overlayChrome.authLabelUppercase(light)}
              >
                Email
              </label>
              <input
                id="forgot-email"
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
            {error ? (
              <p className={overlayChrome.authInlineError(light)} role="alert">
                {error}
              </p>
            ) : null}
            <PrimaryButton
              type="submit"
              disabled={busy}
              className="mt-2 w-full justify-center"
            >
              {busy ? "Sending…" : "Send reset link"}
            </PrimaryButton>
          </form>
        )}

        <p
          className={`mt-8 text-center text-sm ${overlayChrome.authFooterMuted(light)}`}
        >
          <Link href="/login" className={overlayChrome.authLinkAccent(light)}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
