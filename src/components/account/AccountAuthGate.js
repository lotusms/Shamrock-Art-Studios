"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function GateEscapeBar() {
  return (
    <div className="pointer-events-auto fixed left-0 right-0 top-0 z-[9999] flex justify-end gap-4 border-b border-white/[0.06] bg-slate-950/95 px-4 py-2 text-xs backdrop-blur-md">
      <Link
        href="/"
        className="font-medium text-amber-200/95 transition hover:text-amber-100"
      >
        Home
      </Link>
      <Link href="/login" className="text-stone-500 transition hover:text-stone-300">
        Sign in
      </Link>
    </div>
  );
}

export default function AccountAuthGate({ children }) {
  const { user, loading, accountLoading, isAdmin, signingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || accountLoading) return;
    if (!user && !signingOut) {
      router.replace("/login");
      return;
    }
    if (user && isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, loading, accountLoading, isAdmin, signingOut, router]);

  if (loading) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Loading…</p>
        </div>
      </>
    );
  }

  if (!user && signingOut) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Signing out…</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Redirecting to sign in…</p>
        </div>
      </>
    );
  }

  if (accountLoading) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Loading your account…</p>
        </div>
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Opening the portal…</p>
        </div>
      </>
    );
  }

  return children;
}
