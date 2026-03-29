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

const INPUT_BASE =
  "mt-1.5 w-full rounded-xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm text-stone-100 placeholder:text-slate-600 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/25";

/**
 * @param {{ open: boolean, onClose: () => void, onSignedIn?: () => void }} props
 */
export default function CheckoutLoginDialog({ open, onClose, onSignedIn }) {
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

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-950 p-6 shadow-2xl transition data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
            Sign in to checkout
          </DialogTitle>
          <p className="mt-2 text-sm text-stone-400">
            We&apos;ll fill in your saved details. You can still edit shipping before
            paying.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="checkout-login-email"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500"
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
                className={INPUT_BASE}
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
              inputClassName="rounded-xl border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm"
            />
            {error ? (
              <p className="text-sm text-rose-300" role="alert">
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
                className="rounded-full border border-slate-600/50 bg-transparent px-6 py-2.5 text-sm font-medium text-stone-300 transition hover:border-amber-400/35 hover:text-stone-100"
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
