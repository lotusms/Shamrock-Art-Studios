"use client";

import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "@firebase/client";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";

export default function ForgotPasswordPage() {
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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-md ring-1 ring-slate-500/15">
        <p className="font-serif text-3xl font-medium tracking-[-0.03em] text-stone-100">
          Forgot password
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-300/95">
          Enter the email for your account. We&apos;ll send a link to reset your
          password.
        </p>

        {done ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100/95">
              Check your inbox for a message from us. Follow the link to choose a
              new password, then return here to{" "}
              <Link
                href="/login"
                className="font-medium text-amber-200/95 underline decoration-amber-400/40 underline-offset-4"
              >
                sign in
              </Link>
              .
            </p>
            <SecondaryButton href="/login" className="w-full justify-center py-3">
              Back to sign in
            </SecondaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500"
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
                className="mt-1.5 w-full rounded-lg border border-slate-600/40 bg-slate-950/80 px-3 py-2.5 text-stone-100 outline-none ring-amber-400/25 placeholder:text-slate-600 focus:border-amber-400/45 focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-400/90" role="alert">
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

        <p className="mt-8 text-center text-sm text-stone-500">
          <Link
            href="/login"
            className="font-medium text-amber-200/95 transition hover:text-amber-100"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
