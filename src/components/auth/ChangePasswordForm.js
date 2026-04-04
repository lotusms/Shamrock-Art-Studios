"use client";

import Link from "next/link";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

/**
 * @param {{ backHref: string; backLabel: string }} props
 */
export default function ChangePasswordForm({ backHref, backLabel }) {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Choose a new password that differs from your current one.");
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    const email = u?.email;
    if (!u || !email) {
      setError("Sign in again to change your password.");
      return;
    }
    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(u, cred);
      await updatePassword(u, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      const code = err?.code;
      const msg =
        code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "Current password is incorrect."
          : code === "auth/weak-password"
            ? "New password is too weak. Use at least 6 characters."
            : code === "auth/too-many-requests"
              ? "Too many attempts. Try again shortly."
              : code === "auth/requires-recent-login"
                ? "For security, sign out and sign in again, then change your password."
                : err instanceof Error
                  ? err.message
                  : "Could not update password.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={dash.changePasswordFormShell(light)}
      >
        {success ? (
          <p className={dash.changePasswordSuccess(light)} role="status">
            Your password was updated. Use it next time you sign in.
          </p>
        ) : null}
        {error ? (
          <p className={overlayChrome.authInlineError(light)} role="alert">
            {error}
          </p>
        ) : null}

        <PasswordField
          id="current-password"
          label="Current password"
          name="current-password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          labelClassName={overlayChrome.formFieldLabel(light)}
          inputClassName={overlayChrome.authPasswordInputOverride(light)}
        />
        <PasswordField
          id="new-password"
          label="New password"
          name="new-password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          labelClassName={overlayChrome.formFieldLabel(light)}
          inputClassName={overlayChrome.authPasswordInputOverride(light)}
        />
        <PasswordField
          id="confirm-new-password"
          label="Confirm new password"
          name="confirm-new-password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          labelClassName={overlayChrome.formFieldLabel(light)}
          inputClassName={overlayChrome.authPasswordInputOverride(light)}
        />

        <PrimaryButton
          type="submit"
          disabled={busy}
          className="mt-4 w-full justify-center py-3.5"
        >
          {busy ? "Updating…" : "Update password"}
        </PrimaryButton>
      </form>

      <p className={`mt-8 text-center text-sm ${overlayChrome.authFooterMuted(light)}`}>
        <Link href={backHref} className={overlayChrome.authLinkAccent(light)}>
          ← {backLabel}
        </Link>
      </p>
    </>
  );
}
