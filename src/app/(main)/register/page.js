"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterAccountForm from "@/components/auth/RegisterAccountForm";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, accountLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || accountLoading) return;
    router.replace(isAdmin ? "/dashboard" : "/account");
  }, [user, loading, accountLoading, isAdmin, router]);

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
        <Link
          href={isAdmin ? "/dashboard" : "/account"}
          className="font-semibold text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-8">
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-serif text-3xl font-medium tracking-[-0.03em] text-stone-100 sm:text-4xl">
            Create account
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
            Set up your collector profile with contact details and a default
            shipping address. You can update these anytime in My Account.
          </p>
          <p className="mt-4 text-sm text-stone-500">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 shadow-2xl shadow-slate-950/50 ring-1 ring-slate-500/15">
          <RegisterAccountForm
            variant="page"
            onRegistered={() => router.replace("/account")}
          />
        </div>
      </div>
    </div>
  );
}
