"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { orgName } from "@/config";

export default function LoginPage() {
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

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (user && accountLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-stone-400">
        <p className="text-sm tracking-wide">Loading your account…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center text-stone-400">
        <p className="text-sm tracking-wide">
          Opening {isAdmin ? "the portal" : "your account"}…
        </p>
        <p className="max-w-sm text-xs text-stone-500">
          Stuck here? Continue manually:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href={isAdmin ? "/dashboard" : "/account"}
            className="font-semibold text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100"
          >
            {isAdmin ? "Go to portal" : "Go to My Account"}
          </Link>
          <Link href="/" className="text-stone-500 transition hover:text-stone-300">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-md ring-1 ring-slate-500/15">
        <p className="font-serif text-3xl font-medium tracking-[-0.03em] text-stone-100">
          Sign in
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-300/95">
          Use the email and password for your {orgName} account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500"
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
              className="mt-1.5 w-full rounded-lg border border-slate-600/40 bg-slate-950/80 px-3 py-2.5 text-stone-100 outline-none ring-amber-400/25 placeholder:text-slate-600 focus:border-amber-400/45 focus:ring-2"
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
          />

          {error ? (
            <p className="text-sm text-red-400/90" role="alert">
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

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-stone-500">
          <Link
            href="/forgot-password"
            className="font-medium text-amber-200/95 underline decoration-amber-400/35 underline-offset-4 transition hover:text-amber-100"
          >
            Forgot password?
          </Link>
          <p>
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-amber-200/95 underline decoration-amber-400/35 underline-offset-4 transition hover:text-amber-100"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-stone-500">
          <Link
            href="/"
            className="font-medium text-amber-200/95 transition hover:text-amber-100"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
