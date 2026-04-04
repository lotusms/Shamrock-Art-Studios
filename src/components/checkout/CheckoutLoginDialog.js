"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useOverlayChrome } from "@/hooks/useOverlayChrome";
import * as overlayChrome from "@/lib/overlayChrome";

/**
 * @param {{ open: boolean, onClose: () => void, onSignedIn?: () => void }} props
 */
export default function CheckoutLoginDialog({ open, onClose, onSignedIn }) {
  const { light } = useOverlayChrome();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setError("");
      setPassword("");
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onClose();
      onSignedIn?.();
    } catch (err) {
      const code = err?.code;
      const msg =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Email or password is incorrect."
          : code === "auth/user-not-found"
            ? "No account found for that email."
            : code === "auth/too-many-requests"
              ? "Too many attempts. Try again shortly."
              : err instanceof Error
                ? err.message
                : "Could not sign in.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const inputBase = overlayChrome.checkoutInputBase(light);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={overlayChrome.checkoutDialogModalPanel(light)}
        >
          <DialogTitle className={overlayChrome.dialogTitleModal(light)}>
            Sign in to checkout
          </DialogTitle>
          <p className={overlayChrome.dialogSubtitle(light)}>
            We&apos;ll fill in your saved details. You can still edit shipping before
            paying.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="checkout-login-email"
                className={overlayChrome.checkoutLabelUppercase(light)}
              >
                Email
              </label>
              <input
                id="checkout-login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </div>
            <PasswordField
              id="checkout-login-password"
              label="Password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              labelClassName={overlayChrome.checkoutLabelUppercase(light)}
              inputClassName={overlayChrome.checkoutPasswordInputClass(light)}
            />
            {error ? (
              <p
                className={light ? "text-sm text-rose-700" : "text-sm text-rose-300"}
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton
                type="submit"
                disabled={busy}
                className="min-w-[8rem] justify-center px-6"
              >
                {busy ? "Signing in…" : "Sign in"}
              </PrimaryButton>
              <button
                type="button"
                onClick={onClose}
                className={overlayChrome.checkoutCancelButton(light)}
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
